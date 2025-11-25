"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface ChatResponse {
    message: string;
    suggestions?: string[];
    metadata?: {
        model: string;
        sessionId: string;
    };
}

export function AIChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId] = useState(() => crypto.randomUUID());
    const [suggestions, setSuggestions] = useState<string[]>([
        "How are my books performing this month?",
        "What pricing strategy should I use?",
        "How can I increase my book sales?",
        "Which platform is performing best?",
    ]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (messageText: string) => {
        if (!messageText.trim() || isLoading) return;

        const userMessage: Message = {
            role: "user",
            content: messageText,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/ai/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: messageText,
                    sessionId,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to get AI response");
            }

            const data = await response.json();
            const chatResponse: ChatResponse = data.data;

            const assistantMessage: Message = {
                role: "assistant",
                content: chatResponse.message,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);

            if (chatResponse.suggestions && chatResponse.suggestions.length > 0) {
                setSuggestions(chatResponse.suggestions);
            }
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = {
                role: "assistant",
                content: "I'm having trouble connecting right now. Please try again in a moment.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleSuggestionClick = (suggestion: string) => {
        sendMessage(suggestion);
    };

    return (
        <div className="flex flex-col h-[600px] border border-border rounded-lg bg-surface overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-cream">
                <Sparkles className="h-5 w-5 text-burgundy" />
                <h3 className="text-heading-3 text-ink">AI Assistant</h3>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                        <div className="w-16 h-16 rounded-full bg-cream flex items-center justify-center">
                            <Sparkles className="h-8 w-8 text-burgundy" />
                        </div>
                        <div>
                            <h4 className="text-heading-3 text-ink mb-2">
                                Hi! I'm your AI publishing assistant
                            </h4>
                            <p className="text-body text-charcoal max-w-md">
                                I can help you with book launches, pricing strategies, marketing advice, and
                                sales optimization. Ask me anything!
                            </p>
                        </div>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`max-w-[80%] rounded-lg px-4 py-3 ${message.role === "user"
                                    ? "bg-burgundy text-surface"
                                    : "bg-cream text-ink border border-border"
                                }`}
                        >
                            <p className="text-body whitespace-pre-wrap">{message.content}</p>
                            <p
                                className={`text-small mt-1 ${message.role === "user" ? "text-cream/70" : "text-charcoal/70"
                                    }`}
                            >
                                {message.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-cream border border-border rounded-lg px-4 py-3">
                            <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-burgundy" />
                                <p className="text-body text-charcoal">Thinking...</p>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 0 && suggestions.length > 0 && (
                <div className="px-4 py-3 border-t border-border bg-cream/50">
                    <p className="text-small text-charcoal mb-2">Suggested questions:</p>
                    <div className="flex flex-wrap gap-2">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={index}
                                onClick={() => handleSuggestionClick(suggestion)}
                                disabled={isLoading}
                                className="text-small px-3 py-1.5 rounded-full border border-border bg-surface hover:bg-cream transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {suggestion}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-4 border-t border-border bg-surface">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask me anything about your books..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 rounded-lg border border-border bg-surface text-ink placeholder:text-charcoal/50 focus:outline-none focus:ring-2 focus:ring-burgundy disabled:opacity-50"
                    />
                    <Button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="bg-burgundy hover:bg-burgundy/90 text-surface"
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                <p className="text-small text-charcoal/70 mt-2">
                    Powered by DeepSeek V3 • 20 messages per hour
                </p>
            </form>
        </div>
    );
}
