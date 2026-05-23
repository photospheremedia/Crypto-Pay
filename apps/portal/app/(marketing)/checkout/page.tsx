"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  CreditCard,
  Building2,
  Truck,
  Shield,
  Lock,
  Check,
  ArrowLeft,
  Package,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/components/store/cart-context";

type CheckoutStep = "shipping" | "payment" | "review";

const shippingMethods = [
  {
    id: "standard",
    name: "Standard Shipping",
    description: "5-7 business days",
    price: 0,
    icon: Truck,
  },
  {
    id: "express",
    name: "Express Shipping",
    description: "2-3 business days",
    price: 1499,
    icon: Package,
  },
  {
    id: "overnight",
    name: "Overnight",
    description: "Next business day",
    price: 2999,
    icon: Clock,
  },
];

function formatMoney(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalCents, clear } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("shipping");
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Form states
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    country: "US",
  });

  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [billingDifferent, setBillingDifferent] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "invoice">("card");

  const [cardInfo, setCardInfo] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: "",
  });

  // Calculate totals
  const shippingCost = shippingMethods.find((m) => m.id === selectedShipping)?.price || 0;
  const taxRate = 0.0875; // Example tax rate
  const taxAmount = Math.round(subtotalCents * taxRate);
  const totalCents = subtotalCents + shippingCost + taxAmount;

  // Redirect if cart is empty
  if (items.length === 0 && !orderComplete) {
    return (
      <section className="mx-auto w-full max-w-4xl px-6 pt-24 pb-16 lg:pt-28">
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <Package className="mx-auto h-16 w-16 text-slate-300" />
          <h2 className="mt-4 text-xl font-semibold text-slate-900">Your cart is empty</h2>
          <p className="mt-2 text-slate-600">Add some products before checking out.</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
          >
            Browse Products
          </Link>
        </div>
      </section>
    );
  }

  // Order complete state
  if (orderComplete) {
    return (
      <section className="mx-auto w-full max-w-2xl px-6 pt-24 pb-16 lg:pt-28">
        <div className="rounded-3xl border border-orange-200 bg-orange-50 p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-orange-500 flex items-center justify-center">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">Order Confirmed!</h1>
          <p className="mt-2 text-slate-600">
            Thank you for your order. We've sent a confirmation to {shippingInfo.email}
          </p>
          <div className="mt-6 p-4 rounded-xl bg-white border border-orange-200">
            <p className="text-sm text-slate-500">Order Number</p>
            <p className="text-xl font-mono font-bold text-slate-900">RHS-{Date.now().toString(36).toUpperCase()}</p>
          </div>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Continue Shopping
            </Link>
            <Link
              href="/app"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View Orders
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    clear();
    setOrderComplete(true);
    setIsProcessing(false);
  };

  const steps = [
    { id: "shipping", label: "Shipping" },
    { id: "payment", label: "Payment" },
    { id: "review", label: "Review" },
  ];

  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-24 pb-16 lg:pt-28">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-orange-500 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
      </div>

      {/* Progress Steps */}
      <div className="mb-8 flex items-center justify-center gap-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => {
                if (steps.findIndex((s) => s.id === currentStep) >= index) {
                  setCurrentStep(step.id as CheckoutStep);
                }
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                currentStep === step.id
                  ? "bg-orange-500 text-white"
                  : steps.findIndex((s) => s.id === currentStep) > index
                  ? "bg-orange-100 text-orange-600"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                {steps.findIndex((s) => s.id === currentStep) > index ? (
                  <Check className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </span>
              <span className="hidden sm:inline">{step.label}</span>
            </button>
            {index < steps.length - 1 && (
              <ChevronRight className="h-5 w-5 text-slate-300 mx-2" />
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* Main Content */}
        <div className="space-y-6">
          {/* Shipping Step */}
          {currentStep === "shipping" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Shipping Information</h2>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={shippingInfo.firstName}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, firstName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    value={shippingInfo.lastName}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, lastName: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company (Optional)</label>
                  <input
                    type="text"
                    value={shippingInfo.company}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, company: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={shippingInfo.email}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone *</label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address *</label>
                  <input
                    type="text"
                    value={shippingInfo.address1}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address1: e.target.value })}
                    placeholder="Street address"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition mb-2"
                    required
                  />
                  <input
                    type="text"
                    value={shippingInfo.address2}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address2: e.target.value })}
                    placeholder="Apt, suite, etc. (optional)"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City *</label>
                  <input
                    type="text"
                    value={shippingInfo.city}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">State *</label>
                    <input
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">ZIP *</label>
                    <input
                      type="text"
                      value={shippingInfo.zip}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, zip: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="mt-8">
                <h3 className="text-md font-semibold text-slate-900 mb-4">Shipping Method</h3>
                <div className="space-y-3">
                  {shippingMethods.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition ${
                        selectedShipping === method.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={method.id}
                        checked={selectedShipping === method.id}
                        onChange={(e) => setSelectedShipping(e.target.value)}
                        className="sr-only"
                      />
                      <div className={`p-2 rounded-lg ${
                        selectedShipping === method.id ? "bg-orange-100" : "bg-slate-100"
                      }`}>
                        <method.icon className={`h-5 w-5 ${
                          selectedShipping === method.id ? "text-orange-500" : "text-slate-500"
                        }`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{method.name}</p>
                        <p className="text-sm text-slate-500">{method.description}</p>
                      </div>
                      <p className="font-semibold text-slate-900">
                        {method.price === 0 ? "Free" : formatMoney(method.price)}
                      </p>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setCurrentStep("payment")}
                className="mt-6 w-full py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* Payment Step */}
          {currentStep === "payment" && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-6">Payment Method</h2>

              {/* Payment Method Selection */}
              <div className="flex gap-4 mb-6">
                <button
                  onClick={() => setPaymentMethod("card")}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-xl border transition ${
                    paymentMethod === "card"
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <CreditCard className={`h-5 w-5 ${paymentMethod === "card" ? "text-orange-500" : "text-slate-500"}`} />
                  <span className="font-medium">Credit Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod("invoice")}
                  className={`flex-1 flex items-center gap-3 p-4 rounded-xl border transition ${
                    paymentMethod === "invoice"
                      ? "border-orange-500 bg-orange-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <Building2 className={`h-5 w-5 ${paymentMethod === "invoice" ? "text-orange-500" : "text-slate-500"}`} />
                  <span className="font-medium">Invoice (Net 30)</span>
                </button>
              </div>

              {paymentMethod === "card" && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Card Number</label>
                    <input
                      type="text"
                      value={cardInfo.number}
                      onChange={(e) => setCardInfo({ ...cardInfo, number: e.target.value })}
                      placeholder="4242 4242 4242 4242"
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Expiry</label>
                      <input
                        type="text"
                        value={cardInfo.expiry}
                        onChange={(e) => setCardInfo({ ...cardInfo, expiry: e.target.value })}
                        placeholder="MM/YY"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">CVC</label>
                      <input
                        type="text"
                        value={cardInfo.cvc}
                        onChange={(e) => setCardInfo({ ...cardInfo, cvc: e.target.value })}
                        placeholder="123"
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Name on Card</label>
                    <input
                      type="text"
                      value={cardInfo.name}
                      onChange={(e) => setCardInfo({ ...cardInfo, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-orange-300 focus:ring-2 focus:ring-orange-100 outline-none transition"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "invoice" && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Invoice Payment Terms</p>
                      <p className="mt-1 text-sm text-blue-700">
                        Payment is due within 30 days of invoice date. A credit check may be required for first-time orders.
                        Business customers only.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Billing Address */}
              <div className="mt-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={billingDifferent}
                    onChange={(e) => setBillingDifferent(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-sm text-slate-700">Billing address is different from shipping</span>
                </label>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setCurrentStep("shipping")}
                  className="px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep("review")}
                  className="flex-1 py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Review Step */}
          {currentStep === "review" && (
            <div className="space-y-6">
              {/* Shipping Summary */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Shipping Address</h3>
                  <button
                    onClick={() => setCurrentStep("shipping")}
                    className="text-sm text-orange-500 hover:text-orange-600"
                  >
                    Edit
                  </button>
                </div>
                <p className="text-slate-700">
                  {shippingInfo.firstName} {shippingInfo.lastName}<br />
                  {shippingInfo.company && <>{shippingInfo.company}<br /></>}
                  {shippingInfo.address1}<br />
                  {shippingInfo.address2 && <>{shippingInfo.address2}<br /></>}
                  {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}
                </p>
              </div>

              {/* Payment Summary */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Payment Method</h3>
                  <button
                    onClick={() => setCurrentStep("payment")}
                    className="text-sm text-orange-500 hover:text-orange-600"
                  >
                    Edit
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  {paymentMethod === "card" ? (
                    <>
                      <CreditCard className="h-5 w-5 text-slate-500" />
                      <span className="text-slate-700">
                        Card ending in {cardInfo.number.slice(-4) || "****"}
                      </span>
                    </>
                  ) : (
                    <>
                      <Building2 className="h-5 w-5 text-slate-500" />
                      <span className="text-slate-700">Invoice (Net 30)</span>
                    </>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden">
                        {item.image && (
                          <Image
                            src={item.image}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{item.name}</p>
                        <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold text-slate-900">
                        {formatMoney(item.priceCents * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep("payment")}
                  className="px-6 py-3 rounded-full border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full bg-orange-500 text-white font-semibold hover:bg-orange-600 transition disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Place Order - {formatMoney(totalCents)}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:sticky lg:top-28 space-y-6 h-fit">
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="font-semibold text-slate-900 mb-4">Order Summary</h3>
            
            {/* Items */}
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg bg-slate-100 overflow-hidden shrink-0">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    )}
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-600 text-white text-xs flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">
                    {formatMoney(item.priceCents * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 mt-4 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Subtotal</span>
                <span className="text-slate-900">{formatMoney(subtotalCents)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Shipping</span>
                <span className="text-slate-900">
                  {shippingCost === 0 ? "Free" : formatMoney(shippingCost)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Tax (estimated)</span>
                <span className="text-slate-900">{formatMoney(taxAmount)}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between">
                <span className="font-semibold text-slate-900">Total</span>
                <span className="font-bold text-lg text-slate-900">{formatMoney(totalCents)}</span>
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Shield className="h-5 w-5 text-orange-500" />
              <span>Secure checkout with SSL encryption</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600 mt-3">
              <Truck className="h-5 w-5 text-orange-500" />
              <span>Free shipping on orders over $50</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
