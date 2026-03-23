"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}
type SpeechRecognition = any;
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
    Zap,
    MessageCircle,
    Brain,
    Target,
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
        label: "College\nRecommendation",
        prompt: "I need help choosing the right college based on my rank and preferences.",
        desc: "Find your perfect college match",
        gradient: "linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(255, 193, 116, 0.06))",
    },
    {
        icon: TrendingUp,
        label: "Cutoff\nPrediction",
        prompt: "What are the expected cutoffs for top NITs this year?",
        desc: "AI-powered cutoff forecasts",
        gradient: "linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.06))",
    },
    {
        icon: BookOpen,
        label: "Exam\nStrategy",
        prompt: "Help me plan my preparation strategy for JEE Advanced.",
        desc: "Personalized study roadmap",
        gradient: "linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(16, 185, 129, 0.06))",
    },
    {
        icon: GraduationCap,
        label: "Scholarship\nHelp",
        prompt: "What scholarships am I eligible for as a general category student?",
        desc: "Discover funding opportunities",
        gradient: "linear-gradient(135deg, rgba(236, 72, 153, 0.12), rgba(244, 114, 182, 0.06))",
    },
];

const AI_FEATURES = [
    { icon: Brain, label: "Deep Analysis", desc: "Powered by Gemini 2.5 Pro" },
    { icon: MessageCircle, label: "Voice Chat", desc: "Speak naturally in Hindi/English" },
    { icon: Target, label: "Personalized", desc: "Tailored to your profile" },
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
                (window as any).SpeechRecognition ||
                (window as any).webkitSpeechRecognition;
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

    const speakText = useCallback(
        (text: string) => {
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
        },
        [autoSpeak]
    );

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
                content:
                    data.response ||
                    "Sorry, I couldn't process that. Please try again.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, assistantMessage]);
            speakText(assistantMessage.content);
        } catch {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content:
                    "Oops! Something went wrong. Please try again in a moment.",
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
            .replace(
                /\*\*(.*?)\*\*/g,
                '<strong class="text-amber-400">$1</strong>'
            )
            .replace(/\n/g, "<br />");
    };

    if (authLoading) {
        return (
            <DefaultLayout>
                <div className="flex items-center justify-center h-full">
                    <Loader2
                        className="animate-spin"
                        size={32}
                        style={{ color: "#F59E0B" }}
                    />
                </div>
            </DefaultLayout>
        );
    }

    return (
        <DefaultLayout>
            <div
                className="flex flex-col h-screen max-h-screen"
                style={{ backgroundColor: "#050818" }}
            >
                {/* ‚îÄ‚îÄ‚îÄ Premium Header ‚îÄ‚îÄ‚îÄ */}
                <div
                    className="flex items-center justify-between px-6 py-3 shrink-0"
                    style={{
                        background:
                            "linear-gradient(135deg, rgba(15, 23, 43, 0.98), rgba(5, 8, 24, 0.95))",
                        borderBottom: "1px solid rgba(245, 158, 11, 0.08)",
                        backdropFilter: "blur(24px)",
                    }}
                >
                    <div className="flex items-center gap-4">
                        <div
                            className="h-11 w-11 rounded-xl flex items-center justify-center shadow-lg"
                            style={{
                                background:
                                    "linear-gradient(135deg, #f59e0b, #fbbf24)",
                                boxShadow:
                                    "0 4px 20px rgba(245, 158, 11, 0.25)",
                            }}
                        >
                            <Sparkles
                                size={22}
                                style={{ color: "#050818" }}
                            />
                        </div>
                        <div>
                            <h1
                                className="text-lg font-bold tracking-tight"
                                style={{ color: "#f0f0f8" }}
                            >
                                Medha AI
                            </h1>
                            <p
                                className="text-xs font-medium"
                                style={{ color: "#64748b" }}
                            >
                                Your AI College Counsellor
                            </p>
                        </div>
                        <div
                            className="hidden md:flex items-center gap-1 ml-4 px-3 py-1 rounded-full"
                            style={{
                                background:
                                    "linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.04))",
                                border: "1px solid rgba(245, 158, 11, 0.12)",
                            }}
                        >
                            <Zap
                                size={12}
                                style={{ color: "#fbbf24" }}
                            />
                            <span
                                className="text-xs font-semibold uppercase tracking-wider"
                                style={{ color: "#fbbf24" }}
                            >
                                AI Engine Active
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => {
                                if (isSpeaking) stopSpeaking();
                                setAutoSpeak(!autoSpeak);
                            }}
                            className="p-2.5 rounded-xl transition-all duration-300"
                            style={{
                                backgroundColor: autoSpeak
                                    ? "rgba(245, 158, 11, 0.12)"
                                    : "rgba(255,255,255,0.04)",
                                color: autoSpeak ? "#fbbf24" : "#64748b",
                                border: autoSpeak
                                    ? "1px solid rgba(245, 158, 11, 0.2)"
                                    : "1px solid rgba(255,255,255,0.06)",
                            }}
                            title={
                                autoSpeak
                                    ? "Voice responses ON"
                                    : "Voice responses OFF"
                            }
                        >
                            {autoSpeak ? (
                                <Volume2 size={18} />
                            ) : (
                                <VolumeX size={18} />
                            )}
                        </button>
                        <div
                            className="px-3 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase flex items-center gap-2"
                            style={{
                                background:
                                    "linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.04))",
                                color: "#4ade80",
                                border: "1px solid rgba(34, 197, 94, 0.15)",
                            }}
                        >
                            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                            Online
                        </div>
                    </div>
                </div>

                {/* ‚îÄ‚îÄ‚îÄ Messages Area ‚îÄ‚îÄ‚îÄ */}
                <div
                    className="flex-1 overflow-y-auto px-4 md:px-8 py-6"
                    style={{
                        scrollbarWidth: "thin",
                        scrollbarColor: "#1e293b transparent",
                    }}
                >
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full max-w-3xl mx-auto">
                            {/* AI Insight Badge */}
                            <div
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
                                style={{
                                    background:
                                        "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(245, 158, 11, 0.05))",
                                    border: "1px solid rgba(245, 158, 11, 0.15)",
                                }}
                            >
                                <Sparkles
                                    size={14}
                                    style={{ color: "#fbbf24" }}
                                />
                                <span
                                    className="text-xs font-bold uppercase tracking-widest"
                                    style={{ color: "#fbbf24" }}
                                >
                                    AI Counsellor
                                </span>
                            </div>

                            {/* Welcome Card */}
                            <div
                                className="w-full rounded-2xl p-8 md:p-10 mb-8"
                                style={{
                                    background:
                                        "linear-gradient(145deg, rgba(15, 23, 43, 0.7), rgba(15, 23, 43, 0.4))",
                                    border: "1px solid rgba(245, 158, 11, 0.1)",
                                    backdropFilter: "blur(20px)",
                                    boxShadow:
                                        "0 8px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)",
                                }}
                            >
                                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                                    <div
                                        className="h-20 w-20 rounded-2xl flex items-center justify-center shrink-0"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, #f59e0b, #fbbf24)",
                                            boxShadow:
                                                "0 8px 30px rgba(245, 158, 11, 0.3)",
                                        }}
                                    >
                                        <Sparkles
                                            size={36}
                                            style={{ color: "#050818" }}
                                        />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h2
                                            className="text-2xl md:text-3xl font-bold mb-2"
                                            style={{ color: "#f0f0f8" }}
                                        >
                                            Namaste! I&apos;m{" "}
                                            <span style={{ color: "#fbbf24" }}>
                                                Medha AI
                                            </span>
                                        </h2>
                                        <p
                                            className="text-sm md:text-base max-w-md leading-relaxed"
                                            style={{ color: "#94a3b8" }}
                                        >
                                            Your personal AI college counsellor.
                                            Ask me about colleges, cutoffs,
                                            scholarships, or career paths.
                                        </p>
                                    </div>
                                </div>

                                {/* AI Features Strip */}
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                                    {AI_FEATURES.map((f) => (
                                        <div
                                            key={f.label}
                                            className="flex items-center gap-2.5 px-4 py-2 rounded-xl"
                                            style={{
                                                backgroundColor:
                                                    "rgba(255,255,255,0.03)",
                                                border: "1px solid rgba(255,255,255,0.05)",
                                            }}
                                        >
                                            <f.icon
                                                size={15}
                                                style={{ color: "#fbbf24" }}
                                            />
                                            <div>
                                                <div
                                                    className="text-xs font-semibold"
                                                    style={{
                                                        color: "#e2e8f0",
                                                    }}
                                                >
                                                    {f.label}
                                                </div>
                                                <div
                                                    className="text-xs"
                                                    style={{
                                                        color: "#64748b",
                                                    }}
                                                >
                                                    {f.desc}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quick Prompt Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full">
                                {QUICK_PROMPTS.map((qp) => (
                                    <button
                                        key={qp.label}
                                        onClick={() => sendMessage(qp.prompt)}
                                        className="flex flex-col items-start p-4 md:p-5 rounded-xl text-left transition-all duration-300 group hover:scale-[1.02]"
                                        style={{
                                            background: qp.gradient,
                                            border: "1px solid rgba(255, 255, 255, 0.06)",
                                            backdropFilter: "blur(12px)",
                                        }}
                                    >
                                        <div
                                            className="h-9 w-9 rounded-lg flex items-center justify-center mb-3"
                                            style={{
                                                backgroundColor:
                                                    "rgba(255,255,255,0.06)",
                                                border: "1px solid rgba(255,255,255,0.08)",
                                            }}
                                        >
                                            <qp.icon
                                                size={18}
                                                style={{ color: "#fbbf24" }}
                                            />
                                        </div>
                                        <span
                                            className="text-sm font-semibold leading-tight whitespace-pre-line"
                                            style={{ color: "#e2e8f0" }}
                                        >
                                            {qp.label}
                                        </span>
                                        <span
                                            className="text-xs mt-1.5 leading-snug"
                                            style={{ color: "#64748b" }}
                                        >
                                            {qp.desc}
                                        </span>
                                        <ChevronRight
                                            size={14}
                                            className="mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1"
                                            style={{ color: "#fbbf24" }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto space-y-5">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    {msg.role === "assistant" && (
                                        <div
                                            className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-1 shadow-lg"
                                            style={{
                                                background:
                                                    "linear-gradient(135deg, #f59e0b, #fbbf24)",
                                                boxShadow:
                                                    "0 4px 15px rgba(245, 158, 11, 0.2)",
                                            }}
                                        >
                                            <Bot
                                                size={16}
                                                style={{ color: "#050818" }}
                                            />
                                        </div>
                                    )}
                                    <div
                                        className="max-w-[75%] md:max-w-[65%] rounded-2xl px-5 py-4"
                                        style={
                                            msg.role === "user"
                                                ? {
                                                      background:
                                                          "linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(255, 193, 116, 0.08))",
                                                      border: "1px solid rgba(245, 158, 11, 0.2)",
                                                      borderBottomRightRadius:
                                                          "6px",
                                                  }
                                                : {
                                                      background:
                                                          "linear-gradient(145deg, rgba(15, 23, 43, 0.7), rgba(15, 23, 43, 0.4))",
                                                      border: "1px solid rgba(255, 255, 255, 0.06)",
                                                      borderBottomLeftRadius:
                                                          "6px",
                                                      backdropFilter:
                                                          "blur(16px)",
                                                      boxShadow:
                                                          "0 4px 20px rgba(0,0,0,0.15)",
                                                  }
                                        }
                                    >
                                        <div
                                            className="text-sm leading-relaxed"
                                            style={{
                                                color:
                                                    msg.role === "user"
                                                        ? "#fde68a"
                                                        : "#e2e8f0",
                                            }}
                                            dangerouslySetInnerHTML={{
                                                __html: formatMessage(
                                                    msg.content
                                                ),
                                            }}
                                        />
                                        <div
                                            className="text-xs mt-2.5"
                                            style={{ color: "#475569" }}
                                        >
                                            {msg.timestamp.toLocaleTimeString(
                                                "en-IN",
                                                {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                }
                                            )}
                                        </div>
                                    </div>
                                    {msg.role === "user" && (
                                        <div
                                            className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-1"
                                            style={{
                                                backgroundColor:
                                                    "rgba(99, 102, 241, 0.1)",
                                                border: "1px solid rgba(99, 102, 241, 0.15)",
                                            }}
                                        >
                                            <User
                                                size={16}
                                                style={{ color: "#818cf8" }}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-3 justify-start">
                                    <div
                                        className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, #f59e0b, #fbbf24)",
                                            boxShadow:
                                                "0 4px 15px rgba(245, 158, 11, 0.2)",
                                        }}
                                    >
                                        <Bot
                                            size={16}
                                            style={{ color: "#050818" }}
                                        />
                                    </div>
                                    <div
                                        className="rounded-2xl px-5 py-4"
                                        style={{
                                            background:
                                                "linear-gradient(145deg, rgba(15, 23, 43, 0.7), rgba(15, 23, 43, 0.4))",
                                            border: "1px solid rgba(255, 255, 255, 0.06)",
                                            backdropFilter: "blur(16px)",
                                        }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-1.5">
                                                <div
                                                    className="h-2 w-2 rounded-full animate-bounce"
                                                    style={{
                                                        backgroundColor:
                                                            "#fbbf24",
                                                        animationDelay: "0ms",
                                                    }}
                                                />
                                                <div
                                                    className="h-2 w-2 rounded-full animate-bounce"
                                                    style={{
                                                        backgroundColor:
                                                            "#fbbf24",
                                                        animationDelay:
                                                            "150ms",
                                                    }}
                                                />
                                                <div
                                                    className="h-2 w-2 rounded-full animate-bounce"
                                                    style={{
                                                        backgroundColor:
                                                            "#fbbf24",
                                                        animationDelay:
                                                            "300ms",
                                                    }}
                                                />
                                            </div>
                                            <span
                                                className="text-xs font-medium"
                                                style={{ color: "#64748b" }}
                                            >
                                                Medha is thinking...
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>

                {/* ‚îÄ‚îÄ‚îÄ Premium Input Area ‚îÄ‚îÄ‚îÄ */}
                <div
                    className="px-4 md:px-8 py-4 shrink-0"
                    style={{
                        background:
                            "linear-gradient(to top, rgba(5, 8, 24, 1), rgba(5, 8, 24, 0.95))",
                        borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                    }}
                >
                    <div
                        className="flex items-end gap-3 max-w-4xl mx-auto rounded-2xl p-2"
                        style={{
                            background:
                                "linear-gradient(145deg, rgba(15, 23, 43, 0.6), rgba(15, 23, 43, 0.3))",
                            border: "1px solid rgba(245, 158, 11, 0.1)",
                            backdropFilter: "blur(20px)",
                            boxShadow:
                                "0 -4px 30px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.02)",
                        }}
                    >
                        <button
                            onClick={toggleListening}
                            className="p-3 rounded-xl transition-all duration-300 shrink-0"
                            style={{
                                backgroundColor: isListening
                                    ? "rgba(239, 68, 68, 0.15)"
                                    : "rgba(255, 255, 255, 0.04)",
                                color: isListening ? "#ef4444" : "#64748b",
                                border: isListening
                                    ? "1px solid rgba(239, 68, 68, 0.2)"
                                    : "1px solid rgba(255, 255, 255, 0.06)",
                            }}
                            title={
                                isListening
                                    ? "Stop listening"
                                    : "Start voice input"
                            }
                        >
                            {isListening ? (
                                <MicOff
                                    size={18}
                                    className="animate-pulse"
                                />
                            ) : (
                                <Mic size={18} />
                            )}
                        </button>
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={
                                isListening
                                    ? "Listening... speak now"
                                    : "Ask Medha about colleges, cutoffs, careers..."
                            }
                            rows={1}
                            className="flex-1 resize-none bg-transparent outline-none text-sm py-3 placeholder-slate-600"
                            style={{
                                color: "#e2e8f0",
                                maxHeight: "120px",
                                minHeight: "44px",
                            }}
                            onInput={(e) => {
                                const t = e.target as HTMLTextAreaElement;
                                t.style.height = "44px";
                                t.style.height = t.scrollHeight + "px";
                            }}
                        />
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || isLoading}
                            className="p-3 rounded-xl transition-all duration-300 shrink-0 disabled:opacity-20"
                            style={{
                                background:
                                    input.trim() && !isLoading
                                        ? "linear-gradient(135deg, #f59e0b, #fbbf24)"
                                        : "rgba(255, 255, 255, 0.04)",
                                color:
                                    input.trim() && !isLoading
                                        ? "#050818"
                                        : "#64748b",
                                boxShadow:
                                    input.trim() && !isLoading
                                        ? "0 4px 15px rgba(245, 158, 11, 0.25)"
                                        : "none",
                            }}
                        >
                            {isLoading ? (
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                            ) : (
                                <Send size={18} />
                            )}
                        </button>
                    </div>
                    <p
                        className="text-center text-xs mt-2.5 font-medium"
                        style={{ color: "#334155" }}
                    >
                        Medha AI can make mistakes. Verify important info on
                        official websites.
                    </p>
                </div>
            </div>
        </DefaultLayout>
    );
}
