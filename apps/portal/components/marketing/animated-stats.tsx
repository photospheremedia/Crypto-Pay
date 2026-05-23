"use client";

import { useEffect, useState, useRef } from "react";
import { TrendingUp, Users, Package, Clock } from "lucide-react";

const stats = [
  {
    value: "500+",
    label: "Business partners",
    icon: Users,
    image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1470&auto=format&fit=crop",
  },
  {
    value: "2.4M",
    label: "Orders processed monthly",
    icon: TrendingUp,
    image: "https://images.unsplash.com/photo-1551836022-4c4c79ecde51?q=80&w=1470&auto=format&fit=crop",
  },
  {
    value: "50K+",
    label: "Supply items shipped",
    icon: Package,
    image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=1470&auto=format&fit=crop",
  },
  {
    value: "24h",
    label: "Average quote turnaround",
    icon: Clock,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1470&auto=format&fit=crop",
  },
];

function useCountUp(end: number, duration: number = 2000, isVisible: boolean = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isVisible]);

  return count;
}

function StatCard({ stat, index }: { stat: typeof stats[0]; index: number }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  const numericValue = parseInt(stat.value.replace(/[^0-9]/g, ""));
  const count = useCountUp(numericValue, 2000, isVisible);
  const suffix = stat.value.replace(/[0-9]/g, "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const Icon = stat.icon;

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-3xl border border-white/80 bg-white/80 p-8 shadow-lg transition hover:shadow-2xl"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      <div className="absolute right-0 top-0 h-32 w-32 opacity-0 transition-opacity duration-500 group-hover:opacity-30">
        <img
          src={stat.image}
          alt={stat.label}
          className="h-full w-full rounded-bl-[80px] object-cover"
        />
      </div>
      
      <div className="relative">
        <div className="flex items-start justify-between">
          <div className="rounded-2xl bg-orange-100 p-3">
            <Icon className="h-6 w-6 text-orange-600" />
          </div>
        </div>

        <div className="mt-6">
          <div className="font-display text-4xl font-bold text-slate-900 md:text-5xl">
            {isVisible ? count.toLocaleString() : "0"}{suffix}
          </div>
          <p className="mt-2 text-sm font-medium text-slate-600">{stat.label}</p>
        </div>
      </div>
    </div>
  );
}

export function AnimatedStats() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="mb-12 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-600">Trusted by hundreds</p>
        <h2 className="font-display mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
          Powering business operations nationwide
        </h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} stat={stat} index={index} />
        ))}
      </div>
    </section>
  );
}
