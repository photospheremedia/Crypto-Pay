"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, Sparkles, Truck, Tag, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Configure your announcements here - easy to update!
const announcements = [
  {
    id: "free-shipping",
    icon: Truck,
    text: "Free shipping on orders over $500",
    link: "/shop",
    linkText: "Shop now",
    highlight: true,
  },
  {
    id: "new-client",
    icon: Sparkles,
    text: "New clients get 15% off first supply order",
    link: "/signup",
    linkText: "Get started",
    highlight: false,
  },
  {
    id: "quote-sla",
    icon: Calendar,
    text: "Supply quotes delivered in 24 hours guaranteed",
    link: "/contact",
    linkText: "Request quote",
    highlight: false,
  },
  {
    id: "integration",
    icon: Tag,
    text: "Now integrating with Toast POS — seamless order routing",
    link: "/services/pos",
    linkText: "Learn more",
    highlight: true,
  },
];

// Rotation interval in milliseconds
const ROTATION_INTERVAL = 5000;

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Use undefined to indicate "loading" state - prevents hydration flicker
  const [isVisible, setIsVisible] = useState<boolean | undefined>(undefined);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1); // 1 for forward, -1 for backward

  // Check if user has dismissed the bar
  useEffect(() => {
    const dismissed = sessionStorage.getItem("announcement-dismissed");
    setIsVisible(dismissed !== "true");
  }, []);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  }, []);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  }, []);

  // Auto-rotate announcements
  useEffect(() => {
    if (isPaused || announcements.length <= 1) return;

    const interval = setInterval(() => {
      goToNext();
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [isPaused, goToNext]);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("announcement-dismissed", "true");
  };

  if (!isVisible) return null;

  // During hydration (loading state), render empty space to prevent layout shift
  if (isVisible === undefined) {
    return <div className="h-10 w-full bg-slate-900" />;
  }

  const current = announcements[currentIndex];
  const Icon = current.icon;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 20 : -20,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? -20 : 20,
      opacity: 0,
    }),
  };

  return (
    <div
      className={`relative ${
        current.highlight
          ? "bg-orange-500 text-white"
          : "bg-slate-900 text-white"
      }`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="mx-auto flex h-10 w-full max-w-7xl items-center justify-center px-4 sm:px-6">
        {/* Previous Button */}
        {announcements.length > 1 && (
          <button
            onClick={goToPrev}
            className="mr-3 hidden rounded-full p-1 transition-colors hover:bg-white/10 sm:block"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        {/* Announcement Content */}
        <div className="relative flex min-w-0 flex-1 items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="flex items-center gap-2 text-sm"
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" />
              <span className="truncate font-medium">{current.text}</span>
              {current.link && (
                <Link
                  href={current.link}
                  className="ml-1 inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold underline decoration-white/40 underline-offset-2 transition-colors hover:decoration-white"
                >
                  {current.linkText}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Next Button */}
        {announcements.length > 1 && (
          <button
            onClick={goToNext}
            className="ml-3 hidden rounded-full p-1 transition-colors hover:bg-white/10 sm:block"
            aria-label="Next announcement"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}

        {/* Dots Indicator (mobile) */}
        {announcements.length > 1 && (
          <div className="mx-3 flex items-center gap-1 sm:hidden">
            {announcements.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex ? 1 : -1);
                  setCurrentIndex(index);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/40"
                }`}
                aria-label={`Go to announcement ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="ml-2 rounded-full p-1.5 transition-colors hover:bg-white/10"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
