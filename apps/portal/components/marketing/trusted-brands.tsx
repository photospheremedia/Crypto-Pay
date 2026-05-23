"use client";

import { motion } from "framer-motion";

// Using Logo.dev API - the industry standard for company logos
const getLogoUrl = (domain: string) => `https://img.logo.dev/${domain}?token=pk_X-1ZO13GSgeOoUrIuJ6GMQ`;

// Major business brands that trust our platform
const trustedBrands = [
  { name: "Pizza Hut", domain: "pizzahut.com" },
  { name: "KFC", domain: "kfc.com" },
  { name: "Taco Bell", domain: "tacobell.com" },
  { name: "Wendy's", domain: "wendys.com" },
  { name: "Chipotle", domain: "chipotle.com" },
  { name: "Domino's", domain: "dominos.com" },
  { name: "Subway", domain: "subway.com" },
  { name: "Dunkin'", domain: "dunkindonuts.com" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

interface TrustedBrandsProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function TrustedBrands({ 
  title = "Trusted by leading business brands",
  subtitle = "Powered by UrbanPiper Technology",
  className = "" 
}: TrustedBrandsProps) {
  return (
    <section className={`py-16 bg-white border-y border-slate-100 ${className}`}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            {subtitle}
          </p>
          <h3 className="mt-2 text-xl font-semibold text-slate-700">
            {title}
          </h3>
        </div>
        
        {/* Scrolling logo banner */}
        <div className="relative overflow-hidden">
          {/* Gradient masks */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white to-transparent z-10" />
          
          <motion.div
            className="flex items-center gap-16"
            animate={{ x: [0, -960] }}
            transition={{
              x: {
                repeat: Infinity,
                repeatType: "loop",
                duration: 20,
                ease: "linear",
              },
            }}
          >
            {/* Double the logos for seamless loop */}
            {[...trustedBrands, ...trustedBrands].map((brand, index) => (
              <div
                key={`${brand.name}-${index}`}
                className="flex-shrink-0 h-10 md:h-12 grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300"
              >
                <img 
                  src={getLogoUrl(brand.domain)} 
                  alt={brand.name}
                  className="h-full w-auto object-contain max-w-[100px] md:max-w-[120px]"
                  loading="lazy"
                />
              </div>
            ))}
          </motion.div>
        </div>
        
        {/* Stats below logos */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "45,000+", label: "Businesss Worldwide" },
            { value: "250M+", label: "Orders Processed Annually" },
            { value: "99.99%", label: "Platform Uptime" },
            { value: "150+", label: "Integrations" },
          ].map((stat) => (
            <div key={stat.label} className="p-4">
              <p className="text-2xl md:text-3xl font-bold text-orange-600">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
