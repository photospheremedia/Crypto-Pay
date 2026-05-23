"use client";

import { Zap, Link2, GitBranch, Shield } from "lucide-react";

const integrations = [
  {
    name: "POS Systems",
    description: "Connect with Square, Toast, Clover, and more",
    logo: "https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?q=80&w=1470&auto=format&fit=crop",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "Delivery Networks",
    description: "Uber Eats, DoorDash, Grubhub unified",
    logo: "https://images.unsplash.com/photo-1526367790999-0150786686a2?q=80&w=1471&auto=format&fit=crop",
    color: "from-orange-500 to-teal-500",
  },
  {
    name: "Kitchen Display",
    description: "Real-time order routing and tracking",
    logo: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1415&auto=format&fit=crop",
    color: "from-amber-500 to-orange-500",
  },
  {
    name: "Analytics & Reports",
    description: "Track performance across all channels",
    logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1470&auto=format&fit=crop",
    color: "from-purple-500 to-pink-500",
  },
];

const features = [
  {
    icon: Zap,
    title: "Lightning-fast sync",
    description: "Real-time order routing under 2 seconds",
  },
  {
    icon: Link2,
    title: "Unified platform",
    description: "One dashboard for all your channels",
  },
  {
    icon: GitBranch,
    title: "Smart routing",
    description: "Automatic order distribution to kitchen",
  },
  {
    icon: Shield,
    title: "Enterprise security",
    description: "Bank-level encryption and compliance",
  },
];

export function ConnectivityShowcase() {
  return (
    <section className="relative overflow-hidden py-20">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-orange-600">
            Seamless connectivity
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
            One platform, infinite possibilities
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Connect your entire business tech stack in minutes, not weeks
          </p>
        </div>

        {/* Integration Cards Grid */}
        <div className="mb-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {integrations.map((integration, index) => (
            <div
              key={integration.name}
              className="group relative overflow-hidden rounded-3xl border border-white/80 bg-white p-6 shadow-lg transition hover:shadow-2xl"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              {/* Gradient Overlay on Hover */}
              <div
                className={`absolute inset-0 bg-linear-to-br ${integration.color} opacity-0 transition-opacity duration-500 group-hover:opacity-10`}
              />

              {/* Image */}
              <div className="relative mb-6 h-32 overflow-hidden rounded-2xl">
                <img
                  src={integration.logo}
                  alt={integration.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                
                {/* Connected Badge */}
                <div className="absolute bottom-2 left-2 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                  Connected
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-900">{integration.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{integration.description}</p>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-200 bg-white/80 p-6 backdrop-blur transition hover:border-orange-300 hover:shadow-lg"
                style={{
                  animationDelay: `${(index + 4) * 100}ms`,
                }}
              >
                <div className="mb-4 inline-flex rounded-xl bg-orange-100 p-3">
                  <Icon className="h-5 w-5 text-orange-600" />
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </div>

        {/* Team Collaboration Section */}
        <div className="mt-16 overflow-hidden rounded-3xl border border-white/80 bg-linear-to-br from-white to-orange-50/30 p-12">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-orange-600">
                Built for teams
              </p>
              <h3 className="font-display mt-3 text-3xl font-bold text-slate-900">
                Empower your entire team
              </h3>
              <p className="mt-4 text-lg text-slate-600">
                From kitchen staff to managers, everyone gets the tools they need to succeed. Real-time collaboration across locations.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  "Multi-location management dashboard",
                  "Role-based access controls",
                  "Real-time notifications and alerts",
                  "Collaborative order management",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <svg
                      className="mt-0.5 h-5 w-5 shrink-0 text-orange-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1470&auto=format&fit=crop"
                alt="Team collaboration"
                className="rounded-2xl shadow-2xl"
              />
              {/* Floating badges */}
              <div className="absolute -bottom-4 -left-4 rounded-2xl border border-white bg-white p-4 shadow-xl">
                <div className="text-2xl font-bold text-orange-500">15+</div>
                <div className="text-xs text-slate-600">Integrations</div>
              </div>
              <div className="absolute -right-4 -top-4 rounded-2xl border border-white bg-white p-4 shadow-xl">
                <div className="text-2xl font-bold text-orange-500">24/7</div>
                <div className="text-xs text-slate-600">Support</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
