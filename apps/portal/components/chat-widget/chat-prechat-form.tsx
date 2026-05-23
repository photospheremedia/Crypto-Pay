"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageCircle, ArrowRight, Sparkles } from "lucide-react";

interface PreChatFormProps {
  onSubmit: (data: { name: string; email: string }) => void;
  onSkip: () => void;
}

export function PreChatForm({ onSubmit, onSkip }: PreChatFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Please enter your name";
    }
    if (!email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({ name: name.trim(), email: email.trim() });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-linear-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      {/* Welcome Icon */}
      <div className="w-16 h-16 rounded-full bg-linear-to-br from-orange-500 to-orange-500 flex items-center justify-center mb-4 shadow-lg">
        <MessageCircle className="w-8 h-8 text-white" />
      </div>

      {/* Welcome Text */}
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
        Hi there! 👋
      </h3>
      <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-6 max-w-[280px]">
        Get personalized help for your restaurant. Share your info to get started.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="w-full max-w-[300px] space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Your Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="John"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            className={errors.name ? "border-red-500 focus:ring-red-500" : ""}
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@restaurant.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            className={errors.email ? "border-red-500 focus:ring-red-500" : ""}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full bg-linear-to-r from-orange-500 to-orange-500 hover:from-orange-600 hover:to-orange-500 text-white font-medium"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Start Chat
        </Button>
      </form>

      {/* Skip Option */}
      <button
        type="button"
        onClick={onSkip}
        className="mt-4 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 flex items-center gap-1 transition-colors"
      >
        Just browsing? Continue as guest
        <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  );
}
