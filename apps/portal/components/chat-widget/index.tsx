"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { MessageCircle, Bot } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatHeader } from "./chat-header";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { ChatSuggestions } from "./chat-suggestions";
import { PreChatForm } from "./chat-prechat-form";

// Generate a unique session ID
function generateSessionId() {
  return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function SupportChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showPreChat, setShowPreChat] = useState(true); // Show pre-chat form for guests
  const [guestInfo, setGuestInfo] = useState<{ name: string; email: string } | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [user, setUser] = useState<{
    id: string;
    email: string;
    name: string;
    avatar?: string;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMessageCountRef = useRef(0);

  // Initialize session ID
  useEffect(() => {
    if (!sessionId) {
      setSessionId(generateSessionId());
    }
  }, [sessionId]);

  // Load user from Supabase
  useEffect(() => {
    const supabase = createClient();

    async function loadUser() {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          const name =
            authUser.user_metadata?.given_name ||
            authUser.user_metadata?.full_name?.split(" ")[0] ||
            authUser.user_metadata?.name ||
            authUser.email?.split("@")[0] ||
            "User";

          setUser({
            id: authUser.id,
            email: authUser.email || "guest@example.com",
            name,
            avatar: authUser.user_metadata?.avatar_url,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Error loading user:", error);
        setUser(null);
      }
    }

    if (isOpen) {
      loadUser();
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          setUser(null);
          setShowPreChat(true); // Show pre-chat form again
        } else if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
          const name =
            session.user.user_metadata?.given_name ||
            session.user.user_metadata?.full_name?.split(" ")[0] ||
            session.user.user_metadata?.name ||
            session.user.email?.split("@")[0] ||
            "User";

          setUser({
            id: session.user.id,
            email: session.user.email || "guest@example.com",
            name,
            avatar: session.user.user_metadata?.avatar_url,
          });
          setShowPreChat(false); // Skip pre-chat for logged-in users
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [isOpen]);

  // Create transport with user context for analytics
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: {
          userId: user?.id,
          userName: user?.name || guestInfo?.name,
          userEmail: user?.email || guestInfo?.email,
          isGuest: !user && !!guestInfo,
        },
      }),
    [user?.id, user?.name, user?.email, guestInfo?.name, guestInfo?.email]
  );

  const { messages, sendMessage, status, error, stop, setMessages } = useChat({
    id: "support-chat",
    transport,
    onError: (error) => {
      console.error("[Chat Error]", error);
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  // Create conversation on first message
  const createConversation = useCallback(async () => {
    if (conversationId || !sessionId) return;

    try {
      const res = await fetch("/api/chat/conversation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          userId: user?.id,
          guestName: guestInfo?.name,
          guestEmail: guestInfo?.email,
          isGuest: !user,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
          referrer: typeof document !== "undefined" ? document.referrer : undefined,
          landingPage: typeof window !== "undefined" ? window.location.pathname : undefined,
        }),
      });
      const data = await res.json();
      if (data.id) {
        setConversationId(data.id);
      }
    } catch (error) {
      console.error("[Chat] Error creating conversation:", error);
    }
  }, [conversationId, sessionId, user?.id, guestInfo?.name, guestInfo?.email]);

  // Save messages periodically
  const saveMessages = useCallback(async () => {
    if (!conversationId || messages.length === 0) return;
    if (messages.length === lastMessageCountRef.current) return;

    // Only save new messages
    const newMessages = messages.slice(lastMessageCountRef.current);
    if (newMessages.length === 0) return;

    try {
      await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.parts?.map((p: any) => p.text).join("") || "",
          })),
        }),
      });
      lastMessageCountRef.current = messages.length;
    } catch (error) {
      console.error("[Chat] Error saving messages:", error);
    }
  }, [conversationId, messages]);

  // Save messages when they change (debounced via status)
  useEffect(() => {
    if (status === "ready" && messages.length > 0 && conversationId) {
      saveMessages();
    }
  }, [status, messages.length, conversationId, saveMessages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    // Create conversation on first message
    if (!conversationId && sessionId) {
      await createConversation();
    }
    sendMessage({ text: message });
  };

  const handleSuggestionClick = async (suggestion: string) => {
    // Create conversation on first message
    if (!conversationId && sessionId) {
      await createConversation();
    }
    sendMessage({ text: suggestion });
  };

  // Handlers for pre-chat form
  const handlePreChatSubmit = (data: { name: string; email: string }) => {
    setGuestInfo(data);
    setShowPreChat(false);
  };

  const handlePreChatSkip = () => {
    setGuestInfo({ name: "Guest", email: "" });
    setShowPreChat(false);
  };

  // End chat - clear messages and reset state
  const handleEndChat = async () => {
    // Mark conversation as ended
    if (conversationId) {
      try {
        await fetch("/api/chat/conversation", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            status: "ended",
          }),
        });
      } catch (error) {
        console.error("[Chat] Error ending conversation:", error);
      }
    }

    // Stop any ongoing stream
    if (isLoading) {
      stop();
    }
    // Clear all messages
    setMessages([]);
    // Reset conversation tracking
    setConversationId(null);
    setSessionId(generateSessionId());
    lastMessageCountRef.current = 0;
    // Reset guest info and show pre-chat form again for guests
    if (!user) {
      setGuestInfo(null);
      setShowPreChat(true);
    }
    // Close the widget
    setIsOpen(false);
    setIsMinimized(false);
  };

  // Check if we should show pre-chat form (only for guests, not logged-in users)
  const shouldShowPreChat = !user && showPreChat;

  // Closed state - button
  if (!isOpen) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="fixed bottom-6 right-6 z-50 h-14 rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all hover:scale-105 bg-linear-to-r from-orange-500 to-orange-500 hover:from-orange-600 hover:to-orange-500"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              <span className="font-medium">Chat</span>
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

  // Open state - widget
  // Minimized state - compact floating pill
  if (isOpen && isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 bg-linear-to-r from-orange-500 to-orange-500 text-white rounded-full shadow-2xl hover:shadow-orange-500/50 transition-all hover:scale-105 cursor-pointer border-2 border-orange-400/30"
      >
        <div className="relative">
          <Bot className="h-5 w-5" />
          {isLoading && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-200 rounded-full animate-pulse" />
          )}
        </div>
        <span className="font-medium text-sm">
          {isLoading ? "Typing..." : "Crypto Pay AI"}
        </span>
        {messages.length > 0 && (
          <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
            {messages.length}
          </span>
        )}
      </button>
    );
  }

  // Full open state - widget
  if (!isOpen) return null;

  return (
    <div className="fixed z-50 bottom-6 right-6 w-[420px] h-[600px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 transition-all duration-300 flex flex-col">
      <ChatHeader
        isLoading={isLoading}
        isMinimized={isMinimized}
        userName={user?.name || guestInfo?.name}
        hasMessages={messages.length > 0}
        onMinimize={() => setIsMinimized(true)}
        onClose={handleEndChat}
      />

      {/* Pre-chat form for guests */}
      {shouldShowPreChat ? (
        <PreChatForm
          onSubmit={handlePreChatSubmit}
          onSkip={handlePreChatSkip}
        />
      ) : (
        <>
          {/* Messages area */}
          <div className="flex-1 overflow-y-auto flex flex-col bg-linear-to-b from-slate-50/50 to-white dark:from-slate-900 dark:to-slate-900">
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              error={error}
              userName={user?.name || guestInfo?.name}
              userAvatar={user?.avatar}
              onRetry={() => {}}
            />
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions (show when no messages) */}
          {messages.length === 0 && !isLoading && (
            <ChatSuggestions onSelect={handleSuggestionClick} />
          )}

          {/* Input area */}
          <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-white dark:bg-slate-900 rounded-b-2xl">
            <ChatInput
              onSubmit={handleSendMessage}
              isLoading={isLoading}
              disabled={!!error}
              stop={stop}
            />
          </div>
        </>
      )}
    </div>
  );
}
