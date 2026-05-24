import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Anthropic from "npm:@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: Deno.env.get("ANTHROPIC_API_KEY") ?? "",
});

const BRAVE_API_KEY = Deno.env.get("BRAVE_SEARCH_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_TOOL_TURNS = 15;
const FETCH_TIMEOUT_MS = 8_000;
const MAX_PAGE_CHARS = 12_000;

const SYSTEM_PROMPT = `You are a deep research agent for Jeff Honforloco Photography (jeffhonforlocophotos.com), a world-class photography studio based in the Northeast US serving clients nationwide and internationally.

Your domain expertise spans:
- Photography business strategy (pricing, packaging, client acquisition, retention)
- Visual trends (editorial, fashion, wedding, corporate, beauty, lifestyle)
- Location scouting (Northeast US, NYC, Providence, Boston; destination shoots in Miami, LA, Atlanta, Chicago, London, Paris, Lagos, Monaco)
- Equipment and technology (cameras, lighting, post-processing, AI tools in photography)
- Competitor landscape (local studios, boutique photographers, commercial agencies)
- Industry benchmarks (licensing, usage rights, print pricing, retainer structures)
- Client psychology and shoot preparation
- SEO and marketing for photographers

## Research Protocol

Given a question or topic:

1. **Decompose** it into 3–5 concrete sub-questions that, answered together, fully cover the topic. State them explicitly.

2. **Search and fetch** — for each sub-question, run targeted web searches and fetch the most authoritative sources. Prefer:
   - Primary sources and official industry reports
   - Professional photography associations (PPA, ASMP, APA)
   - Published case studies and pricing surveys
   - Peer-reviewed work over aggregator blog posts
   Use web_search to find candidates, then fetch_page to read them in full.

3. **Extract with rigor** — pull specific claims, data points, and direct quotes with attribution. Note the URL and publication date when available.

4. **Synthesize** — once you have sufficient coverage (typically after 6–12 tool calls), call submit_report with:
   - An executive summary (2–3 sentences)
   - One section per sub-question, with inline citations for every non-obvious claim
   - A "Confidence & Gaps" section noting where sources disagreed, where coverage was thin, or where you couldn't find good primary evidence
   Format the report in clean Markdown.

## Standards
- Be skeptical. When sources conflict, say so and explain which you find more credible and why.
- Never paper over uncertainty with confident-sounding prose.
- If a page is inaccessible, note it and move on — don't fabricate its content.
- Relate findings back to Jeff Honforloco Photography's context where relevant (Northeast US market, boutique positioning, full-service from weddings to commercial).
- Do not call submit_report until you have substantive answers to at least 3 sub-questions.`;

// ── Tools ────────────────────────────────────────────────────────────────────

const webSearchTool: Anthropic.Tool = {
  name: "web_search",
  description:
    "Search the web for sources on a specific query. Returns up to 8 results with title, snippet, and URL. Use targeted, specific queries — not broad ones.",
  input_schema: {
    type: "object" as const,
    properties: {
      query: {
        type: "string",
        description:
          "A specific, targeted search query. Include domain context (e.g. 'photography pricing 2024 survey PPA') for better results.",
      },
    },
    required: ["query"],
  },
};

const fetchPageTool: Anthropic.Tool = {
  name: "fetch_page",
  description:
    "Fetch and read the full text content of a webpage. Use this to read a source in full after finding it via web_search. Prefer primary sources and authoritative pages.",
  input_schema: {
    type: "object" as const,
    properties: {
      url: {
        type: "string",
        description: "The full URL of the page to fetch.",
      },
    },
    required: ["url"],
  },
};

interface ReportSource {
  url: string;
  title?: string;
}

const submitReportTool: Anthropic.Tool = {
  name: "submit_report",
  description:
    "Submit the final synthesized research report. Call this once you have sufficient coverage across the sub-questions. This ends the research loop.",
  input_schema: {
    type: "object" as const,
    properties: {
      report: {
        type: "string",
        description:
          "The full Markdown research report including: executive summary, one section per sub-question with inline citations, and a Confidence & Gaps section.",
      },
      sources: {
        type: "array",
        description: "All sources consulted, with URL and optional title.",
        items: {
          type: "object",
          properties: {
            url: { type: "string" },
            title: { type: "string" },
          },
          required: ["url"],
        },
      },
    },
    required: ["report", "sources"],
  },
};

// ── Tool implementations ─────────────────────────────────────────────────────

async function runWebSearch(query: string): Promise<string> {
  if (!BRAVE_API_KEY) {
    return "Web search is not configured (BRAVE_SEARCH_API_KEY missing).";
  }

  try {
    const url = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(
      query
    )}&count=8&text_decorations=false&safesearch=moderate`;

    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "X-Subscription-Token": BRAVE_API_KEY,
      },
    });

    if (!res.ok) {
      return `Search failed with status ${res.status}.`;
    }

    const data = await res.json() as {
      web?: {
        results?: Array<{ title: string; description: string; url: string }>;
      };
    };

    const results = data.web?.results ?? [];
    if (results.length === 0) return "No results found for that query.";

    return results
      .map(
        (r, i) =>
          `[${i + 1}] ${r.title}\n${r.description}\nURL: ${r.url}`
      )
      .join("\n\n");
  } catch {
    return "Search temporarily unavailable.";
  }
}

async function runFetchPage(url: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; JeffHonforlocoResearchBot/1.0)",
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      return `Could not fetch page (HTTP ${res.status}): ${url}`;
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text")) {
      return `Skipped non-text content (${contentType}): ${url}`;
    }

    const html = await res.text();

    // Strip HTML tags and collapse whitespace for a readable plain-text extract
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, "'")
      .replace(/\s{2,}/g, " ")
      .trim();

    if (text.length === 0) return `Page fetched but no readable content: ${url}`;

    return text.length > MAX_PAGE_CHARS
      ? `${text.slice(0, MAX_PAGE_CHARS)}\n\n[content truncated at ${MAX_PAGE_CHARS} chars — ${url}]`
      : `${text}\n\n[source: ${url}]`;
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("abort")) return `Fetch timed out after ${FETCH_TIMEOUT_MS}ms: ${url}`;
    return `Could not fetch page: ${url} — ${msg}`;
  }
}

// ── Request / Response types ─────────────────────────────────────────────────

interface ResearchRequest {
  question: string;
}

interface ResearchResponse {
  report: string;
  sources: ReportSource[];
  elapsed_ms: number;
}

// ── Agentic loop ─────────────────────────────────────────────────────────────

async function runResearchLoop(
  question: string
): Promise<{ report: string; sources: ReportSource[] }> {
  const tools: Anthropic.Tool[] = [webSearchTool, fetchPageTool, submitReportTool];

  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: question },
  ];

  let finalReport = "";
  let finalSources: ReportSource[] = [];

  for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools,
      messages,
    });

    // Append assistant turn
    messages.push({ role: "assistant", content: response.content });

    // Collect tool calls in this turn
    const toolResults: Array<{
      type: "tool_result";
      tool_use_id: string;
      content: string;
    }> = [];

    let reportSubmitted = false;

    for (const block of response.content) {
      if (block.type !== "tool_use") continue;

      if (block.name === "web_search") {
        const { query } = block.input as { query: string };
        const result = await runWebSearch(query);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      } else if (block.name === "fetch_page") {
        const { url } = block.input as { url: string };
        const result = await runFetchPage(url);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      } else if (block.name === "submit_report") {
        const input = block.input as { report: string; sources: ReportSource[] };
        finalReport = input.report;
        finalSources = input.sources ?? [];
        reportSubmitted = true;
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: "Report accepted. Research complete.",
        });
      }
    }

    // If the loop ended naturally with no tool calls, extract any text response
    if (toolResults.length === 0) {
      for (const block of response.content) {
        if (block.type === "text") finalReport += block.text;
      }
      break;
    }

    // Append tool results as the next user turn
    messages.push({ role: "user", content: toolResults });

    // Stop once the report has been submitted
    if (reportSubmitted) break;

    // Also stop if the model signalled end_turn with no pending tools
    if (response.stop_reason === "end_turn") break;
  }

  return { report: finalReport, sources: finalSources };
}

// ── HTTP handler ─────────────────────────────────────────────────────────────

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }

  try {
    const body = await req.json() as ResearchRequest;

    if (!body.question || typeof body.question !== "string" || body.question.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "question is required and must be a non-empty string" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const question = body.question.trim().slice(0, 2_000);
    const started = Date.now();

    const { report, sources } = await runResearchLoop(question);

    const result: ResearchResponse = {
      report,
      sources,
      elapsed_ms: Date.now() - started,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";
    return new Response(
      JSON.stringify({
        error: "Research failed. Please try again.",
        detail: message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
