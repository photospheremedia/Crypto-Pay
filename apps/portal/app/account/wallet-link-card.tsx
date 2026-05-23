"use client";

import { useActionState, useEffect, useState } from "react";
import { saveWalletInfo, type WalletActionState } from "./get-started/actions";

type WalletProfile = {
  wallet_network: string;
  wallet_address: string;
  wallet_verified: boolean;
  updated_at: string | null;
};

const initialState: WalletActionState = {};

export function WalletLinkCard({
  walletProfile,
  onSaved,
}: {
  walletProfile: WalletProfile | null;
  onSaved: (profile: WalletProfile) => void;
}) {
  const [address, setAddress] = useState(walletProfile?.wallet_address || "");
  const [state, formAction, pending] = useActionState(saveWalletInfo, initialState);

  useEffect(() => {
    if (state.success) {
      onSaved({
        wallet_network: "btc",
        wallet_address: address,
        wallet_verified: false,
        updated_at: new Date().toISOString(),
      });
    }
  }, [state.success, onSaved, address]);

  useEffect(() => {
    setAddress(walletProfile?.wallet_address || "");
  }, [walletProfile?.wallet_address]);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-600">Wallet</p>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">Link payout wallet</h2>
        <p className="mt-1 text-sm text-slate-600">
          Keep this simple: set your network and wallet address. We persist it securely for your account.
        </p>
      </div>

      <form action={formAction} className="space-y-3">
        <input type="hidden" name="wallet_network" value="btc" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div className="md:col-span-1">
            <label className="block text-xs font-medium text-slate-600">
              Network
            </label>
            <div className="mt-1 inline-flex rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
              BTC
            </div>
          </div>
          <div className="md:col-span-3">
            <label htmlFor="wallet_address" className="block text-xs font-medium text-slate-600">
              Wallet address
            </label>
            <input
              id="wallet_address"
              name="wallet_address"
              type="text"
              required
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="Paste wallet address"
              className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {walletProfile?.wallet_verified ? (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700">
              Verified
            </span>
          ) : (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-amber-700">
              Pending verification
            </span>
          )}
          {walletProfile?.updated_at ? (
            <span className="text-slate-500">
              Updated {new Date(walletProfile.updated_at).toLocaleString()}
            </span>
          ) : null}
        </div>

        {state.error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </div>
        ) : null}
        {state.success ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {state.success}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="inline-flex rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Saving..." : "Save wallet"}
        </button>
      </form>
    </div>
  );
}
