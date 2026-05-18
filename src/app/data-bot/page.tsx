'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Database, Loader2, Sparkles } from 'lucide-react';
import DefaultLayout from '../defaultLayout';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function DataBotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm the EduNext Data Bot. Ask me about college fees, placements, or locations, and I'll fetch the exact data from our database!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          
          if (event.error === 'not-allowed') {
            alert('Microphone access denied. Please allow microphone access in your browser settings.');
          }
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Please try Chrome or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMsg } as Message];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/data-bot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      
      if (res.ok && data.response) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${data.error || 'Failed to connect to database'}` }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Network error occurred." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-[#020205] text-slate-300 py-10 px-4">
        <div className="max-w-4xl mx-auto flex flex-col h-[85vh] bg-[#0a0f1c] rounded-2xl shadow-2xl border border-indigo-500/20 overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 p-6 flex items-center gap-4 border-b border-white/5">
            <div className="bg-indigo-500 p-3 rounded-xl shadow-[0_0_15px_rgba(79,70,229,0.5)]">
              <Database size={24} className="text-white animate-pulse" />
            </div>
            <div>
              <h1 className="text-white font-bold text-xl flex items-center gap-2">
                EduNext Data Bot
                <Sparkles size={18} className="text-amber-400" />
              </h1>
              <p className="text-indigo-300 text-sm">Live Direct Database Connection</p>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] rounded-2xl p-4 text-[15px] shadow-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-[#151b2e] text-slate-200 rounded-bl-none border border-white/5'
                  }`}
                >
                  <div 
                    className="prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: msg.content.replace(/\n/g, '<br/>') }}
                  />
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-[#151b2e] border border-white/5 rounded-2xl rounded-bl-none p-4 shadow-sm flex items-center gap-3">
                  <Loader2 size={18} className="text-indigo-400 animate-spin" />
                  <span className="text-slate-400 text-sm">Querying Supabase database directly...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-5 bg-[#0d1326] border-t border-white/5">
            <form onSubmit={handleSubmit} className="flex items-center gap-3 relative max-w-3xl mx-auto">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "E.g., What are the fees for NMIMS Mumbai?"}
                className="flex-1 bg-[#1a233a] border border-indigo-500/30 text-white text-base rounded-full pl-6 pr-28 py-4 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder:text-slate-500 shadow-inner"
              />
              <div className="absolute right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`p-2.5 transition-all rounded-full ${
                    isListening 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20'
                  }`}
                  title={isListening ? "Stop recording" : "Start voice input"}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="p-2.5 bg-indigo-600 text-white rounded-full hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
            <div className="text-center mt-3">
              <p className="text-xs text-slate-500">
                {isListening ? '🎤 Listening... Speak now!' : 'Data Bot fetches exact data from the EduNext database. Click the mic to speak!'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(79, 70, 229, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(79, 70, 229, 0.5);
        }
      `}</style>
    </DefaultLayout>
  );
}