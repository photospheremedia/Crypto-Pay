'use client';

import { useState } from 'react';
import { Copy, Check, Loader2, Shield, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { enrollTOTP, verifyTOTPEnrollment } from '@/lib/mfa';
import Image from 'next/image';

interface MFASetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

type SetupStep = 'enroll' | 'verify' | 'complete';

export function MFASetupDialog({ open, onOpenChange, onSuccess }: MFASetupDialogProps) {
  const [step, setStep] = useState<SetupStep>('enroll');
  const [loading, setLoading] = useState(false);
  const [factorId, setFactorId] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const result = await enrollTOTP('Restaurant Hub Authenticator');

      if (result.success && result.qrCode && result.secret && result.factorId) {
        setFactorId(result.factorId);
        setQrCode(result.qrCode);
        setSecret(result.secret);
        setStep('verify');
      } else {
        toast({
          title: 'Enrollment failed',
          description: result.error || 'Failed to set up 2FA',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      toast({
        title: 'Invalid code',
        description: 'Please enter a 6-digit code',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await verifyTOTPEnrollment(factorId, code);

      if (result.success) {
        setStep('complete');
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      } else {
        toast({
          title: 'Verification failed',
          description: result.error || 'Invalid code. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      toast({
        title: 'Copied!',
        description: 'Secret key copied to clipboard',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: 'Copy failed',
        description: 'Please copy the secret manually',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    // Reset state
    setStep('enroll');
    setFactorId('');
    setQrCode('');
    setSecret('');
    setCode('');
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === 'enroll' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Enable Two-Factor Authentication
              </DialogTitle>
              <DialogDescription>
                Add an extra layer of security to your account by requiring a verification code in
                addition to your password.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium">What you'll need:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>An authenticator app (Google Authenticator, Authy, 1Password, etc.)</li>
                  <li>Your smartphone or tablet</li>
                </ul>
              </div>

              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium mb-2">How it works:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>Scan a QR code with your authenticator app</li>
                  <li>Enter the 6-digit code from the app</li>
                  <li>Use the code each time you log in</li>
                </ol>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleEnroll} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'verify' && (
          <>
            <DialogHeader>
              <DialogTitle>Scan QR Code</DialogTitle>
              <DialogDescription>
                Use your authenticator app to scan this QR code, then enter the 6-digit code to
                verify.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg border">
                  {qrCode && (
                    <Image
                      src={qrCode}
                      alt="2FA QR Code"
                      width={200}
                      height={200}
                      className="rounded"
                    />
                  )}
                </div>
              </div>

              {/* Manual Entry Option */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  Can't scan? Enter this code manually:
                </Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-3 py-2 bg-muted rounded text-sm font-mono break-all">
                    {secret}
                  </code>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleCopySecret}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Code Input */}
              <div className="space-y-2">
                <Label htmlFor="code">Enter 6-digit code</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest font-mono"
                  autoComplete="off"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleVerify} disabled={loading || code.length !== 6}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Enable
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'complete' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                2FA Enabled Successfully!
              </DialogTitle>
              <DialogDescription>
                Your account is now protected with two-factor authentication.
              </DialogDescription>
            </DialogHeader>

            <div className="py-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">
                You'll need to enter a code from your authenticator app each time you log in.
              </p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
