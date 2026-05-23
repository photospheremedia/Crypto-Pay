import Link from "next/link";
import ShopGrid, { type ShopItem } from "./shop-grid";

const bundles = [
  {
    title: "Delivery essentials kit",
    copy: "Bags, utensils, napkins, seals, and thermal labels for daily takeout volume.",
    value: "$220+ / month",
  },
  {
    title: "Kitchen prep pack",
    copy: "Gloves, prep containers, labels, and sanitation supplies for BOH teams.",
    value: "$180+ / month",
  },
  {
    title: "Brand upgrade bundle",
    copy: "Premium packaging, stickers, and menu inserts that lift AOV.",
    value: "$260+ / month",
  },
];

const categories = [
  "Packaging",
  "Utensils",
  "Cleaning",
  "Paper & receipts",
  "Labels",
  "Smallwares",
  "Kitchen tools",
  "Safety & PPE",
];

const shopItems: ShopItem[] = [
  {
    id: "pack-thermal-bags",
    name: "Thermal delivery bags (set of 10)",
    description: "Keep orders hot and brand-ready with insulated carriers.",
    category: "Packaging",
    priceCents: 12900,
    badge: "Top pick",
  },
  {
    id: "labels-daily",
    name: "Day-dot label roll (6 pack)",
    description: "Prep labels for kitchen compliance and inventory rotation.",
    category: "Labels",
    priceCents: 4200,
  },
  {
    id: "gloves-vinyl",
    name: "Vinyl gloves (1,000 ct)",
    description: "Food-safe gloves for daily prep and cleaning workflows.",
    category: "Safety & PPE",
    priceCents: 8900,
  },
  {
    id: "bags-paper",
    name: "Handled paper bags (250 ct)",
    description: "Durable carry bags for pickup and delivery orders.",
    category: "Packaging",
    priceCents: 10200,
  },
  {
    id: "receipt-rolls",
    name: "Thermal receipt rolls (case of 50)",
    description: "POS-ready rolls for printers and kitchen tickets.",
    category: "Paper & receipts",
    priceCents: 7600,
  },
  {
    id: "utensil-kits",
    name: "Compostable utensil kits (500 ct)",
    description: "Fork, knife, napkin bundles for takeout orders.",
    category: "Utensils",
    priceCents: 5400,
    badge: "Eco",
  },
  {
    id: "food-containers",
    name: "Takeout containers (200 ct)",
    description: "Microwavable, stackable containers with secure lids.",
    category: "Packaging",
    priceCents: 11800,
  },
  {
    id: "tamper-seals",
    name: "Tamper-evident seals (1,000 ct)",
    description: "Secure delivery bags with branded safety seals.",
    category: "Packaging",
    priceCents: 3400,
    badge: "Best value",
  },
  {
    id: "sanitizer-bulk",
    name: "Hand sanitizer (gallon refill)",
    description: "FDA-approved formula for front and back of house.",
    category: "Cleaning",
    priceCents: 2800,
  },
  {
    id: "napkins-dispenser",
    name: "Napkin dispenser refills (6,000 ct)",
    description: "Eco-friendly napkins for high-volume service.",
    category: "Paper & receipts",
    priceCents: 6200,
  },
  {
    id: "prep-containers",
    name: "Prep storage containers (set of 12)",
    description: "Clear, stackable containers with measurement marks.",
    category: "Kitchen tools",
    priceCents: 4900,
  },
  {
    id: "cutting-boards",
    name: "Color-coded cutting boards (set of 6)",
    description: "NSF-certified boards for food safety compliance.",
    category: "Kitchen tools",
    priceCents: 7800,
    badge: "Pro pick",
  },
  {
    id: "aprons-pack",
    name: "Chef aprons (pack of 12)",
    description: "Durable cotton-poly blend with adjustable neck straps.",
    category: "Safety & PPE",
    priceCents: 9600,
  },
  {
    id: "floor-mats",
    name: "Anti-fatigue floor mats (2 pack)",
    description: "Comfort mats for prep stations and line cooks.",
    category: "Smallwares",
    priceCents: 15900,
  },
  {
    id: "sauce-bottles",
    name: "Squeeze sauce bottles (24 ct)",
    description: "Precision tips for plating and portion control.",
    category: "Smallwares",
    priceCents: 3200,
  },
];

export default function ShopPage() {
  return (
    <section className="mx-auto w-full max-w-6xl px-6 pt-24 pb-16 lg:pt-28">
      <div className="grid gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-orange-600">
            Shop
          </p>
          <h1 className="font-display mt-3 text-4xl font-semibold text-slate-900">
            Curated supplies with reseller pricing built in.
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Browse curated bundles, add items to your cart, and submit for a fast quote.
            We handle supplier coordination, fulfillment tracking, and restock schedules.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200/60 hover:bg-orange-600"
            >
              Start a quote
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700"
            >
              Talk to sales
            </Link>
          </div>
        </div>
        <div className="rounded-[28px] border border-white/80 bg-white/80 p-6 shadow-lg">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
            Popular bundles
          </p>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            {bundles.map((bundle) => (
              <div key={bundle.title} className="rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{bundle.title}</p>
                <p className="mt-1 text-sm text-slate-600">{bundle.copy}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-orange-500">
                  {bundle.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-500">
          Featured supplies
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-slate-900">
          High-velocity items your team reorders weekly.
        </h2>
        <div className="mt-6">
          <ShopGrid items={shopItems} />
        </div>
      </div>

      <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-orange-500">
          Categories
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {categories.map((category) => (
            <div
              key={category}
              className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700"
            >
              {category}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
