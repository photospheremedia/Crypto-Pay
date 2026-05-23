"use client";

import { useActionState } from "react";
import { saveWalletInfo, type WalletActionState } from "./actions";

const initialState: WalletActionState = {};

export function WalletGetStartedForm({
  defaultAddress,
  walletVerified,
  updatedAt,
}: {
  defaultAddress: string;
  walletVerified: boolean;
  updatedAt: string | null;
}) {
  const [state, formAction, pending] = useActionState(saveWalletInfo, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      {walletVerified ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Wallet verified by admin.
        </div>
      ) : null}

      <input type="hidden" name="wallet_network" value="btc" />
      <div>
        <label className="block text-sm font-medium text-slate-700">Wallet network</label>
        <div className="mt-1 inline-flex rounded-full border border-orange-200 bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
          Bitcoin (BTC)
        </div>
      </div>

      <div>
        <label htmlFor="wallet_address" className="block text-sm font-medium text-slate-700">
          Wallet address
        </label>
        <input
          id="wallet_address"
          name="wallet_address"
          type="text"
          required
          defaultValue={defaultAddress}
          placeholder="Paste your wallet address"
          className="mt-1 w-full rounded-full border border-slate-300 px-4 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
        />
      </div>

      {updatedAt ? (
        <p className="text-xs text-slate-500">
          Last updated: {new Date(updatedAt).toLocaleString()}
        </p>
      ) : null}

      {state.error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}
      {state.success ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200/60 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Saving wallet..." : "Save Wallet Info"}
      </button>
    </form>
  );
}
