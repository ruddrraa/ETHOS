"use client";

import { useChat } from '@ai-sdk/react';
import { Brain, Sparkles, User, Loader2, ArrowUp, Plus, AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ChatInterface() {
  const { messages, sendMessage, status, error, setMessages, regenerate, clearError } = useChat({
    onError: (err) => {
      console.error('[Chat Error]', err);
    },
  });

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const isLoading = status === 'submitted' || status === 'streaming';
  
  // HRMS-relevant suggested actions
  const suggestions = [
    "Who am I? Show my profile details",
    "Show my attendance this month",
    "What are my leave balances?",
    "Explain my salary breakdown",
    "Show my latest payslip",
    "Draft a leave application for tomorrow",
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Extract text content from a message's parts
  const getMessageText = (message: typeof messages[number]): string => {
    return message.parts
      .filter((part): part is { type: 'text'; text: string } => part.type === 'text')
      .map(part => part.text)
      .join('');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    sendMessage({ text: trimmed });
    setInputValue('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading) return;
    sendMessage({ text: suggestion });
  };

  const handleNewChat = () => {
    setMessages([]);
    setInputValue('');
    clearError();
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFormSubmit(e);
    }
  };

  return (
    <div className="flex w-full h-[calc(100vh-80px)] overflow-hidden bg-background text-foreground rounded-3xl border border-border/50 shadow-soft-lg">
      {/* Sidebar for chat history / actions (hidden on mobile, visible on lg) */}
      <div className="hidden lg:flex flex-col w-[300px] border-r border-border/50 p-6 bg-muted/30">
        <Button 
          variant="outline" 
          className="justify-start gap-2 bg-background border-border/50 hover:bg-muted hover:text-foreground rounded-2xl h-12 w-full mb-8 shadow-sm"
          onClick={handleNewChat}
        >
          <Plus className="h-5 w-5" />
          New Chat
        </Button>
        <div className="space-y-4">
          <button className="text-sm text-left text-muted-foreground hover:text-foreground transition-colors w-full px-3 py-2 rounded-lg hover:bg-muted/50 font-medium">
            HR Policy Questions
          </button>
          <button className="text-sm text-left text-muted-foreground hover:text-foreground transition-colors w-full px-3 py-2 rounded-lg hover:bg-muted/50 font-medium">
            My Attendance & Leave
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative max-w-4xl mx-auto w-full">
        
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 mt-12 animate-in fade-in duration-700">
            <h1 className="text-3xl font-bold mb-2 tracking-tight">Ready when you are.</h1>
            <p className="text-muted-foreground text-center max-w-md mb-8">
              Use natural language to check attendance, leave balances, salary info, and get HR assistance.
            </p>
            <div className="bg-muted border border-border/50 rounded-full px-6 py-2 text-sm text-muted-foreground shadow-sm">
              Example: &quot;Show my attendance this month&quot;
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 scroll-smooth pb-32">
            {messages.map((m) => {
              const text = getMessageText(m);
              return (
                <div key={m.id} className={`flex gap-4 max-w-3xl ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                  <div className={`shrink-0 flex items-center justify-center h-8 w-8 rounded-full shadow-sm ${m.role === 'user' ? 'bg-primary' : 'bg-muted border border-border'}`}>
                    {m.role === 'user' ? <User className="h-5 w-5 text-primary-foreground" /> : <Brain className="h-5 w-5 text-primary" />}
                  </div>
                  <div className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                    <div className={`px-5 py-3 rounded-2xl shadow-sm ${
                      m.role === 'user' 
                        ? 'bg-primary/10 text-foreground border border-primary/20 rounded-tr-sm' 
                        : 'bg-white border border-border/50 text-foreground prose prose-p:leading-relaxed prose-pre:bg-muted prose-pre:border prose-pre:border-border max-w-none'
                    }`}>
                      {m.role === 'user' ? (
                        text
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {text}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex gap-4 max-w-3xl">
                <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-muted border border-border shadow-sm">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-white border border-border/50 shadow-sm flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  <span className="text-muted-foreground text-sm font-medium">Thinking...</span>
                </div>
              </div>
            )}
            {error && (
              <div className="flex gap-4 max-w-3xl">
                <div className="shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-destructive/10 border border-destructive/20 shadow-sm">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div className="px-5 py-4 rounded-2xl bg-destructive/5 border border-destructive/20 shadow-sm flex items-center gap-3">
                  <span className="text-destructive text-sm font-medium">
                    Something went wrong. Please try again.
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => regenerate()}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Retry
                  </Button>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-background via-background/90 to-transparent pt-12">
          <form 
            onSubmit={handleFormSubmit} 
            className="relative max-w-3xl mx-auto flex items-center bg-white border border-border rounded-[2rem] p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/30 transition-all shadow-md"
          >
            <div className="pl-4 pr-2 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <input 
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your attendance, leave, salary, or any HR query..." 
              className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder:text-muted-foreground h-12 text-base px-2" 
            />
            <Button 
              type="submit" 
              disabled={isLoading || !inputValue.trim()} 
              size="icon"
              className="rounded-full h-10 w-10 bg-primary/10 hover:bg-primary/20 text-primary disabled:opacity-30 border-0 shrink-0 ml-2"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </form>
          <p className="text-center text-xs text-muted-foreground mt-4 font-medium">
            HRMS AI Assistant can make mistakes. Verify important information.
          </p>
        </div>
      </div>

      {/* Right Sidebar for Suggestions (visible on large screens when empty) */}
      {messages.length === 0 && (
        <div className="hidden xl:flex flex-col w-[320px] p-8 mt-12 gap-6 bg-muted/10 border-l border-border/50">
          <div className="bg-white border border-border/50 rounded-3xl p-6 shadow-sm">
            <h3 className="text-[11px] font-bold text-muted-foreground tracking-[0.2em] mb-4 uppercase">Suggested Actions</h3>
            <div className="space-y-2">
              {suggestions.map((suggestion, i) => (
                <button 
                  key={i} 
                  className="w-full text-left p-3 rounded-2xl bg-muted/30 hover:bg-muted text-sm text-foreground transition-all border border-transparent hover:border-border/50 font-medium"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isLoading}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bg-white border border-border/50 rounded-3xl p-6 shadow-sm text-muted-foreground text-sm leading-relaxed font-medium">
            The HRMS AI Assistant securely works with your employee profile, attendance, leave, and payroll data to assist with HR operations in real time.
          </div>
        </div>
      )}
    </div>
  );
}
