import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Camera, CheckCircle } from "lucide-react";
import { apiService } from "@/lib/api-service";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface StoredSession {
  messages: Message[];
  savedAt: number;
}

interface ChatResponse {
  message: string;
  leadCaptured?: boolean;
  needsApproval?: boolean;
}

// Prefer explicit chatbot URL; fall back to API base URL if configured
const CHATBOT_URL: string | undefined =
  (import.meta.env.VITE_CHATBOT_URL as string | undefined) ||
  (import.meta.env.VITE_API_BASE_URL
    ? `${import.meta.env.VITE_API_BASE_URL}/chat`
    : undefined);
const STORAGE_KEY = "jhp_chat_v2";
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function playChime() {
  try {
    const ctx = new AudioContext();
    [[520, 0], [660, 0.18]].forEach(([freq, delay]) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const t = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.28, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      osc.start(t);
      osc.stop(t + 0.55);
    });
  } catch {
    // AudioContext blocked by browser autoplay policy — skip silently
  }
}

const INITIAL_GREETING =
  "Hey! I'm the studio AI for Jeff Honforloco Photography — based in New England, available across the US, and we travel for the right project. Sessions start at $649 and we customize everything. What are you planning?";

const SERVICE_CHIPS = [
  { label: "Headshots", icon: "📸" },
  { label: "Wedding", icon: "💍" },
  { label: "Engagement", icon: "💕" },
  { label: "Sweet Sixteen", icon: "🎉" },
  { label: "Beauty / Fashion", icon: "✨" },
  { label: "Real Estate", icon: "🏠" },
  { label: "Motion Video", icon: "🎬" },
  { label: "Corporate Event", icon: "🎯" },
  { label: "Discuss Pricing", icon: "💰" },
] as const;

function loadSession(): Message[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const session: StoredSession = JSON.parse(raw);
    if (Date.now() - session.savedAt > SESSION_TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return session.messages;
  } catch {
    return [];
  }
}

function saveSession(messages: Message[]): void {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ messages, savedAt: Date.now() } satisfies StoredSession)
    );
  } catch {
    // Storage quota exceeded — skip silently
  }
}

