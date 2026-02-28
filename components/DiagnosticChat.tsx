"use client";

import { useState, useRef, useEffect } from "react";
import type { DiagnosisResult } from "@/lib/database.types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface DiagnosticChatProps {
  onDiagnosisComplete?: (diagnosis: DiagnosisResult) => void;
}

export function DiagnosticChat({ onDiagnosisComplete }: DiagnosticChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm here to help diagnose your appliance issue. What type of appliance are you having trouble with?" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDiagnosisComplete, setIsDiagnosisComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content: userMessage }],
        }),
      });

      if (!response.ok) throw new Error("Failed to get response");

      let assistantMessage = "";
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              assistantMessage += parsed.text;
            } catch {}
          }
        }
      }

      // Check if assistant message contains JSON (diagnosis complete)
      try {
        const jsonMatch = assistantMessage.match(/\{[\s\S]*"appliance_type"[\s\S]*\}/);
        if (jsonMatch) {
          const diagnosis = JSON.parse(jsonMatch[0]) as DiagnosisResult;
          setIsDiagnosisComplete(true);
          onDiagnosisComplete?.(diagnosis);
          // Add assistant message but mark as diagnosis result
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "Great! I've gathered all the information I need. Here's the diagnosis. You'll now be able to see the estimate and submit your lead." }
          ]);
          return;
        }
      } catch {}

      setMessages((prev) => [...prev, { role: "assistant", content: assistantMessage }]);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background border rounded-lg shadow-sm">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-card-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-card text-card-foreground px-4 py-2 rounded-lg">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      {!isDiagnosisComplete && (
        <div className="border-t p-4">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your response..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 border rounded-lg bg-background text-foreground disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg disabled:opacity-50 hover:opacity-90"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
