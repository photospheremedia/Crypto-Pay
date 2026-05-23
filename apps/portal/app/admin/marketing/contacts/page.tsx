"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Upload,
  Download,
  MoreVertical,
  Users,
  Mail,
  Tag,
  Trash2,
  Edit2,
  Eye,
  Loader2,
  Filter,
  CheckCircle2,
  XCircle,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  company?: string;
  tags: string[];
  subscribed: boolean;
  created_at: string;
  last_emailed?: string;
}

export default function ContactsPage() {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    first_name: "",
    last_name: "",
    company: "",
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setContacts([
        {
          id: "contact-001",
          email: "john@joes-diner.com",
          first_name: "John",
          last_name: "Smith",
          company: "Joe's Diner",
          tags: ["customer", "wholesale"],
          subscribed: true,
          created_at: "2024-01-15",
          last_emailed: "2024-03-10",
        },
        {
          id: "contact-002",
          email: "maria@italianplace.com",
          first_name: "Maria",
          last_name: "Garcia",
          company: "The Italian Place",
          tags: ["customer", "vip"],
          subscribed: true,
          created_at: "2024-02-01",
          last_emailed: "2024-03-12",
        },
        {
          id: "contact-003",
          email: "chef@downtown-bistro.com",
          first_name: "Michael",
          last_name: "Chen",
          company: "Downtown Bistro",
          tags: ["customer"],
          subscribed: true,
          created_at: "2024-02-15",
        },
        {
          id: "contact-004",
          email: "orders@seafood-shack.com",
          first_name: "Sarah",
          last_name: "Johnson",
          company: "Seafood Shack",
          tags: ["customer", "wholesale"],
          subscribed: false,
          created_at: "2024-01-20",
          last_emailed: "2024-02-28",
        },
        {
          id: "contact-005",
          email: "buyer@hotelchain.com",
          first_name: "David",
          last_name: "Brown",
          company: "Grand Hotel Chain",
          tags: ["prospect", "enterprise"],
          subscribed: true,
          created_at: "2024-03-01",
        },
      ]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load contacts",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(filteredContacts.map((c) => c.id));
    } else {
      setSelectedContacts([]);
    }
  };

  const handleSelectContact = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedContacts([...selectedContacts, id]);
    } else {
      setSelectedContacts(selectedContacts.filter((cid) => cid !== id));
    }
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    const newContact: Contact = {
      id: `contact-${Date.now()}`,
      email: formData.email,
      first_name: formData.first_name,
      last_name: formData.last_name,
      company: formData.company || undefined,
      tags: [],
      subscribed: true,
      created_at: new Date().toISOString(),
    };
    setContacts([newContact, ...contacts]);
    setDialogOpen(false);
    setFormData({ email: "", first_name: "", last_name: "", company: "" });
    toast({ title: "Contact Added", description: "New contact has been added to your list." });
  };

  const handleDelete = (ids: string[]) => {
    setContacts(contacts.filter((c) => !ids.includes(c.id)));
    setSelectedContacts([]);
    toast({ title: "Deleted", description: `${ids.length} contact(s) deleted.` });
  };

  const handleToggleSubscription = (id: string) => {
    setContacts(
      contacts.map((c) => (c.id === id ? { ...c, subscribed: !c.subscribed } : c))
    );
    toast({ title: "Updated", description: "Subscription status updated." });
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Marketing Contacts"
        description="Manage your email marketing contact list"
        backHref="/admin/marketing"
        backLabel="Marketing"
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Total Contacts</p>
              <p className="text-xl font-bold text-slate-900">{contacts.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Subscribed</p>
              <p className="text-xl font-bold text-slate-900">
                {contacts.filter((c) => c.subscribed).length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Unsubscribed</p>
              <p className="text-xl font-bold text-slate-900">
                {contacts.filter((c) => !c.subscribed).length}
              </p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100">
              <Tag className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">With Tags</p>
              <p className="text-xl font-bold text-slate-900">
                {contacts.filter((c) => c.tags.length > 0).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search contacts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {selectedContacts.length > 0 && (
            <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedContacts)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedContacts.length})
            </Button>
          )}
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-500 hover:bg-orange-600">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Contact</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddContact} className="space-y-4">
                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>First Name *</Label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      placeholder="John"
                      required
                    />
                  </div>
                  <div>
                    <Label>Last Name *</Label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      placeholder="Smith"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Company name (optional)"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
                    Add Contact
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500">No contacts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 w-10">
                    <Checkbox
                      checked={selectedContacts.length === filteredContacts.length && filteredContacts.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Company</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Tags</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Added</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredContacts.map((contact) => (
                  <tr key={contact.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={(checked) => handleSelectContact(contact.id, checked as boolean)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {contact.first_name} {contact.last_name}
                        </p>
                        <p className="text-sm text-slate-500">{contact.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{contact.company || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        {contact.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          contact.subscribed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }
                      >
                        {contact.subscribed ? "Subscribed" : "Unsubscribed"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">{formatDate(contact.created_at)}</td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleSubscription(contact.id)}>
                            <Mail className="h-4 w-4 mr-2" />
                            {contact.subscribed ? "Unsubscribe" : "Subscribe"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete([contact.id])}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
