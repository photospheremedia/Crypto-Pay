"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  MoreVertical,
  FileText,
  Eye,
  Edit2,
  Trash2,
  Copy,
  Loader2,
  Star,
  Mail,
  ShoppingCart,
  Package,
  Bell,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  subject: string;
  category: string;
  thumbnail?: string;
  last_modified: string;
  times_used: number;
  is_system: boolean;
}

const categoryIcons: Record<string, typeof Mail> = {
  "Welcome": Star,
  "Order": ShoppingCart,
  "Shipping": Package,
  "Promotional": Sparkles,
  "Notification": Bell,
  "General": Mail,
};

const categoryColors: Record<string, string> = {
  "Welcome": "bg-purple-100 text-purple-700",
  "Order": "bg-blue-100 text-blue-700",
  "Shipping": "bg-green-100 text-green-700",
  "Promotional": "bg-orange-100 text-orange-700",
  "Notification": "bg-yellow-100 text-yellow-700",
  "General": "bg-slate-100 text-slate-700",
};

export default function TemplatesPage() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = ["all", "Welcome", "Order", "Shipping", "Promotional", "Notification"];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setTemplates([
        {
          id: "tmpl-001",
          name: "Welcome Email",
          subject: "Welcome to Crypto Pay! 🎉",
          category: "Welcome",
          last_modified: "2024-03-10",
          times_used: 450,
          is_system: true,
        },
        {
          id: "tmpl-002",
          name: "Order Confirmation",
          subject: "Your Order #{{order_number}} is Confirmed",
          category: "Order",
          last_modified: "2024-03-08",
          times_used: 1200,
          is_system: true,
        },
        {
          id: "tmpl-003",
          name: "Shipping Notification",
          subject: "Your Order is On Its Way! 🚚",
          category: "Shipping",
          last_modified: "2024-03-05",
          times_used: 980,
          is_system: true,
        },
        {
          id: "tmpl-004",
          name: "Summer Sale Promo",
          subject: "☀️ Summer Sale - Up to 30% Off!",
          category: "Promotional",
          last_modified: "2024-03-15",
          times_used: 150,
          is_system: false,
        },
        {
          id: "tmpl-005",
          name: "Re-Order Reminder",
          subject: "Running Low? Time to Restock!",
          category: "Notification",
          last_modified: "2024-03-12",
          times_used: 320,
          is_system: false,
        },
        {
          id: "tmpl-006",
          name: "Invoice",
          subject: "Invoice for Order #{{order_number}}",
          category: "Order",
          last_modified: "2024-03-01",
          times_used: 890,
          is_system: true,
        },
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = (template: Template) => {
    const duplicate: Template = {
      ...template,
      id: `tmpl-${Date.now()}`,
      name: `${template.name} (Copy)`,
      is_system: false,
      times_used: 0,
      last_modified: new Date().toISOString(),
    };
    setTemplates([duplicate, ...templates]);
    toast({ title: "Duplicated", description: "Template has been duplicated." });
  };

  const handleDelete = (id: string) => {
    const template = templates.find((t) => t.id === id);
    if (template?.is_system) {
      toast({ title: "Cannot Delete", description: "System templates cannot be deleted.", variant: "destructive" });
      return;
    }
    setTemplates(templates.filter((t) => t.id !== id));
    toast({ title: "Deleted", description: "Template has been deleted." });
  };

  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Email Templates"
        description="Manage your email templates for campaigns and automations"
        backHref="/admin/marketing"
        backLabel="Marketing"
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Templates</p>
              <p className="text-xl font-bold text-slate-900">{templates.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
              <Star className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">System Templates</p>
              <p className="text-xl font-bold text-slate-900">
                {templates.filter((t) => t.is_system).length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Mail className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Emails Sent</p>
              <p className="text-xl font-bold text-slate-900">
                {templates.reduce((sum, t) => sum + t.times_used, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={categoryFilter === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoryFilter(cat)}
                className={categoryFilter === cat ? "bg-orange-500 hover:bg-orange-600" : ""}
              >
                {cat === "all" ? "All" : cat}
              </Button>
            ))}
          </div>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-slate-200 bg-white">
          <FileText className="h-12 w-12 mx-auto text-slate-300 mb-3" />
          <p className="text-slate-500">No templates found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => {
            const CategoryIcon = categoryIcons[template.category] || Mail;
            return (
              <div
                key={template.id}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Preview area */}
                <div className="h-32 bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center relative">
                  <div className="absolute top-3 left-3">
                    <Badge className={categoryColors[template.category]}>
                      <CategoryIcon className="h-3 w-3 mr-1" />
                      {template.category}
                    </Badge>
                  </div>
                  {template.is_system && (
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="text-xs">
                        System
                      </Badge>
                    </div>
                  )}
                  <FileText className="h-12 w-12 text-slate-300" />
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-slate-900 mb-1">{template.name}</h3>
                  <p className="text-sm text-slate-500 truncate mb-3">{template.subject}</p>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Used {template.times_used} times</span>
                    <span>Modified {formatDate(template.last_modified)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" className="h-8">
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8">
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDuplicate(template)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </DropdownMenuItem>
                      {!template.is_system && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(template.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
