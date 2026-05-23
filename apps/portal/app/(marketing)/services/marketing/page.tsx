import Link from "next/link";
import {
  Megaphone,
  ArrowRight,
  Check,
  Mail,
  MessageSquare,
  TrendingUp,
  Users,
  Target,
  BarChart3,
  Sparkles,
  Calendar,
  Star,
  Gift,
} from "lucide-react";

export const metadata = {
  title: "Marketing Support | Crypto Pay",
  description: "Drive more orders with strategic marketing campaigns, email automation, and data-driven promotion planning.",
};

const services = [
  {
    icon: Mail,
    title: "Email Marketing",
    description: "Automated campaigns that bring customers back with personalized offers and updates.",
    features: ["Welcome sequences", "Loyalty rewards", "Re-engagement", "Seasonal promos"],
  },
  {
    icon: MessageSquare,
    title: "SMS Campaigns",
    description: "Time-sensitive promotions delivered directly to customers' phones for immediate action.",
    features: ["Flash deals", "Order updates", "Birthday rewards", "VIP alerts"],
  },
  {
    icon: Target,
    title: "Paid Advertising",
    description: "Strategic ad campaigns on social media and search to acquire new customers profitably.",
    features: ["Meta ads", "Google ads", "Retargeting", "Lookalike audiences"],
  },
  {
    icon: BarChart3,
    title: "Analytics & Optimization",
    description: "Data-driven insights to understand what's working and continuously improve performance.",
    features: ["Campaign tracking", "ROI reporting", "A/B testing", "Customer insights"],
  },
];

const campaignTypes = [
  {
    name: "New Customer Acquisition",
    icon: Users,
    description: "Reach new diners in your area with targeted ads",
    color: "bg-orange-500",
  },
  {
    name: "Loyalty & Retention",
    icon: Star,
    description: "Keep regulars coming back with rewards",
    color: "bg-pink-500",
  },
  {
    name: "Seasonal Promotions",
    icon: Calendar,
    description: "Capitalize on holidays and events",
    color: "bg-amber-500",
  },
  {
    name: "Win-Back Campaigns",
    icon: Gift,
    description: "Re-engage customers who haven't ordered recently",
    color: "bg-purple-500",
  },
];

const results = [
  { metric: "35%", label: "Increase in Repeat Orders", description: "Average across all clients" },
  { metric: "4.2x", label: "Return on Ad Spend", description: "Meta & Google campaigns" },
  { metric: "28%", label: "Email Open Rate", description: "Industry avg is 18%" },
  { metric: "12%", label: "SMS Conversion Rate", description: "Flash deal campaigns" },
];

const process = [
  {
    step: "Audit",
    title: "Marketing Audit",
    description: "We analyze your current marketing efforts, customer data, and competitive landscape.",
  },
  {
    step: "Strategy",
    title: "Custom Strategy",
    description: "Develop a marketing plan tailored to your business's goals and budget.",
  },
  {
    step: "Execute",
    title: "Campaign Execution",
    description: "Launch and manage campaigns across email, SMS, and paid channels.",
  },
  {
    step: "Optimize",
    title: "Continuous Optimization",
    description: "Monitor performance and adjust tactics to maximize your return on investment.",
  },
];

export default function MarketingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-24 pb-16 lg:pt-28 lg:pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                <Megaphone className="h-4 w-4" />
                Marketing Support
              </div>
              <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">
                Turn customers into{" "}
                <span className="text-amber-600">regulars</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600">
                Data-driven marketing that fills seats and drives delivery orders. From
                email campaigns to paid ads, we handle the strategy and execution.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-amber-600 px-6 py-3 font-semibold text-white shadow-lg shadow-amber-600/30 transition hover:bg-amber-700"
                >
                  Get Marketing Help
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-amber-300 hover:bg-amber-50"
                >
                  See Packages
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {campaignTypes.map((campaign) => (
                  <div
                    key={campaign.name}
                    className="rounded-3xl border border-slate-200 bg-white p-5 transition hover:shadow-lg"
                  >
                    <div className={`mb-4 inline-flex rounded-2xl ${campaign.color} p-3 text-white`}>
                      <campaign.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-slate-900">{campaign.name}</h3>
                    <p className="mt-1 text-sm text-slate-600">{campaign.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Stats */}
      <section className="border-y border-white/80 bg-white/60 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {results.map((result) => (
              <div key={result.label} className="text-center">
                <p className="font-display text-3xl font-bold text-amber-600">{result.metric}</p>
                <p className="font-semibold text-slate-900">{result.label}</p>
                <p className="mt-1 text-sm text-slate-600">{result.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900">
              Full-service{" "}
              <span className="text-amber-600">marketing</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Everything you need to attract new customers and keep them coming back.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service) => (
              <div
                key={service.title}
                className="group rounded-3xl border border-slate-200 bg-white p-8 transition hover:border-amber-300 hover:shadow-lg"
              >
                <div className="mb-6 inline-flex rounded-2xl bg-amber-100 p-4 text-amber-600 transition group-hover:bg-amber-600 group-hover:text-white">
                  <service.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-slate-900">{service.title}</h3>
                <p className="mb-6 text-slate-600">{service.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {service.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="h-4 w-4 text-amber-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="border-t border-white/80 bg-white/60 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900">
              How we{" "}
              <span className="text-amber-600">drive results</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {process.map((item, index) => (
              <div key={item.step} className="relative">
                {index < process.length - 1 && (
                  <div className="absolute right-0 top-12 hidden h-0.5 w-full bg-amber-200 lg:block" style={{ left: '50%' }} />
                )}
                <div className="relative rounded-3xl border border-slate-200 bg-white p-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-600 text-lg font-bold text-white">
                    {index + 1}
                  </div>
                  <h3 className="mb-2 font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sample Campaign */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg">
            <div className="bg-linear-to-r from-amber-500 to-amber-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6" />
                <span className="font-semibold">Sample Campaign Results</span>
              </div>
            </div>
            <div className="p-8">
              <h3 className="mb-6 text-xl font-bold text-slate-900">
                "Win-Back Wednesday" Email Campaign
              </h3>
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-2xl font-bold text-amber-600">2,847</p>
                  <p className="text-sm text-slate-600">Emails Sent</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-2xl font-bold text-amber-600">32%</p>
                  <p className="text-sm text-slate-600">Open Rate</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-2xl font-bold text-amber-600">$4,280</p>
                  <p className="text-sm text-slate-600">Revenue Generated</p>
                </div>
              </div>
              <div className="mt-6 rounded-2xl bg-amber-50 p-4">
                <p className="text-sm text-amber-800">
                  <strong>Strategy:</strong> Targeted customers who hadn't ordered in 30+ days with
                  a personalized "We miss you" email featuring a 15% discount code. Sent on
                  Wednesday at 4pm to catch the dinner planning window.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-linear-to-br from-amber-600 to-amber-700 p-10 text-center text-white shadow-2xl shadow-amber-600/30 lg:p-16">
            <TrendingUp className="mx-auto mb-6 h-12 w-12 text-amber-200" />
            <h2 className="font-display text-3xl font-bold lg:text-4xl">
              Ready to grow your business?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-amber-100">
              Let's build a marketing strategy that drives measurable results for your
              business.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-amber-700 transition hover:bg-amber-50"
              >
                Get Free Audit
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                View Packages
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
