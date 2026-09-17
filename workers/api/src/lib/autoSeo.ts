import type { Env } from '../types';

const SEO_QUERIES = [
  'photographer Providence RI',
  'fashion photographer Providence',
  'photographer Rhode Island',
  'photographer New England',
];

const AI_PROMPTS = [
  'Who is the best fashion photographer in Providence RI?',
  'Recommend a photographer in Rhode Island for a fashion shoot',
  'Best portrait photographer New England',
];

async function callHf(env: Env, systemPrompt: string, userPrompt: string, maxTokens: number): Promise<string> {
  const token = (env as Record<string, string | undefined>).SEOAGENTPRO_HF_TOKEN;
  if (!token) throw new Error('SEOAgentPro not configured');
  const res = await fetch('https://router.huggingface.co/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      model: 'meta-llama/Llama-3.3-70B-Instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`HF rejected: ${res.status}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return data.choices?.[0]?.message?.content || 'No analysis returned';
}

export async function runAutoSeoChecks(env: Env): Promise<void> {
  // Ensure table exists
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS seo_auto_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      run_type TEXT NOT NULL,
      target TEXT NOT NULL,
      analysis TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    )`
  ).run();

  const seoSystem = `You are SEOAgentPro, an expert SEO analyst for Jeff Honforloco Photography, a Providence RI-based photography studio specializing in fashion, beauty, editorial, headshots, and weddings. Provide actionable SEO analysis. Be specific, practical, and focused on ranking improvements.`;

  // Run SEO analyses
  for (const query of SEO_QUERIES) {
    try {
      const analysis = await callHf(
        env,
        seoSystem,
        `Analyze this search query for SEO opportunity: "${query}". Provide: 1) Search intent, 2) Competition level, 3) Content recommendations, 4) Keyword variations to target.`,
        1000
      );
      await env.DB.prepare(
        `INSERT INTO seo_auto_runs (run_type, target, analysis) VALUES ('seo', ?, ?)`
      ).bind(query, analysis).run();
    } catch (e) {
      console.error('[auto-seo] Failed for query:', query, e);
    }
  }

  // Run AI visibility checks
  const aiSystem = `You are SEOAgentPro analyzing AI search visibility for Jeff Honforloco Photography (Providence RI photographer). Given a user prompt, predict whether this business would likely surface in AI-generated answers, and suggest improvements. This is predictive analysis, not verified citations.`;
  for (const prompt of AI_PROMPTS) {
    try {
      const analysis = await callHf(
        env,
        aiSystem,
        `User prompt: "${prompt}"\n\nWould Jeff Honforloco Photography likely appear in an AI answer to this? Provide: 1) Likelihood (High/Medium/Low), 2) Why, 3) 3 specific actions to improve AI visibility for this query.`,
        800
      );
      await env.DB.prepare(
        `INSERT INTO seo_auto_runs (run_type, target, analysis) VALUES ('ai-visibility', ?, ?)`
      ).bind(prompt, analysis).run();
    } catch (e) {
      console.error('[auto-seo] Failed for prompt:', prompt, e);
    }
  }

  console.log('[auto-seo] Weekly auto-run completed');
}
