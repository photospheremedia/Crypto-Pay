"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function initialsFromName(name: string | null | undefined, email: string): string {
  const trimmed = name?.trim();
  if (trimmed) {
    const parts = trimmed.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
    }
    return trimmed.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function MerchantAvatar({
  name,
  email,
  className,
}: {
  name: string | null | undefined;
  email: string;
  className?: string;
}) {
  const initials = initialsFromName(name, email);

  return (
    <Avatar className={cn("size-9 shrink-0", className)}>
      <AvatarFallback className="bg-emerald-100 text-xs font-semibold text-emerald-800">
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
