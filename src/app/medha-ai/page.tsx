"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Mic,
  MicOff,
  Sparkles,
  School,
  BookOpen,
  TrendingUp,
  GraduationCap,
  Volume2,
  VolumeX,
  Loader2,
  ChevronRight,
  Bot,
  User,
} from "lucide-react";
import DefaultLayout from "../defaultLayout";
import { useAuth } from "../../../contexts/AuthContext";
import { useRouter } from "next/navigation";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  {
    icon: School,
    label: "College Recommendation",
    prompt: "I need help choosing the right college based on my rank and preferences.",
  },
  {
    icon: TrendingUp,
    label: "Cutoff Prediction",
    prompt: "What are the expected cutoffs for top NITs this year?",
  },
  {
    icon: BookOpen,
    label: "Exam Strategy",
    prompt: "Help me plan my preparation strategy for JEE Advanced.",
  },
  {
    icon: GraduationCap,
    label: "Scholarship Help",
    prompt: "What scholarships am I eligible for as a general category student?",
  },
];

export default function MedhaAIPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/register");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = "en-IN";
        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join("");
          setInput(transcript);
          if (event.results[0].isFinal) setIsListening(false);
        };
        recognition.onerror = () => setIsListening(false);
        recognition.onend = () => setIsListening(false);
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const speakText = useCallback((text: string) => {
    if (!autoSpeak) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-IN";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    synthRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [autoSpeak]);

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    try {
      const apiMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const res = await fetch("/api/medha-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await res.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Sorry, I couldn't process that. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      speakText(assistantMessage.content);
    } catch {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Oops! Something went wrong. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const formatMessage = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="text-amber-400">$1</strong>')
      .replace(/\n/g, "<br />");
  };

  if (authLoading) {
    return (
      <DefaultLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="animate-spin" size={32} style={{ color: "#F59E0B" }} />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="flex flex-col h-screen max-h-screen" style={{ backgroundColor: "#050818" }}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{
            background: "linear-gradient(to right, rgba(5, 8, 24, 0.95), rgba(15, 23, 43, 0.95))",
            borderColor: "rgba(245, 158, 11, 0.15)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #ffc174, #f59e0b)" }}
            >
              <Sparkles size={20} style={{ color: "#1b1f30" }} />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: "#ffc174" }}>Medha AI</h1>
              <p className="text-xs" style={{ color: "#94a3b8" }}>Your AI College Counsellor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { if (isSpeaking) stopSpeaking(); setAutoSpeak(!autoSpeak); }}
              className="p-2 rounded-lg transition-all"
              style={{
                backgroundColor: autoSpeak ? "rgba(245, 158, 11, 0.15)" : "rgba(255,255,255,0.05)",
                color: autoSpeak ? "#F59E0B" : "#94a3b8",
              }}
              title={autoSpeak ? "Voice responses ON" : "Voice responses OFF"}
            >
              {autoSpeak ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
            <div
              className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-1.5"
              style={{
                backgroundColor: "rgba(245, 158, 11, 0.1)",
                color: "#ffc174",
                border: "1px solid rgba(245, 158, 11, 0.2)",
              }}
            >
              <div className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
              Online
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div
          className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#303446 transparent" }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto">
              <div
                className="h-20 w-20 rounded-2xl flex items-center justify-center mb-6"
                style={{
                  background: "linear-gradient(135deg, rgba(255, 193, 116, 0.15), rgba(245, 158, 11, 0.1))",
                  border: "1px solid rgba(245, 158, 11, 0.2)",
                }}
              >
                <Sparkles size={36} style={{ color: "#ffc174" }} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-center mb-2" style={{ color: "#dfe1f9" }}>
                Namaste! I&apos;m Medha AI
              </h2>
              <p className="text-center mb-8 max-w-md" style={{ color: "#94a3b8" }}>
                Your personal AI college counsellor. Ask me about colleges, cutoffs, scholarships, or career paths.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                {QUICK_PROMPTS.map((qp) => (
                  <button
                    key={qp.label}
                    onClick={() => sendMessage(qp.prompt)}
                    className="flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 group hover:bg-[rgba(27,31,48,0.8)]"
                    style={{
                      backgroundColor: "rgba(27, 31, 48, 0.5)",
                      border: "1px solid rgba(245, 158, 11, 0.1)",
                    }}
                  >
                    <qp.icon size={18} style={{ color: "#ffc174" }} />
                    <span className="text-sm flex-1" style={{ color: "#cbd5e1" }}>{qp.label}</span>
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#ffc174" }} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                {msg.role === "assistant" && (
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-1" style={{ background: "linear-gradient(135deg, #ffc174, #f59e0b)" }}>
                    <Bot size={16} style={{ color: "#1b1f30" }} />
                  </div>
                )}
                <div
                  className="max-w-[75%] md:max-w-[65%] rounded-2xl px-4 py-3"
                  style={msg.role === "user"
                    ? { background: "linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(255, 193, 116, 0.1))", border: "1px solid rgba(245, 158, 11, 0.2)", borderBottomRightRadius: "4px" }
                    : { backgroundColor: "rgba(27, 31, 48, 0.6)", border: "1px solid rgba(255, 255, 255, 0.05)", borderBottomLeftRadius: "4px", backdropFilter: "blur(12px)" }
                  }
                >
                  <div className="text-sm leading-relaxed" style={{ color: msg.role === "user" ? "#ffc174" : "#dfe1f9" }} dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
                  <div className="text-xs mt-2 opacity-50" style={{ color: "#94a3b8" }}>
                    {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
                {msg.role === "user" && (
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-1" style={{ backgroundColor: "rgba(99, 102, 241, 0.15)" }}>
                    <User size={16} style={{ color: "#94a3b8" }} />
                  </div>
                )}
              </div>
            ))
          )}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, #ffc174, #f59e0b)" }}>
                <Bot size={16} style={{ color: "#1b1f30" }} />
              </div>
              <div className="rounded-2xl px-5 py-4" style={{ backgroundColor: "rgba(27, 31, 48, 0.6)", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: "#ffc174", animationDelay: "0ms" }} />
                    <div className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: "#ffc174", animationDelay: "150ms" }} />
                    <div className="h-2 w-2 rounded-full animate-bounce" style={{ backgroundColor: "#ffc174", animationDelay: "300ms" }} />
                  </div>
                  <span className="text-xs" style={{ color: "#94a3b8" }}>Medha is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="px-4 md:px-6 py-4 border-t shrink-0" style={{ background: "linear-gradient(to right, rgba(5, 8, 24, 0.98), rgba(15, 23, 43, 0.98))", borderColor: "rgba(245, 158, 11, 0.1)" }}>
          <div className="flex items-end gap-3 max-w-4xl mx-auto rounded-xl p-2" style={{ backgroundColor: "rgba(27, 31, 48, 0.5)", border: "1px solid rgba(245, 158, 11, 0.15)" }}>
            <button onClick={toggleListening} className="p-2.5 rounded-lg transition-all shrink-0" style={{ backgroundColor: isListening ? "rgba(239, 68, 68, 0.2)" : "rgba(255, 255, 255, 0.05)", color: isListening ? "#ef4444" : "#94a3b8" }} title={isListening ? "Stop listening" : "Start voice input"}>
              {isListening ? <MicOff size={18} className="animate-pulse" /> : <Mic size={18} />}
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isListening ? "Listening... speak now" : "Ask Medha about colleges, cutoffs, careers..."}
              rows={1}
              className="flex-1 resize-none bg-transparent outline-none text-sm py-2.5 placeholder-slate-500"
              style={{ color: "#dfe1f9", maxHeight: "120px", minHeight: "40px" }}
              onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = "40px"; t.style.height = t.scrollHeight + "px"; }}
            />
            <button onClick={() => sendMessage(input)} disabled={!input.trim() || isLoading} className="p-2.5 rounded-lg transition-all shrink-0 disabled:opacity-30" style={{ background: input.trim() && !isLoading ? "linear-gradient(135deg, #ffc174, #f59e0b)" : "rgba(255, 255, 255, 0.05)", color: input.trim() && !isLoading ? "#1b1f30" : "#94a3b8" }}>
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          <p className="text-center text-xs mt-2" style={{ color: "#4a5568" }}>Medha AI can make mistakes. Verify important info on official websites.</p>
        </div>
      </div>
    </DefaultLayout>
  );
}
