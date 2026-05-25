"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot } from "lucide-react";

export function ChatLoading() {
  return (
    <div className="flex gap-3 items-start animate-in fade-in duration-300">
      <Avatar className="h-8 w-8 border border-emerald-200 flex-shrink-0">
        <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900">
          <Bot className="h-4 w-4 text-emerald-500 dark:text-emerald-400 animate-pulse" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="flex gap-1.5">
          <span
            className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
