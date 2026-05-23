"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { X, Minus, Bot, Sparkles } from "lucide-react";

interface ChatHeaderProps {
  isLoading: boolean;
  isMinimized: boolean;
  userName?: string;
  hasMessages: boolean;
  onMinimize: () => void;
  onClose: () => void;
}

export function ChatHeader({
  isLoading,
  isMinimized,
  userName,
  hasMessages,
  onMinimize,
  onClose,
}: ChatHeaderProps) {
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const handleCloseClick = () => {
    if (hasMessages) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    onClose();
  };

  // Close confirmation overlay
  if (showCloseConfirm) {
    return (
      <div className="flex flex-col bg-linear-to-r from-orange-500 to-orange-500 text-white rounded-t-2xl border-b border-orange-400/20 flex-shrink-0">
        <div className="px-4 py-3 text-center">
          <p className="text-sm font-medium mb-3">End this conversation?</p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => setShowCloseConfirm(false)}
              size="sm"
              variant="ghost"
              className="text-white hover:bg-orange-500/50 text-xs px-3"
            >
              Keep chatting
            </Button>
            <Button
              onClick={handleConfirmClose}
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white text-xs px-3"
            >
              End chat
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-3.5 bg-linear-to-r from-orange-500 to-orange-500 text-white rounded-t-2xl border-b border-orange-400/20 flex-shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar className="h-9 w-9 border-2 border-orange-400/50 flex-shrink-0">
          <AvatarFallback className="bg-orange-500">
            <Bot className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold flex items-center gap-2 truncate">
            Restaurant Hub AI
            {isLoading && <Sparkles className="h-3 w-3 animate-pulse flex-shrink-0" />}
          </h3>
          {!isMinimized && (
            <p className="text-xs text-orange-100 flex items-center gap-1 truncate">
              {isLoading ? (
                <>
                  <span className="inline-block w-1.5 h-1.5 bg-orange-200 rounded-full animate-pulse flex-shrink-0" />
                  Thinking...
                </>
              ) : (
                <>
                  <span className="inline-block w-1.5 h-1.5 bg-orange-200 rounded-full flex-shrink-0" />
                  Online
                </>
              )}
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        <TooltipProvider>
          {!isMinimized && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onMinimize}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-orange-500/50 text-white"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Minimize</p>
              </TooltipContent>
            </Tooltip>
          )}

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleCloseClick}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-orange-500/50 text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>End chat</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
