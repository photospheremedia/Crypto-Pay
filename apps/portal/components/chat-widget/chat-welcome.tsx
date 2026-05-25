"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, Sparkles } from "lucide-react";

interface ChatWelcomeProps {
  message: string;
}

export function ChatWelcome({ message }: ChatWelcomeProps) {
  return (
    <div className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Avatar className="h-8 w-8 border border-emerald-200 flex-shrink-0">
        <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900">
          <Bot className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-3">
        <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm border border-slate-100 dark:border-slate-700">
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {message}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <QuickAction text="Delivery Integration" />
          <QuickAction text="Supply Marketplace" />
          <QuickAction text="Technology Services" />
        </div>
      </div>
    </div>
  );
}

function QuickAction({ text }: { text: string }) {
  return (
    <button className="text-xs px-3 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-900 transition-colors border border-emerald-200 dark:border-emerald-800">
      {text}
    </button>
  );
}