export default function SalesChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [showChips, setShowChips] = useState(true);
  const [proactiveLabel, setProactiveLabel] = useState<string | null>(null);
  const [quoteSubmitted, setQuoteSubmitted] = useState(false);
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [approvalNeeded, setApprovalNeeded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isOpenRef = useRef(false);
  const exitIntentFired = useRef(false);

  // Keep isOpenRef in sync for use inside event handler closures
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = loadSession();
    if (stored.length > 0) {
      setMessages(stored);
      setShowChips(false);
    }
  }, []);

  // Persist session whenever messages change
  useEffect(() => {
    if (messages.length > 0) saveSession(messages);
  }, [messages]);

  // Auto-open chat after 3 seconds on a fresh session
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpenRef.current) setIsOpen(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []); // intentionally runs once on mount

  // Proactive notification after 15s if user closed the chat
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isOpenRef.current) {
        setProactiveLabel("✨ Have a project in mind?");
        setHasUnread(true);
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, []); // intentionally runs once on mount

  // Exit-intent detection (desktop only)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10 && !isOpenRef.current && !exitIntentFired.current) {
        exitIntentFired.current = true;
        setProactiveLabel("Wait — quick question about your project?");
        setHasUnread(true);
        setIsOpen(true);
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => document.removeEventListener("mouseleave", handleMouseLeave);
  }, []); // intentionally runs once on mount

  // Focus input, clear unread badge, and play chime when opening
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setProactiveLabel(null);
      playChime();
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(overrideText?: string) {
    const text = (overrideText ?? input).trim();
    if (!text || isLoading || !CHATBOT_URL) return;

    const userMsg: Message = { role: "user", content: text, timestamp: Date.now() };
    const updated = [...messages, userMsg];
    setMessages(updated);
    if (!overrideText) setInput("");
    setIsLoading(true);
    setShowChips(false);

    try {
      const res = await fetch(CHATBOT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updated.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as ChatResponse;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message, timestamp: Date.now() },
      ]);
      if (data.needsApproval && !quoteSubmitted) {
        setApprovalNeeded(true);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Reach Jeff directly at info@jeffhonforlocophotos.com or call +646-379-4237.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function handleChipClick(label: string) {
    sendMessage(`I'm interested in ${label} photography`);
  }

  function clearSession() {
    setMessages([]);
    setShowChips(true);
    setQuoteSubmitted(false);
    setApprovalNeeded(false);
    sessionStorage.removeItem(STORAGE_KEY);
  }

  async function submitQuoteToJeff() {
    if (messages.length === 0 || isSubmittingQuote) return;
    setIsSubmittingQuote(true);
    const conversationText = messages
      .map((m) => `${m.role === "user" ? "Client" : "Studio AI"}: ${m.content}`)
      .join("\n\n");
    try {
      await apiService.sendContactEmail({
        full_name: "Chat Inquiry — Pending Jeff Approval",
        email: import.meta.env.VITE_CONTACT_EMAIL as string ?? "info@jeffhonforlocophotos.com",
        phone: "",
        message: `[CUSTOM QUOTE REQUEST — AI NEGOTIATION]\n\nA client negotiated a custom package via the studio chatbot and is requesting Jeff's approval.\n\n--- CONVERSATION ---\n${conversationText}\n\n--- END CONVERSATION ---\n\nPlease review and contact the client directly to confirm pricing.`,
        service_type: "Custom Quote",
        budget_range: "AI Negotiated",
        event_date: "",
        location: "United States",
      });
      setQuoteSubmitted(true);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Your custom quote request has been sent to Jeff for final approval. He'll review the details and reach out within 24 hours to confirm your package. 🎉",
          timestamp: Date.now(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I couldn't send the request right now. Please email Jeff directly at info@jeffhonforlocophotos.com — mention you chatted with the studio AI.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsSubmittingQuote(false);
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">
      {/* Chat window */}
      {isOpen && (
        <div className="w-[390px] max-w-[calc(100vw-2rem)] max-h-[calc(100dvh-96px)] bg-photo-black border border-photo-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-photo-gray-900 border-b border-photo-gray-700">
            <div className="flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 bg-photo-red rounded-full flex items-center justify-center">
                  <Camera size={15} className="text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-photo-black" />
              </div>
              <div>
                <p className="text-photo-white font-montserrat text-xs font-semibold tracking-widest uppercase leading-none">
                  Jeff's Studio AI
                </p>
                <p className="text-green-400 text-[10px] mt-0.5 leading-none">
                  Online · Replies instantly
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {messages.length > 0 && (
                <button
                  onClick={clearSession}
                  className="text-photo-gray-500 hover:text-photo-gray-300 text-[11px] transition-colors"
                >
                  New chat
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-photo-gray-400 hover:text-photo-white transition-colors"
                aria-label="Close chat"
              >
                <X size={17} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[240px] max-h-[45vh] sm:min-h-[340px] sm:max-h-[460px]">
            {/* Static initial greeting */}
            <div className="flex justify-start">
              <div className="max-w-[88%] bg-photo-gray-800 text-photo-white rounded-2xl rounded-tl-sm px-4 py-3 text-sm leading-relaxed">
                {INITIAL_GREETING}
              </div>
            </div>

            {/* Service quick-reply chips */}
            {showChips && CHATBOT_URL && (
              <div className="flex flex-wrap gap-2 pt-1">
                {SERVICE_CHIPS.map((chip) => (
                  <button
                    key={chip.label}
                    onClick={() => handleChipClick(chip.label)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 bg-photo-gray-800 hover:bg-photo-gray-700 border border-photo-gray-600 hover:border-photo-red text-photo-white text-xs px-3 py-1.5 rounded-full transition-all duration-150 hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <span aria-hidden="true">{chip.icon}</span>
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Conversation messages */}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-photo-red text-white rounded-tr-sm"
                      : "bg-photo-gray-800 text-photo-white rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-photo-gray-800 rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-photo-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-1.5 h-1.5 bg-photo-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 bg-photo-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick links row */}
          <div className="border-t border-photo-gray-800 bg-photo-gray-900">
            <a
              href="/pricing"
              className="flex items-center justify-between px-4 py-2 text-xs text-photo-gray-400 hover:text-photo-white hover:bg-photo-gray-800 transition-colors group border-b border-photo-gray-800"
            >
              <span>See all packages — starting at $649</span>
              <span className="text-photo-red group-hover:translate-x-0.5 transition-transform">→</span>
            </a>
            <a
              href="/book"
              className="flex items-center justify-between px-4 py-2 text-xs text-photo-gray-400 hover:text-photo-white hover:bg-photo-gray-800 transition-colors group"
            >
              <span>Ready to book? Go straight to the booking form</span>
              <span className="text-photo-red group-hover:translate-x-0.5 transition-transform">→</span>
            </a>
          </div>

          {/* AI-triggered approval CTA — shown immediately when AI signals readiness */}
          {approvalNeeded && !quoteSubmitted && (
            <div className="px-3 pt-2 border-t border-photo-red/40 bg-photo-gray-900">
              <button
                onClick={submitQuoteToJeff}
                disabled={isSubmittingQuote}
                className="w-full flex items-center justify-center gap-2 bg-photo-red hover:bg-photo-red-hover text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mb-2 animate-pulse"
              >
                {isSubmittingQuote ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <CheckCircle size={13} />
                )}
                {isSubmittingQuote ? "Sending to Jeff…" : "⚡ Send to Jeff for Final Approval"}
              </button>
            </div>
          )}

          {/* Fallback approval CTA — appears after 4+ messages if AI hasn't already triggered it */}
          {messages.length >= 4 && !approvalNeeded && !quoteSubmitted && (
            <div className="px-3 pt-2 border-t border-photo-gray-700 bg-photo-gray-900">
              <button
                onClick={submitQuoteToJeff}
                disabled={isSubmittingQuote}
                className="w-full flex items-center justify-center gap-2 bg-photo-red/10 hover:bg-photo-red/20 border border-photo-red/30 hover:border-photo-red text-photo-red text-xs px-3 py-2 rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mb-2"
              >
                {isSubmittingQuote ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <CheckCircle size={13} />
                )}
                {isSubmittingQuote ? "Sending to Jeff…" : "Send This Quote to Jeff for Final Approval"}
              </button>
            </div>
          )}

          {quoteSubmitted && (
            <div className="px-3 pt-2 border-t border-photo-gray-700 bg-photo-gray-900">
              <div className="w-full flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-xs px-3 py-2 rounded-xl mb-2">
                <CheckCircle size={13} />
                Quote sent — Jeff will follow up within 24 hours
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-photo-gray-700 bg-photo-gray-900">
            {!CHATBOT_URL ? (
              <p className="text-photo-gray-500 text-xs text-center py-1">
                Set{" "}
                <code className="text-photo-gray-300">VITE_CHATBOT_URL</code>{" "}
                to activate.
              </p>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tell me about your project..."
                  disabled={isLoading}
                  className="flex-1 bg-photo-gray-800 text-photo-white placeholder-photo-gray-500 border border-photo-gray-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-photo-red transition-colors disabled:opacity-50"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="bg-photo-red hover:bg-photo-red-hover text-white rounded-xl p-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Proactive speech bubble */}
      {!isOpen && proactiveLabel && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-photo-gray-900 border border-photo-gray-700 hover:border-photo-red text-photo-white text-xs px-4 py-2.5 rounded-full shadow-lg transition-colors max-w-[260px] text-left"
        >
          {proactiveLabel}
        </button>
      )}

      {/* Floating action button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative bg-photo-red hover:bg-photo-red-hover text-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label={isOpen ? "Close chat" : "Chat with Jeff's studio"}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {!isOpen && hasUnread && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-photo-black animate-pulse" />
        )}
      </button>
    </div>
  );
}
