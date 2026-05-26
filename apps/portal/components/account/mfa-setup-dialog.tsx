'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, Check, Loader2, Shield } from 'lucide-react';
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
  const t = useTranslations('Account.mfa');
  const tCommon = useTranslations('Common');
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
      const result = await enrollTOTP('Crypto Pay Authenticator');

      if (result.success && result.qrCode && result.secret && result.factorId) {
        setFactorId(result.factorId);
        setQrCode(result.qrCode);
        setSecret(result.secret);
        setStep('verify');
      } else {
        toast({
          title: t('enrollmentFailed'),
          description: result.error || t('enrollmentFailedHint'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      toast({
        title: tCommon('error'),
        description: t('unexpectedError'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      toast({
        title: t('invalidCode'),
        description: t('invalidCodeHint'),
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
          title: t('verificationFailed'),
          description: result.error || t('invalidCodeRetry'),
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: tCommon('error'),
        description: t('unexpectedError'),
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
        title: tCommon('copied'),
        description: t('secretCopied'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: tCommon('copyFailed'),
        description: t('copyManually'),
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
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
                {t('title')}
              </DialogTitle>
              <DialogDescription>{t('description')}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <h4 className="font-medium">{t('needTitle')}</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t('needApp')}</li>
                  <li>{t('needDevice')}</li>
                </ul>
              </div>

              <div className="rounded-lg bg-muted p-4 text-sm">
                <p className="font-medium mb-2">{t('howTitle')}</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                  <li>{t('stepScan')}</li>
                  <li>{t('stepEnter')}</li>
                  <li>{t('stepLogin')}</li>
                </ol>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}>
                {tCommon('cancel')}
              </Button>
              <Button onClick={handleEnroll} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {tCommon('continue')}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'verify' && (
          <>
            <DialogHeader>
              <DialogTitle>{t('scanTitle')}</DialogTitle>
              <DialogDescription>{t('scanDescription')}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex justify-center">
                <div className="p-4 bg-white rounded-lg border">
                  {qrCode && (
                    <Image
                      src={qrCode}
                      alt={t('qrAlt')}
                      width={200}
                      height={200}
                      className="rounded"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">{t('manualEntry')}</Label>
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

              <div className="space-y-2">
                <Label htmlFor="code">{t('codeLabel')}</Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder={t('codePlaceholder')}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-2xl tracking-widest font-mono"
                  autoComplete="off"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}>
                {tCommon('cancel')}
              </Button>
              <Button onClick={handleVerify} disabled={loading || code.length !== 6}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {tCommon('verifyAndEnable')}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'complete' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                {t('completeTitle')}
              </DialogTitle>
              <DialogDescription>{t('completeDescription')}</DialogDescription>
            </DialogHeader>

            <div className="py-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                <Shield className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground">{t('completeHint')}</p>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
