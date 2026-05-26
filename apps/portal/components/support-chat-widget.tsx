/* eslint-disable jsx-a11y/no-noninteractive-element-to-interactive-role */
"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { useTranslations } from "next-intl";
import { DefaultChatTransport } from "ai";
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Minimize2, 
  Maximize2, 
  RefreshCw,
  Copy,
  Check,
  StopCircle,
  Sparkles
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import ReactMarkdown from "react-markdown";

// Welcome message generator based on user
function getWelcomeMessage(userName?: string): string {
  if (userName) {
    return `Hi ${userName}! 👋 I'm your Crypto Pay assistant. How can I help you today? I can answer questions about our delivery integrations, supply marketplace, or technology services.`;
  }
  return "Hi! 👋 I'm your Crypto Pay assistant. How can I help you today? I can answer questions about our delivery integrations, supply marketplace, or technology services.";
}

export function SupportChatWidget() {
  const tCommon = useTranslations("Common");
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [userName, setUserName] = useState<string>();
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [tempName, setTempName] = useState("");
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Get user info from Supabase on mount and listen for auth changes
  useEffect(() => {
    const supabase = createClient();
    
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Extract name from OAuth metadata or email
          const name = user.user_metadata?.given_name || 
                      user.user_metadata?.full_name?.split(' ')[0] || 
                      user.user_metadata?.name || 
                      user.email?.split('@')[0];
          setUserName(name);
        } else {
          // Guest user - clear name
          setUserName(undefined);
          setShowNamePrompt(false);
        }
      } catch (error) {
        console.log('Error loading user:', error);
        setUserName(undefined);
      }
    }
    
    // Load user on mount and when chat opens
    if (isOpen) {
      loadUser();
    }
    
    // Listen for auth changes (sign in, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // User signed out - clear user data
        setUserName(undefined);
        setShowNamePrompt(false);
        setTempName('');
      } else if (event === 'SIGNED_IN' && session?.user) {
        // User signed in - update user data
        const name = session.user.user_metadata?.given_name || 
                    session.user.user_metadata?.full_name?.split(' ')[0] || 
                    session.user.user_metadata?.name || 
                    session.user.email?.split('@')[0];
        setUserName(name);
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Token refreshed - ensure user data is current
        const name = session.user.user_metadata?.given_name || 
                    session.user.user_metadata?.full_name?.split(' ')[0] || 
                    session.user.user_metadata?.name || 
                    session.user.email?.split('@')[0];
        setUserName(name);
      }
    });
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [isOpen]);
  
  // Create transport with API endpoint and user context
  const transport = useMemo(() => new DefaultChatTransport({ 
    api: "/api/chat",
    body: { userName }
  }), [userName]);
  
  const { messages, sendMessage, status, error, stop, regenerate } = useChat({
    id: "support-chat",
    transport,
    onError: (error) => {
      console.error("Chat error:", error);
    },
    onFinish: (message) => {
      console.log("Message finished:", message);
      // After first exchange, ask guest for name if not provided
      if (!userName && messages.length >= 2 && !showNamePrompt) {
        setShowNamePrompt(true);
      }
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    
    sendMessage({ text: inputValue });
    setInputValue("");
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };
  
  const handleNameSubmit = () => {
    if (tempName.trim()) {
      setUserName(tempName.trim());
      setShowNamePrompt(false);
      setTempName("");
    }
  };
  
  // Copy message to clipboard
  const handleCopy = useCallback(async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);
  
  // Auto-resize textarea
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
  }, []);
  
  // Helper to extract text from message parts
  const getMessageText = (parts: Array<{ type: string; text?: string }> | undefined): string => {
    if (!parts) return "";
    return parts
      .filter((part): part is { type: "text"; text: string } => part.type === "text" && !!part.text)
      .map((part) => part.text)
      .join("");
  };

  if (!isOpen) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="fixed bottom-6 right-6 z-50 h-14 rounded-full shadow-2xl hover:shadow-emerald-500/50 transition-all hover:scale-105 bg-linear-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Need Help?</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left" className="font-medium">
            <p>Chat with AI Assistant</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <div
      className={`fixed z-50 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 transition-all duration-300 ${
        isMinimized
          ? "bottom-6 right-6 w-80 h-16"
          : "bottom-6 right-6 w-105 h-150 max-h-[85vh]"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 bg-linear-to-r from-emerald-500 to-cyan-600 text-white rounded-t-2xl border-b border-emerald-400/20">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border-2 border-emerald-400/50">
            <AvatarFallback className="bg-emerald-500">
              <Bot className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-sm font-semibold flex items-center gap-2">
              Crypto Pay AI
              {isLoading && <Sparkles className="h-3 w-3 animate-pulse" />}
            </h3>
            {!isMinimized && (
              <p className="text-xs text-emerald-100 flex items-center gap-1">
                {isLoading ? (
                  <>
                    <span className="inline-block w-1.5 h-1.5 bg-emerald-200 rounded-full animate-pulse" />
                    {tCommon("thinking")}
                  </>
                ) : (
                  <>
                    <span className="inline-block w-1.5 h-1.5 bg-emerald-200 rounded-full" />
                    Online • Instant replies
                  </>
                )}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsMinimized(!isMinimized)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-emerald-500/50 text-white"
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isMinimized ? "Maximize" : "Minimize"}</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsOpen(false)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-emerald-500/50 text-white"
                >
                  <X className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Close chat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-140px)] bg-linear-to-b from-slate-50/50 to-white dark:from-slate-900 dark:to-slate-900">
            {/* Static welcome message */}
            <div className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Avatar className="h-8 w-8 border border-emerald-200">
                <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900">
                  <Bot className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="prose prose-sm max-w-none bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm border border-slate-100 dark:border-slate-700">
                  <p className="text-slate-700 dark:text-slate-300 m-0">
                    {getWelcomeMessage(userName)}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Name prompt for guests */}
            {showNamePrompt && !userName && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-linear-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 border-2 border-emerald-200 dark:border-emerald-800 rounded-xl p-4 shadow-sm">
                <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  What's your name? This helps me provide personalized service!
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                    placeholder="Your name..."
                    className="flex-1 px-3 py-2 text-sm border-2 border-emerald-300 dark:border-emerald-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:text-white"
                  />
                  <Button
                    onClick={handleNameSubmit}
                    size="sm"
                    className="bg-emerald-500 hover:bg-emerald-600"
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => setShowNamePrompt(false)}
                    size="sm"
                    variant="ghost"
                    className="text-emerald-600 dark:text-emerald-300"
                  >
                    Skip
                  </Button>
                </div>
              </div>
            )}
            
            {/* Dynamic messages */}
            {messages.map((message, index) => {
              const isUser = message.role === "user";
              const messageText = getMessageText(message.parts as Array<{ type: string; text?: string }>);
              
              return (
                <div
                  key={message.id}
                  className={`flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                    isUser ? "flex-row-reverse" : ""
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {!isUser && (
                    <Avatar className="h-8 w-8 border border-emerald-200">
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
                        <p className="text-sm whitespace-pre-wrap">{messageText}</p>
                      ) : (
                        // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="m-0 text-slate-700 dark:text-slate-300">{children}</p>,
                              ul: ({ children }) => <ul className="my-2 ml-4 list-disc text-slate-700 dark:text-slate-300 space-y-1">{children}</ul>,
                              ol: ({ children }) => <ol className="my-2 ml-4 list-decimal text-slate-700 dark:text-slate-300 space-y-1">{children}</ol>,
                              // The markdown renderer can produce loose list items - this is valid HTML5
                              // eslint-disable-next-line jsx-a11y/no-noninteractive-element-to-interactive-role
                              li: ({ children }) => <li className="text-slate-700 dark:text-slate-300 text-sm">{children}</li>,
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
                              strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-slate-100">{children}</strong>,
                            }}
                          >
                            {messageText}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                    
                    {/* Message actions for assistant messages */}
                    {!isUser && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => handleCopy(messageText, message.id)}
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0"
                              >
                                {copiedMessageId === message.id ? (
                                  <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{copiedMessageId === message.id ? "Copied!" : "Copy message"}</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          {index === messages.length - 1 && !isLoading && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => regenerate()}
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
                    <Avatar className="h-8 w-8 border border-slate-200">
                      <AvatarFallback className="bg-slate-100 dark:bg-slate-800">
                        <User className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              );
            })}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3 items-start animate-in fade-in duration-300">
                <Avatar className="h-8 w-8 border border-emerald-200">
                  <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900">
                    <Bot className="h-4 w-4 text-emerald-500 dark:text-emerald-400 animate-pulse" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-md shadow-sm border border-slate-100 dark:border-slate-700">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
                  </div>
                </div>
              </div>
            )}
            
            {/* Error state with retry */}
            {error && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-red-50 dark:bg-red-950 border-2 border-red-200 dark:border-red-800 rounded-xl p-4 text-center shadow-sm">
                <p className="text-sm text-red-700 dark:text-red-300 font-medium mb-3">
                  ⚠️ Something went wrong. Please try again.
                </p>
                <Button
                  onClick={() => regenerate()}
                  size="sm"
                  variant="outline"
                  className="border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Retry
                </Button>
              </div>
            )}
            
            {/* Stop button when streaming */}
            {isLoading && (
              <div className="flex justify-center animate-in fade-in duration-300">
                <Button
                  onClick={stop}
                  size="sm"
                  variant="outline"
                  className="shadow-sm"
                >
                  <StopCircle className="h-3 w-3 mr-2" />
                  Stop generating
                </Button>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-b-2xl"
          >
            <div className="flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleTextareaChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                placeholder="Type your message..."
                disabled={isLoading || !!error}
                className="flex-1 min-h-11 max-h-50 resize-none text-sm border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500 dark:bg-slate-800 dark:text-white rounded-xl"
                rows={1}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="submit"
                      disabled={isLoading || !inputValue.trim() || !!error}
                      size="icon"
                      className="h-11 w-11 shrink-0 rounded-xl bg-linear-to-r from-emerald-500 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 shadow-lg hover:shadow-emerald-500/50 transition-all"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send message (Enter)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-600 text-center mt-2 flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3" />
              Powered by FREE Groq AI • <a href="/privacy-policy" className="underline hover:text-emerald-500">Privacy</a>
            </p>
          </form>
        </>
      )}
    </div>
  );
}
