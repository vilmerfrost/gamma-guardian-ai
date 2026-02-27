import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { mockChatHistory, type ChatMessage } from "@/data/mockData";
import { Send, Brain, User, Sparkles, AlertTriangle, Lightbulb, ShieldCheck, Scale, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

const quickActions = [
  { label: "Sammanfatta patient P-2024-001", icon: Sparkles },
  { label: "Optimize dose plan for acoustic neuroma", icon: Lightbulb },
  { label: "What risks exist with the current plan?", icon: AlertTriangle },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gamma-ai-chat`;

async function streamChat({
  messages,
  onDelta,
  onDone,
  onError,
}: {
  messages: { role: string; content: string }[];
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (resp.status === 429) { onError("AI is overloaded right now, please try again shortly."); return; }
  if (resp.status === 402) { onError("AI credits exhausted. Top up via Settings > Workspace > Usage."); return; }
  if (!resp.ok || !resp.body) { onError("Could not connect to AI."); return; }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let done = false;

  while (!done) {
    const { done: rdone, value } = await reader.read();
    if (rdone) break;
    buf += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const json = line.slice(6).trim();
      if (json === "[DONE]") { done = true; break; }
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onDelta(content);
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }
  onDone();
}

const AIAdvisor = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatHistory);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

    try {
      await streamChat({
        messages: apiMessages,
        onDelta: (chunk) => {
          assistantSoFar += chunk;
          const content = assistantSoFar;
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last?.role === "assistant" && last.id.startsWith("msg-stream")) {
              return prev.map((m, i) => i === prev.length - 1 ? { ...m, content } : m);
            }
            return [...prev, { id: "msg-stream-" + Date.now(), role: "assistant", content, timestamp: new Date().toISOString() }];
          });
        },
        onDone: () => setIsLoading(false),
        onError: (msg) => {
          toast.error(msg);
          setIsLoading(false);
        },
      });
    } catch {
      toast.error("Something went wrong with the AI connection.");
      setIsLoading(false);
    }
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col h-[calc(100vh-7rem)] max-w-4xl mx-auto">
      <motion.div variants={item} className="mb-4">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">AI Advisor</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Ask about patient data, dose optimization, and treatment plans</p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-medical-amber/10 border border-medical-amber/20">
            <Scale className="w-3.5 h-3.5 text-medical-amber" />
            <span className="text-[10px] font-semibold text-medical-amber">High-risk AI (EU AI Act)</span>
          </div>
        </div>
      </motion.div>

      {/* EU AI Act transparency banner */}
      <motion.div variants={item} className="mb-3 bg-muted/30 border border-border rounded-xl p-3">
        <div className="flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-medical-cyan shrink-0 mt-0.5" />
          <div className="text-[10px] text-muted-foreground space-y-0.5">
            <p className="font-semibold text-foreground text-xs">EU AI Act — Articles 13, 14 (Transparency & Human Oversight)</p>
            <p>This AI system is classified as <strong className="text-foreground">high-risk AI</strong> under the EU AI Act (2024/1689), Annex I, point 5(b). 
            The AI explains its reasoning step by step, provides confidence levels and limitations. All responses are logged for traceability (Art. 12). 
            <strong className="text-foreground"> The responsible clinician must verify each recommendation before clinical decisions.</strong></p>
          </div>
        </div>
      </motion.div>

      <motion.div variants={item} className="flex-1 card-medical flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg gradient-accent flex items-center justify-center shrink-0 mt-0.5">
                  <Brain className="w-3.5 h-3.5 text-accent-foreground" />
                </div>
              )}
              <div className={`max-w-[80%] ${msg.role === "user" ? "gradient-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5" : "bg-muted/40 rounded-2xl rounded-tl-sm px-4 py-3"}`}>
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm max-w-none text-foreground [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:mt-2 [&_h3]:mb-1 [&_p]:text-xs [&_p]:leading-relaxed [&_li]:text-xs [&_blockquote]:text-xs [&_blockquote]:border-l-medical-cyan [&_strong]:text-foreground">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-sm">{msg.content}</p>
                )}
              </div>
              {msg.role === "user" && (
                <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && !messages.some(m => m.id.startsWith("msg-stream")) && (
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-lg gradient-accent flex items-center justify-center shrink-0">
                <Brain className="w-3.5 h-3.5 text-accent-foreground" />
              </div>
              <div className="bg-muted/40 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && (
          <div className="px-4 pb-2">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(action.label)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border text-xs text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
                >
                  <action.icon className="w-3 h-3" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-3 border-t border-border">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about patient, dose, or treatment plan..."
              className="flex-1 bg-muted/30 rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 transition-shadow"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!input.trim() || isLoading}
              className="gradient-primary text-primary-foreground border-0 rounded-xl px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AIAdvisor;





