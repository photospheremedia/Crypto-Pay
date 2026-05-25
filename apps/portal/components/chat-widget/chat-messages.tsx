"use client";

import { UIMessage } from "ai";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Check, RefreshCw, Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useCallback, useState } from "react";

interface ChatMessagesProps {
  messages: UIMessage[];
  isLoading: boolean;
  error: Error | undefined;
  userName?: string;
  userAvatar?: string;
  onRetry: () => void;
}

export function ChatMessages({
  messages,
  isLoading,
  error,
  userName,
  userAvatar,
  onRetry,
}: ChatMessagesProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getMessageText = (message: UIMessage): string => {
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => (part as any).text)
      .join("");
  };

  const handleCopy = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.length === 0 && !isLoading && (
        <div className="flex gap-3 items-start">
          <Avatar className="h-8 w-8 border border-emerald-200 flex-shrink-0">
            <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900">
              <Bot className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
            </AvatarFallback>
          </Avatar>
          <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm border border-slate-100 dark:border-slate-700 max-w-[85%]">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Hi {userName || "there"}! 👋 I'm your Crypto Pay AI assistant. How can I help you today?
            </p>
          </div>
        </div>
      )}

      {messages.map((message, index) => {
        const isUser = message.role === "user";
        const text = getMessageText(message);

        return (
          <div
            key={message.id}
            className={`flex gap-3 items-start ${
              isUser ? "flex-row-reverse" : ""
            }`}
          >
            {!isUser && (
              <Avatar className="h-8 w-8 border border-emerald-200 flex-shrink-0">
                <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900">
                  <Bot className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                </AvatarFallback>
              </Avatar>
            )}

            <div className={`flex-1 space-y-2 group ${isUser ? "flex flex-col items-end" : ""}`}>
              <div
                className={`inline-block max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
                  isUser
                    ? "bg-linear-to-r from-emerald-500 to-cyan-600 text-white rounded-tr-md"
                    : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-md"
                }`}
              >
                {isUser ? (
                  <p className="text-sm whitespace-pre-wrap break-words">{text}</p>
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="m-0 text-slate-700 dark:text-slate-300">
                            {children}
                          </p>
                        ),
                        ul: ({ children }) => (
                          <ul className="my-2 ml-4 list-disc text-slate-700 dark:text-slate-300">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="my-2 ml-4 list-decimal text-slate-700 dark:text-slate-300">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => <li className="my-1">{children}</li>,
                        code: ({ children, ...props }) => {
                          const isInline = !props.className;
                          return isInline ? (
                            <code className="bg-slate-100 dark:bg-slate-900 px-1.5 py-0.5 rounded text-xs font-mono text-emerald-500 dark:text-emerald-400">
                              {children}
                            </code>
                          ) : (
                            <code className="block bg-slate-100 dark:bg-slate-900 p-3 rounded-lg text-xs font-mono overflow-x-auto">
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {!isUser && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={() => handleCopy(text, message.id)}
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                        >
                          {copiedId === message.id ? (
                            <Check className="h-3 w-3 text-emerald-500" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{copiedId === message.id ? "Copied!" : "Copy"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}
            </div>

            {isUser && (
              <Avatar className="h-8 w-8 border border-slate-200 flex-shrink-0">
                {userAvatar ? (
                  <AvatarImage src={userAvatar} alt={userName} />
                ) : null}
                <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
                  {userName?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        );
      })}

      {isLoading && (
        <div className="flex gap-3 items-start">
          <Avatar className="h-8 w-8 border border-emerald-200 flex-shrink-0">
            <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900">
              <Bot className="h-4 w-4 text-emerald-500 dark:text-emerald-400 animate-pulse" />
            </AvatarFallback>
          </Avatar>
          <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex gap-1.5">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 text-center shadow-sm">
          <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-3">
            ⚠️ Something went wrong
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
      )}
    </div>
  );
}
