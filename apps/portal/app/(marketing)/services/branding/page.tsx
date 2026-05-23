import Link from "next/link";
import {
  Palette,
  ArrowRight,
  Check,
  Utensils,
  Camera,
  PenTool,
  Monitor,
  FileImage,
  Sparkles,
  Eye,
  Heart,
  TrendingUp,
} from "lucide-react";

export const metadata = {
  title: "Menu & Branding | Crypto Pay",
  description: "Transform your business's visual identity with professional menu design, brand refresh, and marketing materials.",
};

const services = [
  {
    icon: Utensils,
    title: "Menu Design",
    description: "Strategically designed menus that guide customer decisions and increase average ticket size.",
    features: ["Menu engineering", "Layout optimization", "Pricing psychology", "Seasonal updates"],
  },
  {
    icon: Camera,
    title: "Food Photography",
    description: "Professional food photography that makes your dishes irresistible on every platform.",
    features: ["Studio shoots", "On-location photos", "Styled compositions", "Digital editing"],
  },
  {
    icon: PenTool,
    title: "Brand Identity",
    description: "Complete visual identity systems that set your business apart from the competition.",
    features: ["Logo design", "Color palette", "Typography", "Brand guidelines"],
  },
  {
    icon: Monitor,
    title: "Digital Presence",
    description: "Cohesive branding across your website, social media, and delivery platforms.",
    features: ["Website design", "Social templates", "Platform assets", "Email designs"],
  },
];

const portfolio = [
  {
    name: "Urban Harvest Kitchen",
    type: "Farm-to-Table",
    description: "Complete rebrand including menu, signage, and digital presence",
    color: "bg-orange-500",
  },
  {
    name: "Sakura Ramen House",
    type: "Japanese",
    description: "Menu redesign and food photography for delivery platforms",
    color: "bg-pink-600",
  },
  {
    name: "Bella Cucina",
    type: "Italian",
    description: "Brand refresh with new logo and marketing materials",
    color: "bg-amber-600",
  },
  {
    name: "Taco Libre",
    type: "Mexican",
    description: "Vibrant visual identity and social media campaign",
    color: "bg-red-600",
  },
];

const process = [
  {
    step: "Discovery",
    description: "We learn your brand story, target audience, and competitive landscape.",
  },
  {
    step: "Strategy",
    description: "Develop a creative brief and visual direction aligned with your goals.",
  },
  {
    step: "Design",
    description: "Create multiple concepts and refine based on your feedback.",
  },
  {
    step: "Delivery",
    description: "Provide final assets in all formats needed for print and digital use.",
  },
];

const stats = [
  { value: "200+", label: "Businesss Branded" },
  { value: "15%", label: "Avg. Ticket Increase" },
  { value: "3x", label: "Social Engagement" },
  { value: "48hrs", label: "Design Turnaround" },
];

export default function BrandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-6 pt-24 pb-16 lg:pt-28 lg:pb-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-pink-50 px-4 py-2 text-sm font-medium text-pink-700">
                <Palette className="h-4 w-4" />
                Menu & Branding
              </div>
              <h1 className="font-display text-4xl font-bold leading-tight text-slate-900 lg:text-5xl">
                Your brand is your{" "}
                <span className="text-pink-600">first impression</span>
              </h1>
              <p className="mt-6 text-lg text-slate-600">
                From menu design to complete brand identity, we create visual experiences
                that tell your business's story and drive customer loyalty.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-pink-600 px-6 py-3 font-semibold text-white shadow-lg shadow-pink-600/30 transition hover:bg-pink-700"
                >
                  Start Your Rebrand
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/pricing"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:border-pink-300 hover:bg-pink-50"
                >
                  See Packages
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-3xl bg-linear-to-br from-pink-400 to-pink-600 p-6 text-white">
                    <FileImage className="mb-4 h-8 w-8" />
                    <p className="text-2xl font-bold">Menu</p>
                    <p className="text-sm text-pink-100">Engineering</p>
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-white p-6">
                    <Eye className="mb-4 h-8 w-8 text-slate-400" />
                    <p className="text-2xl font-bold text-slate-900">Visual</p>
                    <p className="text-sm text-slate-500">Identity</p>
                  </div>
                </div>
                <div className="mt-8 space-y-4">
                  <div className="rounded-3xl border border-slate-200 bg-white p-6">
                    <Heart className="mb-4 h-8 w-8 text-pink-500" />
                    <p className="text-2xl font-bold text-slate-900">Brand</p>
                    <p className="text-sm text-slate-500">Story</p>
                  </div>
                  <div className="rounded-3xl bg-linear-to-br from-amber-400 to-amber-600 p-6 text-white">
                    <TrendingUp className="mb-4 h-8 w-8" />
                    <p className="text-2xl font-bold">+15%</p>
                    <p className="text-sm text-amber-100">Avg. Sales Lift</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-white/80 bg-white/60 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="font-display text-3xl font-bold text-pink-600">{stat.value}</p>
                <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
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
              Complete branding{" "}
              <span className="text-pink-600">services</span>
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-slate-600">
              Everything you need to create a cohesive, memorable brand experience.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service) => (
              <div
                key={service.title}
                className="group rounded-3xl border border-slate-200 bg-white p-8 transition hover:border-pink-300 hover:shadow-lg"
              >
                <div className="mb-6 inline-flex rounded-2xl bg-pink-100 p-4 text-pink-600 transition group-hover:bg-pink-600 group-hover:text-white">
                  <service.icon className="h-8 w-8" />
                </div>
                <h3 className="mb-3 text-xl font-semibold text-slate-900">{service.title}</h3>
                <p className="mb-6 text-slate-600">{service.description}</p>
                <div className="grid grid-cols-2 gap-2">
                  {service.features.map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-slate-600">
                      <Check className="h-4 w-4 text-pink-500" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Preview */}
      <section className="border-t border-white/80 bg-white/60 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold text-slate-900">
              Recent{" "}
              <span className="text-pink-600">projects</span>
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {portfolio.map((project) => (
              <div
                key={project.name}
                className="group overflow-hidden rounded-3xl border border-slate-200 bg-white transition hover:shadow-lg"
              >
                <div className={`${project.color} p-8`}>
                  <Sparkles className="h-12 w-12 text-white/80" />
                </div>
                <div className="p-6">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                    {project.type}
                  </p>
                  <h3 className="mt-2 font-semibold text-slate-900">{project.name}</h3>
                  <p className="mt-2 text-sm text-slate-600">{project.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-bold text-slate-900">
                Our design{" "}
                <span className="text-pink-600">process</span>
              </h2>
              <p className="mt-4 text-slate-600">
                We follow a proven methodology to deliver brands that resonate with your
                target customers and drive results.
              </p>
            </div>
            <div className="space-y-4">
              {process.map((item, index) => (
                <div
                  key={item.step}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:border-pink-300"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-100 font-bold text-pink-600">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{item.step}</h3>
                    <p className="text-sm text-slate-600">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-3xl bg-linear-to-br from-pink-600 to-pink-700 p-10 text-center text-white shadow-2xl shadow-pink-600/30 lg:p-16">
            <Palette className="mx-auto mb-6 h-12 w-12 text-pink-200" />
            <h2 className="font-display text-3xl font-bold lg:text-4xl">
              Ready to refresh your brand?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-pink-100">
              Let's create a visual identity that captures your business's unique
              personality and attracts your ideal customers.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-pink-700 transition hover:bg-pink-50"
              >
                Get a Quote
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-4 font-semibold text-white transition hover:bg-white/10"
              >
                All Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
