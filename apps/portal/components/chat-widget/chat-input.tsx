"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Send, Sparkles, StopCircle } from "lucide-react";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  disabled?: boolean;
  stop?: () => void;
}

export function ChatInput({
  onSubmit,
  isLoading,
  disabled = false,
  stop,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      const textarea = e.target;
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    },
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || disabled) return;

    onSubmit(input);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2 items-end">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="Ask me anything..."
          disabled={isLoading || disabled}
          className="flex-1 min-h-[44px] max-h-[200px] resize-none text-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-orange-500 dark:bg-slate-800 dark:text-white rounded-xl transition-all"
          rows={1}
        />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                disabled={isLoading || !input.trim() || disabled}
                size="icon"
                className="h-11 w-11 shrink-0 rounded-xl bg-linear-to-r from-orange-500 to-orange-500 hover:from-orange-600 hover:to-orange-500 shadow-lg hover:shadow-orange-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isLoading ? "Stop" : "Send (Enter)"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center flex items-center justify-center gap-1">
        <Sparkles className="h-3 w-3" />
        Powered by Groq AI
      </p>
    </form>
  );
}
