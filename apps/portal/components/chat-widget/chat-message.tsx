"use client";

import { UIMessage } from "ai";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

interface ChatMessageProps {
  message: UIMessage;
  isLast: boolean;
  isLoading: boolean;
  onRegenerate: () => void;
  userName?: string;
}

export function ChatMessage({
  message,
  isLast,
  isLoading,
  onRegenerate,
  userName,
}: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  // Extract text from message parts (official SDK structure)
  const messageText = message.parts
    .filter((part) => part.type === "text")
    .map((part) => (part as any).text)
    .join("");

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  }, [messageText]);

  return (
    <div
      className={`flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300 ${
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
          className={`inline-block max-w-[85%] px-4 py-3 rounded-2xl shadow-sm transition-all hover:shadow-md ${
            isUser
              ? "bg-linear-to-r from-emerald-500 to-cyan-600 text-white rounded-tr-md"
              : "bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-tl-md"
          }`}
        >
          {isUser ? (
            <p className="text-sm whitespace-pre-wrap break-words">{messageText}</p>
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
                  strong: ({ children }) => (
                    <strong className="font-semibold text-slate-900 dark:text-slate-100">
                      {children}
                    </strong>
                  ),
                }}
              >
                {messageText}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Message actions */}
        {!isUser && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleCopy}
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                  >
                    {copied ? (
                      <Check className="h-3 w-3 text-emerald-500" />
                    ) : (
                      <Copy className="h-3 w-3" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? "Copied!" : "Copy message"}</p>
                </TooltipContent>
              </Tooltip>

              {isLast && !isLoading && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onRegenerate}
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Regenerate response</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </TooltipProvider>
          </div>
        )}
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 border border-slate-200 flex-shrink-0">
          <AvatarFallback className="bg-slate-100 dark:bg-slate-800">
            {userName ? (
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {userName.charAt(0).toUpperCase()}
              </span>
            ) : (
              <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            )}
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
