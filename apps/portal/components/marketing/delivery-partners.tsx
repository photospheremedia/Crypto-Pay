"use client";

import { motion, type Variants } from "framer-motion";
import Image from "next/image";

// Using Logo.dev API - the industry standard for company logos
// Format: https://img.logo.dev/{domain}
const getLogoUrl = (domain: string) => `https://img.logo.dev/${domain}?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ`;

// UrbanPiper-supported delivery platforms
const deliveryPartners = [
  { name: "Uber Eats", domain: "ubereats.com", borderColor: "border-[#05C167]" },
  { name: "DoorDash", domain: "doordash.com", borderColor: "border-[#FF3008]" },
  { name: "Grubhub", domain: "grubhub.com", borderColor: "border-[#F63440]" },
  { name: "Deliveroo", domain: "deliveroo.com", borderColor: "border-[#00CCBC]" },
  { name: "Just Eat", domain: "just-eat.com", borderColor: "border-[#F96A00]" },
  { name: "Talabat", domain: "talabat.com", borderColor: "border-[#FF5A00]" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 12,
    },
  },
};

interface DeliveryPartnersProps {
  variant?: "default" | "compact" | "hero";
  showLabel?: boolean;
  className?: string;
}

export function DeliveryPartners({
  variant = "default",
  showLabel = true,
  className = "",
}: DeliveryPartnersProps) {
  if (variant === "hero") {
    return (
      <div className={`${className} mt-4`}>
        {showLabel && (
          <p className="mb-4 text-center text-xs font-medium uppercase tracking-widest text-slate-400">
            Integrated with leading platforms
          </p>
        )}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          {deliveryPartners.map((partner) => (
            <motion.div
              key={partner.name}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -2 }}
              className="group relative"
            >
              <div className={`flex items-center gap-2.5 rounded-full border-2 ${partner.borderColor} bg-white px-4 py-2.5 shadow-sm transition-all duration-300 hover:shadow-md`}>
                <img
                  src={getLogoUrl(partner.domain)}
                  alt={`${partner.name} logo`}
                  className="h-6 w-6 object-contain"
                />
                <span className="text-sm font-semibold text-slate-700">
                  {partner.name}
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`${className}`}>
        {showLabel && (
          <p className="mb-3 text-xs font-medium text-slate-500">
            Integrated platforms:
          </p>
        )}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-2 gap-3 md:grid-cols-3"
        >
          {deliveryPartners.map((partner) => (
            <motion.div
              key={partner.name}
              variants={itemVariants}
              whileHover={{ scale: 1.03, y: -2 }}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 ${partner.borderColor} bg-white p-4 transition hover:shadow-md`}
            >
              <img
                src={getLogoUrl(partner.domain)}
                alt={`${partner.name} logo`}
                className="h-8 w-8 object-contain"
              />
              <span className="text-xs font-semibold text-slate-700">
                {partner.name}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  // Default variant - full showcase
  return (
    <section className={`py-12 ${className}`}>
      <div className="mx-auto max-w-6xl px-6">
        {showLabel && (
          <div className="mb-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">
              Integrations
            </p>
            <h3 className="mt-2 text-2xl font-bold text-slate-900">
              All your delivery platforms in one place
            </h3>
            <p className="mt-2 text-slate-600">
              Connect every major delivery service and manage orders from a single dashboard
            </p>
          </div>
        )}
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6"
        >
          {deliveryPartners.map((partner) => (
            <motion.div
              key={partner.name}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -4 }}
              className="group cursor-pointer"
            >
              <div className={`relative flex flex-col items-center rounded-2xl border-2 ${partner.borderColor} bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg`}>
                {/* Logo */}
                <div className="mb-4 transition-transform duration-300 group-hover:scale-110">
                  <img
                    src={getLogoUrl(partner.domain)}
                    alt={`${partner.name} logo`}
                    className="h-12 w-12 object-contain"
                  />
                </div>
                
                {/* Partner Name */}
                <span className="text-sm font-semibold text-slate-700">
                  {partner.name}
                </span>
                
                {/* Connected Badge */}
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  <span className="text-[10px] font-medium text-orange-500">
                    Connected
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            Don't see your platform?{" "}
            <a
              href="/contact"
              className="font-medium text-orange-500 underline decoration-orange-200 underline-offset-2 transition-colors hover:text-orange-600 hover:decoration-orange-400"
            >
              Let us know
            </a>
            {" "}— we're always adding new integrations.
          </p>
        </div>
      </div>
    </section>
  );
}
