"use client";

import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { parseAdminApiResponse } from "@/lib/admin/parse-admin-api-response";

export function MerchantEmailDialog({
  merchantUserId,
  merchantEmail,
  walletId,
  defaultSubject,
  triggerLabel = "Email merchant",
}: {
  merchantUserId: string;
  merchantEmail: string;
  walletId?: string;
  defaultSubject?: string;
  triggerLabel?: string;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState(defaultSubject ?? "Regarding your payout wallet");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const send = async () => {
    setSending(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/admin/users/${merchantUserId}/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject,
          message,
          walletId,
        }),
      });
      const parsed = await parseAdminApiResponse<{ success: boolean }>(
        res,
        "Failed to send email",
      );
      if (!parsed.ok) {
        toast({
          title: "Email not sent",
          description: parsed.error,
          variant: "destructive",
        });
        setFeedback({ type: "error", text: parsed.error });
        return;
      }
      toast({
        title: "Email sent",
        description: "The merchant can reply directly to your inbox.",
      });
      setFeedback({
        type: "success",
        text: "Email sent via Resend. The merchant can reply directly to your inbox.",
      });
      setMessage("");
    } catch (e) {
      const text = e instanceof Error ? e.message : "Failed to send email";
      toast({ title: "Email not sent", description: text, variant: "destructive" });
      setFeedback({ type: "error", text });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setSubject(defaultSubject ?? "Regarding your payout wallet");
          setFeedback(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          <Mail data-icon="inline-start" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Email merchant</DialogTitle>
          <DialogDescription>
            Sends through Resend to <strong>{merchantEmail}</strong>. Reply-To is your admin
            email so they can respond directly.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="merchant-email-subject">Subject</Label>
            <Input
              id="merchant-email-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="merchant-email-body">Message</Label>
            <Textarea
              id="merchant-email-body"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Explain what you need from the merchant…"
            />
          </div>
          {feedback ? (
            <Alert variant={feedback.type === "error" ? "destructive" : "default"}>
              <AlertDescription>{feedback.text}</AlertDescription>
            </Alert>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={sending || !subject.trim() || !message.trim()}
            onClick={() => void send()}
          >
            {sending ? (
              <>
                <Loader2 className="animate-spin" data-icon="inline-start" />
                Sending…
              </>
            ) : (
              "Send email"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
