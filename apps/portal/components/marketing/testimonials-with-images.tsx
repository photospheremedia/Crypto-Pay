"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    quote: "Crypto Pay cut our delivery tablet chaos from 5 devices to 1. Our kitchen runs smoother and we save 3 hours a day on order management.",
    author: "Maria Chen",
    role: "Operations Director",
    company: "Golden Dragon Group (8 locations)",
    rating: 5,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1461&auto=format&fit=crop",
  },
  {
    quote: "The supply ordering is a game-changer. We get better pricing than our old distributors and everything ships directly. No more running to the store for thermal bags.",
    author: "James Rodriguez",
    role: "Owner",
    company: "Taqueria Los Primos (3 locations)",
    rating: 5,
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1470&auto=format&fit=crop",
  },
  {
    quote: "Their team handled our entire menu refresh and delivery integration in under 2 weeks. Professional, responsive, and the results speak for themselves — 22% more delivery orders.",
    author: "Sarah Kim",
    role: "GM",
    company: "Seoul Kitchen",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=1470&auto=format&fit=crop",
  },
];

export function TestimonialsWithImages() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-20">
      <div className="mb-16 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-600">Client stories</p>
        <h2 className="font-display mt-3 text-3xl font-bold text-slate-900 md:text-4xl">
          Loved by business operators
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          See how we've helped businesses streamline operations and grow their business
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.author}
            className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:shadow-xl"
            style={{
              animationDelay: `${index * 150}ms`,
            }}
          >
            {/* Decorative Quote Icon */}
            <div className="absolute -right-4 -top-4 opacity-5">
              <Quote className="h-32 w-32 text-orange-500" />
            </div>

            {/* Rating Stars */}
            <div className="relative mb-6 flex gap-1">
              {Array.from({ length: testimonial.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-amber-400 text-amber-400"
                />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="relative mb-8 text-base leading-relaxed text-slate-700">
              "{testimonial.quote}"
            </blockquote>

            {/* Author Info */}
            <div className="relative flex items-center gap-4">
              <div className="h-14 w-14 overflow-hidden rounded-full border-2 border-orange-100">
                <img
                  src={testimonial.image}
                  alt={testimonial.author}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div>
                <div className="font-semibold text-slate-900">{testimonial.author}</div>
                <div className="text-sm text-slate-600">{testimonial.role}</div>
                <div className="text-xs text-slate-500">{testimonial.company}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Trust Badge */}
      <div className="mt-16 rounded-3xl border border-orange-100 bg-linear-to-br from-orange-50 to-amber-50 p-8 text-center">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8">
          <div className="text-center">
            <div className="font-display text-3xl font-bold text-slate-900">4.9/5</div>
            <div className="mt-1 text-sm text-slate-600">Average rating</div>
          </div>
          <div className="h-12 w-px bg-slate-300" />
          <div className="text-center">
            <div className="font-display text-3xl font-bold text-slate-900">500+</div>
            <div className="mt-1 text-sm text-slate-600">Happy clients</div>
          </div>
          <div className="h-12 w-px bg-slate-300" />
          <div className="text-center">
            <div className="font-display text-3xl font-bold text-slate-900">98%</div>
            <div className="mt-1 text-sm text-slate-600">Would recommend</div>
          </div>
        </div>
      </div>
    </section>
  );
}
