"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, User, Plus, MessageSquare, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionEyebrow } from "@/components/shared";
import { apiGet, apiPost } from "@/lib/api-client";

const card = "rounded-[28px] border border-black/6 bg-white shadow-[0_1px_0_rgba(0,0,0,0.02),0_18px_40px_rgba(0,0,0,0.035)]";
const inputClass = "h-12 rounded-2xl border border-black/10 bg-white px-4 text-[15px] shadow-none focus-visible:ring-0 focus-visible:ring-offset-0";

interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  title: string | null;
  createdAt: string;
}

export function ChatbotPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (activeConvoId) loadMessages(activeConvoId);
    else setMessages([]);
  }, [activeConvoId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    try {
      const res: any = await apiGet("/ai/conversations");
      setConversations(res.data ?? res ?? []);
    } catch {}
    setLoadingConvos(false);
  };

  const loadMessages = async (convoId: string) => {
    try {
      const res: any = await apiGet(`/ai/conversations/${convoId}/messages`);
      setMessages(res.data ?? res ?? []);
    } catch {}
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput("");
    setSending(true);

    // Optimistic user message
    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [...prev, { id: tempId, role: "USER", content: text, createdAt: new Date().toISOString() }]);

    try {
      const res: any = await apiPost("/ai/chat", {
        conversationId: activeConvoId,
        message: text,
      });

      const data = res.data ?? res;
      const convoId = data.conversationId;

      if (!activeConvoId) {
        setActiveConvoId(convoId);
        loadConversations();
      }

      // Replace temp + add assistant message
      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => m.id !== tempId);
        return [
          ...withoutTemp,
          { id: `user-${Date.now()}`, role: "USER", content: text, createdAt: new Date().toISOString() },
          data.message,
        ];
      });
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }

    setSending(false);
  };

  const startNewChat = () => {
    setActiveConvoId(null);
    setMessages([]);
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.3fr_0.7fr]">
      {/* ─── Conversation List ─── */}
      <Card className={card}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <SectionEyebrow>Conversations</SectionEyebrow>
              <CardTitle className="mt-2">Chat history</CardTitle>
            </div>
            <Button onClick={startNewChat} size="icon" className="h-10 w-10 rounded-2xl bg-black text-white">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
          {loadingConvos && (
            <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-black/30" /></div>
          )}
          {conversations.length === 0 && !loadingConvos && (
            <p className="py-4 text-center text-sm text-black/38">No conversations yet.</p>
          )}
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveConvoId(c.id)}
              className={`flex w-full items-center gap-3 rounded-[18px] p-3 text-left transition ${
                activeConvoId === c.id ? "bg-black/[0.04]" : "hover:bg-black/[0.02]"
              }`}
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-black/30" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-black">{c.title ?? "New chat"}</p>
                <p className="text-xs text-black/35">{new Date(c.createdAt).toLocaleDateString()}</p>
              </div>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* ─── Chat Window ─── */}
      <Card className={card}>
        <CardContent className="flex h-[600px] flex-col p-0">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f6f3ff] text-[#7357d8] mb-4">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-black">Finance AI Assistant</h3>
                <p className="mt-2 max-w-sm text-sm text-black/42">
                  I know your financial data. Ask me about spending patterns, savings tips, budgeting advice, or anything money-related.
                </p>
              </div>
            )}

            {messages.map((msg) => {
              const isUser = msg.role === "USER";
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                >
                  {!isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f6f3ff] text-[#7357d8]">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div className={`max-w-[75%] rounded-[20px] px-4 py-3 ${
                    isUser ? "bg-black text-white" : "bg-[#f5f5f2] text-black"
                  }`}>
                    <p className="text-sm leading-6 whitespace-pre-wrap">{msg.content}</p>
                  </div>
                  {isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f3f3f1] text-black">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                </motion.div>
              );
            })}

            {sending && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#f6f3ff] text-[#7357d8]">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="rounded-[20px] bg-[#f5f5f2] px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-black/40" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-black/6 p-4">
            <div className="flex gap-3">
              <Input
                className={`${inputClass} flex-1`}
                placeholder="Ask about your finances..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              />
              <Button onClick={sendMessage} disabled={sending || !input.trim()} className="h-12 w-12 rounded-2xl bg-black text-white">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
