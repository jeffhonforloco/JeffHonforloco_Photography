import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  message: string;
  leadCaptured?: boolean;
}

const INITIAL_GREETING =
  "Hey! I'm here to help you book a shoot with Jeff Honforloco — one of the most creative photographers working today. Are you looking for fashion, corporate branding, celebrity, or beauty photography? Tell me about your project.";

const CHATBOT_URL = import.meta.env.VITE_CHATBOT_URL as string | undefined;

export default function SalesChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || isLoading || !CHATBOT_URL) return;

    const userMsg: Message = { role: "user", content: text };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch(CHATBOT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      const data = (await res.json()) as ChatResponse;
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I'm having trouble connecting right now. Reach Jeff directly at info@jeffhonforlocophotos.com or call +646-379-4237.",
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

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="w-[360px] max-w-[calc(100vw-3rem)] bg-photo-black border border-photo-gray-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-photo-gray-900 border-b border-photo-gray-700">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-photo-white font-montserrat text-xs font-semibold tracking-widest uppercase">
                Jeff's Studio
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-photo-gray-400 hover:text-photo-white transition-colors"
              aria-label="Close chat"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[320px] max-h-[420px]">
            {/* Hardcoded initial greeting — not part of API context */}
            <div className="flex justify-start">
              <div className="max-w-[88%] bg-photo-gray-800 text-photo-white rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed">
                {INITIAL_GREETING}
              </div>
            </div>

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-photo-red text-photo-white rounded-tr-sm"
                      : "bg-photo-gray-800 text-photo-white rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

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

          {/* Input */}
          <div className="p-3 border-t border-photo-gray-700 bg-photo-gray-900">
            {!CHATBOT_URL ? (
              <p className="text-photo-gray-500 text-xs text-center py-1">
                Set <code className="text-photo-gray-300">VITE_CHATBOT_URL</code> to activate.
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
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="bg-photo-red hover:bg-photo-red-hover text-photo-white rounded-xl p-2 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  aria-label="Send"
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

      {/* Floating action button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative bg-photo-red hover:bg-photo-red-hover text-photo-white rounded-full w-14 h-14 flex items-center justify-center shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label={isOpen ? "Close chat" : "Chat with Jeff's studio"}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
        {!isOpen && hasUnread && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-photo-black" />
        )}
      </button>
    </div>
  );
}
