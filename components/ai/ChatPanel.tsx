"use client";

import { useState, useRef, useEffect } from "react";
import { Bot, Send, User, Loader2, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";

interface Message {
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt?: string;
}

interface ChatPanelProps {
  productId: string;
  productTitle: string;
}

export function ChatPanel({ productId, productTitle }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when panel opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      fetch(`/api/ai/chat?productId=${productId}`)
        .then((r) => r.json())
        .then((data: Message[]) => {
          if (Array.isArray(data) && data.length > 0) {
            setMessages(data);
          }
        })
        .catch(() => {});
    }
  }, [isOpen, productId, messages.length]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "USER", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, productId }),
      });

      if (!res.ok) throw new Error("Chat request failed");

      const data = await res.json();
      const assistantMessage: Message = { role: "ASSISTANT", content: data.reply };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      toast.error("AI chat failed. Please try again.");
      setMessages((prev) => prev.slice(0, -1)); // Remove optimistic message
      setInput(trimmed);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const suggestions = [
    "Is this a good deal right now?",
    "What are the main pros and cons?",
    "Should I wait for a sale?",
    "How does this compare to alternatives?",
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "hsl(222 39% 9%)",
        border: "1px solid hsl(217 32% 17%)",
      }}
    >
      {/* Header — toggle */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-6 transition-colors"
        style={{ color: "hsl(210 40% 98%)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(168,85,247,0.1))",
              border: "1px solid rgba(59,130,246,0.25)",
            }}
          >
            <Bot className="w-5 h-5" style={{ color: "#60a5fa" }} />
          </div>
          <div className="text-left">
            <div
              className="font-semibold"
              style={{ fontFamily: "Outfit, sans-serif" }}
            >
              AI Shopping Assistant
            </div>
            <div className="text-xs" style={{ color: "hsl(215 16% 47%)" }}>
              Ask anything about this product
            </div>
          </div>
        </div>
        <div
          className="text-xs px-2 py-1 rounded-full"
          style={{
            background: "rgba(59,130,246,0.1)",
            border: "1px solid rgba(59,130,246,0.2)",
            color: "#60a5fa",
          }}
        >
          {isOpen ? "Collapse ↑" : "Open ↓"}
        </div>
      </button>

      {/* Chat area */}
      {isOpen && (
        <div style={{ borderTop: "1px solid hsl(217 32% 17%)" }}>
          {/* Messages */}
          <div
            className="p-4 space-y-4 overflow-y-auto"
            style={{
              height: messages.length === 0 ? "auto" : "360px",
              minHeight: "120px",
            }}
          >
            {messages.length === 0 ? (
              <div className="py-4">
                <p className="text-sm mb-4 text-center" style={{ color: "hsl(215 20% 65%)" }}>
                  Ask me anything about{" "}
                  <span style={{ color: "#60a5fa" }}>
                    {productTitle.slice(0, 40)}...
                  </span>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        setInput(s);
                        inputRef.current?.focus();
                      }}
                      className="text-left text-xs px-3 py-2.5 rounded-xl transition-all"
                      style={{
                        background: "hsl(222 47% 5%)",
                        border: "1px solid hsl(217 32% 17%)",
                        color: "hsl(215 20% 65%)",
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-3 ${msg.role === "USER" ? "flex-row-reverse" : ""}`}
                >
                  {/* Avatar */}
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        msg.role === "ASSISTANT"
                          ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(168,85,247,0.1))"
                          : "rgba(99,102,241,0.15)",
                      border: `1px solid ${msg.role === "ASSISTANT" ? "rgba(59,130,246,0.25)" : "rgba(99,102,241,0.25)"}`,
                    }}
                  >
                    {msg.role === "ASSISTANT" ? (
                      <Bot className="w-4 h-4" style={{ color: "#60a5fa" }} />
                    ) : (
                      <User className="w-4 h-4" style={{ color: "#a78bfa" }} />
                    )}
                  </div>

                  {/* Bubble */}
                  <div
                    className="max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                    style={
                      msg.role === "USER"
                        ? {
                            background: "rgba(99,102,241,0.12)",
                            border: "1px solid rgba(99,102,241,0.2)",
                            color: "hsl(210 40% 98%)",
                            borderTopRightRadius: "4px",
                          }
                        : {
                            background: "hsl(222 47% 5%)",
                            border: "1px solid hsl(217 32% 17%)",
                            color: "hsl(215 20% 65%)",
                            borderTopLeftRadius: "4px",
                          }
                    }
                  >
                    {msg.content}
                  </div>
                </div>
              ))
            )}

            {/* Typing indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(168,85,247,0.1))",
                    border: "1px solid rgba(59,130,246,0.25)",
                  }}
                >
                  <Bot className="w-4 h-4" style={{ color: "#60a5fa" }} />
                </div>
                <div
                  className="px-4 py-3 rounded-2xl flex items-center gap-1"
                  style={{
                    background: "hsl(222 47% 5%)",
                    border: "1px solid hsl(217 32% 17%)",
                    borderTopLeftRadius: "4px",
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{
                        background: "#60a5fa",
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="p-4 flex gap-3"
            style={{ borderTop: "1px solid hsl(217 32% 17%)" }}
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about price, value, alternatives..."
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all disabled:opacity-60"
              style={{
                background: "hsl(222 47% 5%)",
                border: "1px solid hsl(217 32% 25%)",
                color: "hsl(210 40% 98%)",
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all disabled:opacity-40"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #7c3aed)",
              }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
