import Link from "next/link";

export const metadata = {
  title: "Checkout",
  description: "Complete your order with Restaurant Hub Solution.",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-4 text-4xl font-bold">Checkout</h1>
      <p className="mb-6 text-neutral-600 dark:text-neutral-300">
        Checkout is handled through our supplier partners or your Restaurant Hub Solution
        subscription plan. We will connect you with the right checkout flow for
        your order.
      </p>
      <div className="flex flex-wrap gap-4">
        <Link
          className="rounded-full bg-black px-5 py-2 text-sm text-white dark:bg-white dark:text-black"
          href="/support"
        >
          Contact support
        </Link>
        <Link
          className="rounded-full border border-neutral-300 px-5 py-2 text-sm text-neutral-700 dark:border-neutral-700 dark:text-neutral-200"
          href="/subscriptions"
        >
          View subscriptions
        </Link>
      </div>
    </div>
  );
}
