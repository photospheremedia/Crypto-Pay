"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register GSAP plugins once
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Professional GSAP Provider
 * 
 * Best practices applied:
 * - Use fromTo() for predictable animations
 * - Consistent easing (power2.out for entrances, power1.inOut for subtle)
 * - Subtle, professional movements (no extreme values)
 * - toggleActions for reverse on scroll back
 * - Proper cleanup with context.revert()
 * - Avoid CSS transitions conflict
 */
export function GsapProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Create GSAP context for proper cleanup
    const ctx = gsap.context(() => {
      
      // Set will-change for better performance
      gsap.set(".gsap-fade-up, .gsap-stagger-item, .gsap-scale-up, .gsap-slide-left, .gsap-slide-right, .gsap-bounce-in", {
        willChange: "transform, opacity"
      });
      
      // ===========================================
      // FADE UP - Clean, professional reveal
      // ===========================================
      gsap.utils.toArray<HTMLElement>(".gsap-fade-up").forEach((el) => {
        gsap.fromTo(
          el,
          { 
            y: 40, 
            opacity: 0 
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
            force3D: true, // Force GPU acceleration
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play reset play reset",
            },
            onComplete: () => {
              // Remove will-change after animation
              gsap.set(el, { clearProps: "willChange" });
            }
          }
        );
      });

      // ===========================================
      // STAGGER CONTAINER - Grid items appear sequentially
      // ===========================================
      gsap.utils.toArray<HTMLElement>(".gsap-stagger-container").forEach((container) => {
        const items = container.querySelectorAll(".gsap-stagger-item");
        if (items.length === 0) return;
        
        gsap.fromTo(
          items,
          { 
            y: 30, 
            opacity: 0 
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.08, // Subtle, quick stagger
            ease: "power2.out",
            force3D: true,
            scrollTrigger: {
              trigger: container,
              start: "top 88%",
              toggleActions: "play reset play reset",
            },
          }
        );
      });

      // ===========================================
      // SCALE UP - Subtle scale entrance
      // ===========================================
      gsap.utils.toArray<HTMLElement>(".gsap-scale-up").forEach((el) => {
        gsap.fromTo(
          el,
          { 
            scale: 0.95, 
            opacity: 0 
          },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            force3D: true,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play reset play reset",
            },
          }
        );
      });

      // ===========================================
      // SLIDE LEFT - Content slides in from left
      // ===========================================
      gsap.utils.toArray<HTMLElement>(".gsap-slide-left").forEach((el) => {
        gsap.fromTo(
          el,
          { 
            x: -50, 
            opacity: 0 
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
            force3D: true,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play reset play reset",
            },
          }
        );
      });

      // ===========================================
      // SLIDE RIGHT - Content slides in from right
      // ===========================================
      gsap.utils.toArray<HTMLElement>(".gsap-slide-right").forEach((el) => {
        gsap.fromTo(
          el,
          { 
            x: 50, 
            opacity: 0 
          },
          {
            x: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
            force3D: true,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play reset play reset",
            },
          }
        );
      });

      // ===========================================
      // PARALLAX - Subtle depth effect on scroll
      // ===========================================
      gsap.utils.toArray<HTMLElement>(".gsap-parallax").forEach((el) => {
        const speed = parseFloat(el.dataset.speed || "0.3");
        gsap.to(el, {
          y: () => -60 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5, // Smooth scrub
          },
        });
      });

      // ===========================================
      // ZOOM SCRUB - Image zooms out as you scroll
      // ===========================================
      gsap.utils.toArray<HTMLElement>(".gsap-zoom-scrub").forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 1.1 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top bottom",
              end: "top 30%",
              scrub: 0.5,
            },
          }
        );
      });

      // ===========================================
      // BOUNCE IN - Subtle bounce for badges/notifications
      // ===========================================
      gsap.utils.toArray<HTMLElement>(".gsap-bounce-in").forEach((el) => {
        gsap.fromTo(
          el,
          { 
            y: -20, 
            opacity: 0,
            scale: 0.9
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)", // Professional bounce, not too extreme
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              toggleActions: "play reset play reset",
            },
          }
        );
      });

      // ===========================================
      // TEXT REVEAL - Lines appear sequentially
      // ===========================================
      gsap.utils.toArray<HTMLElement>(".gsap-text-reveal").forEach((el) => {
        const lines = el.querySelectorAll(".gsap-line");
        if (lines.length === 0) return;
        
        gsap.fromTo(
          lines,
          { 
            y: 20, 
            opacity: 0 
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.4,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play reset play reset",
            },
          }
        );
      });

      // ===========================================
      // COUNTER - Animated number counting
      // ===========================================
      gsap.utils.toArray<HTMLElement>(".gsap-counter").forEach((el) => {
        const target = parseInt(el.dataset.target || "0", 10);
        const obj = { value: 0 };
        
        gsap.to(obj, {
          value: target,
          duration: 1.5,
          ease: "power1.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none", // Only play once
          },
          onUpdate: () => {
            el.textContent = Math.round(obj.value).toLocaleString();
          },
        });
      });

    });

    // Refresh ScrollTrigger after a short delay to account for images/layout shifts
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100);

    // Cleanup on unmount
    return () => {
      clearTimeout(refreshTimer);
      ctx.revert();
    };
  }, []);

  return <>{children}</>;
}
