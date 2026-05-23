"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Filter, X, CheckCircle2, ArrowRight } from "lucide-react";

/**
 * Searchable & Filterable Integrations Table - Urban Piper Style
 * 
 * Features:
 * - Search across all integration names and categories
 * - Filter by category (Delivery, POS, Payment, Analytics, etc.)
 * - Filter by integration status (Active, Beta, Planned)
 * - Display count of matching integrations
 * - Responsive table design
 * - Visual category badges
 */

const integrations = [
  // Delivery Platforms
  { 
    name: "Uber Eats", 
    category: "Delivery", 
    status: "Active",
    features: ["Order routing", "Menu sync", "Real-time updates"],
    documentation: "https://docs.urbanpiper.com/uber-eats"
  },
  { 
    name: "DoorDash", 
    category: "Delivery", 
    status: "Active",
    features: ["Order routing", "Menu sync", "Real-time updates"],
    documentation: "https://docs.urbanpiper.com/doordash"
  },
  { 
    name: "Grubhub", 
    category: "Delivery", 
    status: "Active",
    features: ["Order routing", "Menu sync", "Real-time updates"],
    documentation: "https://docs.urbanpiper.com/grubhub"
  },
  { 
    name: "Deliveroo", 
    category: "Delivery", 
    status: "Active",
    features: ["Order routing", "Menu sync", "Real-time updates"],
    documentation: "https://docs.urbanpiper.com/deliveroo"
  },
  { 
    name: "Just Eat", 
    category: "Delivery", 
    status: "Active",
    features: ["Order routing", "Menu sync", "Real-time updates"],
    documentation: "https://docs.urbanpiper.com/just-eat"
  },
  { 
    name: "Postmates", 
    category: "Delivery", 
    status: "Active",
    features: ["Order routing", "Menu sync"],
    documentation: "https://docs.urbanpiper.com/postmates"
  },
  { 
    name: "Instacart", 
    category: "Delivery", 
    status: "Active",
    features: ["Menu sync", "Inventory management"],
    documentation: "https://docs.urbanpiper.com/instacart"
  },
  { 
    name: "Seamless", 
    category: "Delivery", 
    status: "Active",
    features: ["Order routing", "Menu sync"],
    documentation: "https://docs.urbanpiper.com/seamless"
  },
  { 
    name: "Talabat", 
    category: "Delivery", 
    status: "Active",
    features: ["Order routing", "Menu sync", "Real-time updates"],
    documentation: "https://docs.urbanpiper.com/talabat"
  },
  { 
    name: "Zomato", 
    category: "Delivery", 
    status: "Active",
    features: ["Order routing", "Menu sync", "Real-time updates"],
    documentation: "https://docs.urbanpiper.com/zomato"
  },
  { 
    name: "Swiggy", 
    category: "Delivery", 
    status: "Active",
    features: ["Order routing", "Menu sync"],
    documentation: "https://docs.urbanpiper.com/swiggy"
  },
  { 
    name: "Caviar", 
    category: "Delivery", 
    status: "Active",
    features: ["Order routing", "Menu sync"],
    documentation: "https://docs.urbanpiper.com/caviar"
  },

  // POS Systems
  { 
    name: "Square", 
    category: "POS", 
    status: "Active",
    features: ["Two-way sync", "Order routing", "Payment reconciliation"],
    documentation: "https://docs.urbanpiper.com/square"
  },
  { 
    name: "Toast", 
    category: "POS", 
    status: "Active",
    features: ["Two-way sync", "Order routing", "Menu sync"],
    documentation: "https://docs.urbanpiper.com/toast"
  },
  { 
    name: "Clover", 
    category: "POS", 
    status: "Active",
    features: ["Two-way sync", "Order routing"],
    documentation: "https://docs.urbanpiper.com/clover"
  },
  { 
    name: "Lightspeed", 
    category: "POS", 
    status: "Active",
    features: ["Order routing", "Menu sync"],
    documentation: "https://docs.urbanpiper.com/lightspeed"
  },
  { 
    name: "Micros Oracle", 
    category: "POS", 
    status: "Active",
    features: ["Order routing", "Integration support"],
    documentation: "https://docs.urbanpiper.com/micros"
  },
  { 
    name: "NCR Aloha", 
    category: "POS", 
    status: "Active",
    features: ["Order routing", "Integration support"],
    documentation: "https://docs.urbanpiper.com/ncr"
  },

  // Payment Processors
  { 
    name: "Stripe", 
    category: "Payments", 
    status: "Active",
    features: ["Payment processing", "Reconciliation", "Multi-currency"],
    documentation: "https://docs.urbanpiper.com/stripe"
  },
  { 
    name: "Square Payments", 
    category: "Payments", 
    status: "Active",
    features: ["Direct settlement", "Reconciliation"],
    documentation: "https://docs.urbanpiper.com/square-payments"
  },
  { 
    name: "PayPal", 
    category: "Payments", 
    status: "Active",
    features: ["Payment processing", "Multi-currency"],
    documentation: "https://docs.urbanpiper.com/paypal"
  },

  // Analytics & Reporting
  { 
    name: "Google Analytics", 
    category: "Analytics", 
    status: "Active",
    features: ["Traffic tracking", "Conversion tracking"],
    documentation: "https://docs.urbanpiper.com/google-analytics"
  },
  { 
    name: "Mixpanel", 
    category: "Analytics", 
    status: "Active",
    features: ["Event tracking", "Cohort analysis"],
    documentation: "https://docs.urbanpiper.com/mixpanel"
  },
  { 
    name: "Amplitude", 
    category: "Analytics", 
    status: "Beta",
    features: ["Event tracking", "User journeys"],
    documentation: "https://docs.urbanpiper.com/amplitude"
  },

  // Marketing & Email
  { 
    name: "Mailchimp", 
    category: "Marketing", 
    status: "Active",
    features: ["Email campaigns", "Customer segmentation"],
    documentation: "https://docs.urbanpiper.com/mailchimp"
  },
  { 
    name: "Klaviyo", 
    category: "Marketing", 
    status: "Active",
    features: ["Email marketing", "SMS campaigns"],
    documentation: "https://docs.urbanpiper.com/klaviyo"
  },
  { 
    name: "Twilio", 
    category: "Marketing", 
    status: "Active",
    features: ["SMS messaging", "Voice calls"],
    documentation: "https://docs.urbanpiper.com/twilio"
  },

  // Accounting
  { 
    name: "QuickBooks", 
    category: "Accounting", 
    status: "Active",
    features: ["Transaction sync", "Report generation"],
    documentation: "https://docs.urbanpiper.com/quickbooks"
  },
  { 
    name: "Xero", 
    category: "Accounting", 
    status: "Active",
    features: ["Invoice sync", "Expense tracking"],
    documentation: "https://docs.urbanpiper.com/xero"
  },

  // Inventory
  { 
    name: "MarginEdge", 
    category: "Inventory", 
    status: "Active",
    features: ["Inventory tracking", "Cost management"],
    documentation: "https://docs.urbanpiper.com/marginedge"
  },
  { 
    name: "Toast Inventory", 
    category: "Inventory", 
    status: "Active",
    features: ["Real-time sync", "Stock tracking"],
    documentation: "https://docs.urbanpiper.com/toast-inventory"
  },
];

