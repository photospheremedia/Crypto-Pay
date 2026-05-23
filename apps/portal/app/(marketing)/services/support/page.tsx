import Link from "next/link";
import {
  Headphones,
  ArrowRight,
  Check,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  Shield,
  Users,
  BookOpen,
  Zap,
  Globe,
  HelpCircle,
  FileText,
} from "lucide-react";

export const metadata = {
  title: "24/7 Support | Crypto Pay",
  description: "Expert support available around the clock. Get help with integrations, technical issues, and optimizing your restaurant operations.",
};

const supportChannels = [
  {
    icon: Phone,
    title: "Phone Support",
    description: "Speak directly with our expert support team",
    availability: "24/7 for Premium plans",
    action: "Call Now",
    href: "tel:+1-800-555-0123",
  },
  {
    icon: MessageCircle,
    title: "Live Chat",
    description: "Instant answers from our support agents",
    availability: "24/7 availability",
    action: "Start Chat",
    href: "#chat",
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "Detailed assistance for complex issues",
    availability: "Response within 4 hours",
    action: "Send Email",
    href: "mailto:support@cryptopay.sale",
  },
  {
    icon: BookOpen,
    title: "Knowledge Base",
    description: "Self-service guides and tutorials",
    availability: "Always available",
    action: "Browse Articles",
    href: "/docs",
  },
];

const features = [
  {
    icon: Clock,
    title: "24/7 Availability",
    description: "Our support team is available around the clock, including weekends and holidays. Never wait for help when you need it most.",
  },
  {
    icon: Users,
    title: "Dedicated Account Manager",
    description: "Premium accounts get a dedicated account manager who knows your business and can provide personalized assistance.",
  },
  {
    icon: Zap,
    title: "Fast Response Times",
    description: "Average response time under 5 minutes for live chat and under 30 minutes for phone support during peak hours.",
  },
  {
    icon: Shield,
    title: "Expert Technical Support",
    description: "Our team includes POS specialists, integration experts, and restaurant industry veterans who understand your challenges.",
  },
  {
    icon: Globe,
    title: "Multilingual Support",
    description: "Support available in English, Spanish, Mandarin, and 10+ other languages to serve restaurants nationwide.",
  },
  {
    icon: FileText,
    title: "Detailed Documentation",
    description: "Comprehensive guides, video tutorials, and API documentation to help you get the most out of our platform.",
  },
];

const faqs = [
  {
    question: "How do I integrate my POS system?",
    answer: "Our team will guide you through the entire process. Most integrations can be completed in under 24 hours.",
  },
  {
    question: "What if a delivery platform has an outage?",
    answer: "We monitor all platforms 24/7 and will proactively notify you of any issues. Our system automatically queues orders during outages.",
  },
  {
    question: "Can I get training for my staff?",
    answer: "Yes! We offer free onboarding training and can schedule additional sessions as needed for new team members.",
  },
  {
    question: "Do you offer on-site support?",
    answer: "For Enterprise plans, we provide on-site installation and training. Contact sales for details.",
  },
];

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-orange-500 via-orange-500 to-teal-500 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Headphones className="h-5 w-5 text-white" />
              <span className="text-white font-medium">Expert Support Team</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Help When You Need It,
              <br />
              <span className="text-orange-100">24 Hours a Day</span>
            </h1>
            <p className="text-xl text-orange-50 max-w-2xl mx-auto mb-8">
              Our dedicated support team is available around the clock to help you 
              succeed. From technical issues to optimization tips, we&apos;ve got you covered.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="#chat"
                className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-colors"
              >
                <MessageCircle className="h-5 w-5" />
                Start Live Chat
              </Link>
              <Link
                href="tel:+1-800-555-0123"
                className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-800 transition-colors"
              >
                <Phone className="h-5 w-5" />
                Call Support
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="py-16 -mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportChannels.map((channel) => {
              const Icon = channel.icon;
              return (
                <Link
                  key={channel.title}
                  href={channel.href}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                    <Icon className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{channel.title}</h3>
                  <p className="text-slate-600 text-sm mb-3">{channel.description}</p>
                  <div className="flex items-center gap-2 text-xs text-orange-500 font-medium">
                    <Clock className="h-3.5 w-3.5" />
                    {channel.availability}
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-orange-500 font-semibold group-hover:gap-2 transition-all">
                    {channel.action}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Why Our Support Stands Out
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              We&apos;re not just a help desk—we&apos;re your partner in success. Our team understands 
              the restaurant industry inside and out.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-orange-500 mb-2">&lt;5 min</div>
              <div className="text-slate-600">Avg. Chat Response</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-500 mb-2">98%</div>
              <div className="text-slate-600">Satisfaction Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-500 mb-2">24/7</div>
              <div className="text-slate-600">Availability</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-500 mb-2">150+</div>
              <div className="text-slate-600">Support Experts</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600">
              Quick answers to common questions
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <HelpCircle className="h-5 w-5 text-orange-500 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">{faq.question}</h3>
                    <p className="text-slate-600">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-orange-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            Join thousands of restaurants who trust us with their operations.
            Our team is ready to help you succeed.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 bg-white text-orange-600 px-6 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-colors"
            >
              View Pricing
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-800 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
