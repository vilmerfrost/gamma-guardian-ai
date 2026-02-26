import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { mockChatHistory, patients, type ChatMessage } from "@/data/mockData";
import { Send, Brain, User, Sparkles, AlertTriangle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

const quickActions = [
  { label: "Sammanfatta patient P-2024-001", icon: Sparkles },
  { label: "Optimera dosplan för akustikusneurinom", icon: Lightbulb },
  { label: "Vilka risker finns med nuvarande plan?", icon: AlertTriangle },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

const mockResponses: Record<string, string> = {
  default: `## Analys av patient P-2024-001

**Anna Lindström**, 58 år, diagnostiserad med **vestibularisschwannom** (akustikusneurinom) i vänster cerebellopontina vinkel.

### Tumördata
- Storlek: 14mm × 12mm × 11mm
- Volym: ~1.23 cm³
- AI-segmenteringskonfidens: 96.8%

### Rekommendationer
1. **Margindos**: 12 Gy i en fraktion (standard för akustikusneurinom)
2. **Cochlea-skydd**: Håll max dos till cochlea under 4 Gy för bevarad hörsel
3. **N. facialis**: Avstånd 2.8mm — kräver noggrann dosplanering

### Risk-bedömning
- Hörselbevarande: **73%** sannolikhet vid 12 Gy margindos
- Tumörkontroll: **95%** vid 5-års uppföljning
- Facialispares risk: **<1%**

> ⚡ *AI-förslag: Justera isocentrum 1.2mm lateralt för att minska cochlea-exponering med 15%.*`,
};

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

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: "assistant",
        content: mockResponses.default,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col h-[calc(100vh-7rem)] max-w-4xl mx-auto">
      <motion.div variants={item} className="mb-4">
        <h1 className="text-2xl font-bold text-foreground tracking-tight">AI Advisor</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Fråga om patientdata, dosoptimering och behandlingsplaner</p>
      </motion.div>

      {/* Chat area */}
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
          {isLoading && (
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

        {/* Quick actions */}
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

        {/* Input */}
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
              placeholder="Ställ en fråga om patient, dos eller behandlingsplan..."
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