const categories = ["All", "Delivery", "POS", "Payments", "Analytics", "Marketing", "Accounting", "Inventory"];
const statuses = ["All", "Active", "Beta", "Planned"];

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    "Delivery": "bg-blue-100 text-blue-800",
    "POS": "bg-purple-100 text-purple-800",
    "Payments": "bg-green-100 text-green-800",
    "Analytics": "bg-orange-100 text-orange-800",
    "Marketing": "bg-pink-100 text-pink-800",
    "Accounting": "bg-yellow-100 text-yellow-800",
    "Inventory": "bg-indigo-100 text-indigo-800",
  };
  return colors[category] || "bg-slate-100 text-slate-800";
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    "Active": "bg-green-100 text-green-800 border-green-300",
    "Beta": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "Planned": "bg-slate-100 text-slate-800 border-slate-300",
  };
  return colors[status] || "bg-slate-100 text-slate-800";
};

export function IntegrationsTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const filteredIntegrations = useMemo(() => {
    return integrations.filter((integration) => {
      const matchesSearch = 
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === "All" || integration.category === selectedCategory;
      const matchesStatus = selectedStatus === "All" || integration.status === selectedStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [searchQuery, selectedCategory, selectedStatus]);

  return (
    <section className="py-20 bg-white">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-sm font-semibold text-orange-600 uppercase tracking-wide mb-3">Complete Integration Library</h2>
          <p className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Connect with 35+ Services
          </p>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Search and filter through our complete integration library. Find exactly what you need.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="mb-8 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search integrations by name or feature..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-semibold text-slate-600 py-2">Category:</span>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-orange-500 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-semibold text-slate-600 py-2">Status:</span>
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedStatus === status
                    ? "bg-blue-500 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-sm text-slate-600">
          Showing <span className="font-semibold text-slate-900">{filteredIntegrations.length}</span> of{" "}
          <span className="font-semibold text-slate-900">{integrations.length}</span> integrations
        </div>

        {/* Integrations Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Integration</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Category</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Features</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Status</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredIntegrations.map((integration, index) => (
                <tr key={index} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-900">{integration.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(integration.category)}`}>
                      {integration.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {integration.features.map((feature, i) => (
                        <span key={i} className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(integration.status)}`}>
                      {integration.status === "Active" && <CheckCircle2 className="inline h-3 w-3 mr-1" />}
                      {integration.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Link
                      href={integration.documentation}
                      className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium text-sm"
                      target="_blank"
                    >
                      Docs
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* No Results State */}
        {filteredIntegrations.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-slate-600 mb-4">No integrations found matching your criteria.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
                setSelectedStatus("All");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-orange-600 hover:text-orange-700 font-semibold"
            >
              Clear filters
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 rounded-2xl bg-linear-to-r from-orange-500/10 to-yellow-500/10 border border-orange-200/50 p-12 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">
            Can't find an integration you need?
          </h3>
          <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
            We're constantly adding new integrations. Let us know what you'd like to connect and we'll build it.
          </p>
          <Link
            href="/contact?inquiry=integration"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            Request an Integration
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
