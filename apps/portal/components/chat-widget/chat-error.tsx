"use client";

import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ChatErrorProps {
  onRetry: () => void;
}

export function ChatError({ onRetry }: ChatErrorProps) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 text-center shadow-sm">
      <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-3">
        ⚠️ Something went wrong. Please try again.
      </p>
      <Button
        onClick={onRetry}
        size="sm"
        variant="outline"
        className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900"
      >
        <RefreshCw className="h-3 w-3 mr-2" />
        Retry
      </Button>
    </div>
  );
}
