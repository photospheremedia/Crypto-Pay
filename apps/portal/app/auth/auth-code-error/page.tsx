'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { PageLoading } from '@/components/ui/loading-indicator';

/**
 * Maps technical error messages to user-friendly messages.
 * Technical details are logged to console for developers only.
 */
function getUserFriendlyMessage(technicalError: string | null): {
    title: string;
    message: string;
    suggestion: string;
} {
    // Log technical error for developers (only visible in browser console)
    if (technicalError && process.env.NODE_ENV === 'development') {
        console.error('[Auth Error - Technical Details]:', technicalError);
    }

    // Default friendly message
    const defaultError = {
        title: 'Sign-in unsuccessful',
        message: 'We couldn\'t complete your sign-in.',
        suggestion: 'Please try again or use a different sign-in method.',
    };

    if (!technicalError) return defaultError;

    const errorLower = technicalError.toLowerCase();

    // PKCE / Session errors
    if (errorLower.includes('pkce') || errorLower.includes('code verifier') || errorLower.includes('storage')) {
        return {
            title: 'Session expired',
            message: 'Your sign-in session has expired or was interrupted.',
            suggestion: 'Please start the sign-in process again. Make sure to complete it in the same browser window.',
        };
    }

    // API / Configuration errors (should not happen in production)
    if (errorLower.includes('api key') || errorLower.includes('invalid key') || errorLower.includes('unauthorized')) {
        return {
            title: 'Service temporarily unavailable',
            message: 'We\'re experiencing a temporary issue with our authentication service.',
            suggestion: 'Please try again in a few moments. If the problem persists, contact support.',
        };
    }

    // OAuth provider errors
    if (errorLower.includes('access_denied') || errorLower.includes('cancelled')) {
        return {
            title: 'Sign-in cancelled',
            message: 'The sign-in was cancelled or access was denied.',
            suggestion: 'If you didn\'t intend to cancel, please try signing in again.',
        };
    }

    // Email/account errors
    if (errorLower.includes('email') || errorLower.includes('account')) {
        return {
            title: 'Account issue',
            message: 'There was an issue with your account.',
            suggestion: 'Please check your email or try a different sign-in method.',
        };
    }

    // Network/timeout errors
    if (errorLower.includes('network') || errorLower.includes('timeout') || errorLower.includes('fetch')) {
        return {
            title: 'Connection problem',
            message: 'We couldn\'t connect to our authentication service.',
            suggestion: 'Please check your internet connection and try again.',
        };
    }

    return defaultError;
}

function ErrorContent() {
    const searchParams = useSearchParams();
    const technicalError = searchParams.get('error');
    const { title, message, suggestion } = getUserFriendlyMessage(technicalError);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
                {/* Error Icon */}
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <AlertCircle className="w-8 h-8 text-emerald-500" />
                </div>

                {/* User-friendly title */}
                <h1 className="text-2xl font-bold text-slate-900 mb-3">{title}</h1>

                {/* User-friendly message */}
                <p className="text-slate-600 mb-2">{message}</p>
                <p className="text-slate-500 text-sm mb-6">{suggestion}</p>

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        href="/login"
                        className="inline-block w-full bg-emerald-500 text-white px-6 py-3 rounded-full font-medium hover:bg-emerald-600 transition"
                    >
                        Try Again
                    </Link>
                    <Link
                        href="/"
                        className="inline-block w-full text-slate-600 px-6 py-2 hover:text-slate-900 transition text-sm"
                    >
                        Return to Home
                    </Link>
                </div>

                {/* Support link */}
                <p className="mt-6 text-xs text-slate-400">
                    Need help?{' '}
                    <Link href="/contact" className="text-emerald-500 hover:underline">
                        Contact Support
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={<PageLoading />}>
            <ErrorContent />
        </Suspense>
    );
}
