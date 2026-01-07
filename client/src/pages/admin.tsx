import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Download,
  Users,
  TrendingUp,
  Calendar,
  Mail,
  Search,
  ChevronLeft,
  ChevronRight,
  Lock,
  Trash2,
  MailX,
  MailCheck,
  UserX,
  Shield,
  RefreshCw,
  Key,
  Power,
  Copy,
  Check
} from "lucide-react";

interface Lead {
  id: number;
  email: string;
  name: string | null;
  income_range: string | null;
  source: string;
  created_at: string;
  updated_at: string;
  unsubscribed: number;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
  verified: number;
}

interface Stats {
  leads: {
    total: number;
    subscribed: number;
    unsubscribed: number;
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  users: {
    total: number;
    today: number;
    thisWeek: number;
  };
}

type Tab = "leads" | "users";

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("leads");

  // Leads state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsPage, setLeadsPage] = useState(1);
  const [leadsTotalPages, setLeadsTotalPages] = useState(1);
  const [leadsSearch, setLeadsSearch] = useState("");

  // Users state
  const [users, setUsers] = useState<User[]>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersTotalPages, setUsersTotalPages] = useState(1);
  const [usersSearch, setUsersSearch] = useState("");

  const [stats, setStats] = useState<Stats>({
    leads: { total: 0, subscribed: 0, unsubscribed: 0, today: 0, thisWeek: 0, thisMonth: 0 },
    users: { total: 0, today: 0, thisWeek: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const authenticate = async () => {
    setError("");
    try {
      const res = await fetch(`/api/admin/leads?page=1&limit=10`, {
        headers: { "x-admin-key": adminKey }
      });
      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem("adminKey", adminKey);
      } else {
        setError("Invalid admin key");
      }
    } catch {
      setError("Authentication failed");
    }
  };

  useEffect(() => {
    const savedKey = localStorage.getItem("adminKey");
    if (savedKey) {
      setAdminKey(savedKey);
      fetch(`/api/admin/leads?page=1&limit=1`, {
        headers: { "x-admin-key": savedKey }
      }).then(res => {
        if (res.ok) setIsAuthenticated(true);
      });
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchStats();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    if (activeTab === "leads") {
      fetchLeads();
    } else {
      fetchUsers();
    }
  }, [isAuthenticated, activeTab, leadsPage, usersPage]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads?page=${leadsPage}&limit=20&search=${leadsSearch}`, {
        headers: { "x-admin-key": adminKey }
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads);
        setLeadsTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error("Failed to fetch leads:", e);
    }
    setLoading(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users?page=${usersPage}&limit=20&search=${usersSearch}`, {
        headers: { "x-admin-key": adminKey }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setUsersTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error("Failed to fetch users:", e);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`/api/admin/stats`, {
        headers: { "x-admin-key": adminKey }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error("Failed to fetch stats:", e);
    }
  };

  const exportCSV = async (type: "leads" | "users") => {
    try {
      const res = await fetch(`/api/admin/${type}/export`, {
        headers: { "x-admin-key": adminKey }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("Failed to export:", e);
    }
  };

  const deleteLead = async (id: number) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    setActionLoading(`lead-${id}`);
    try {
      const res = await fetch(`/api/admin/leads/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey }
      });
      if (res.ok) {
        setLeads(leads.filter(l => l.id !== id));
        fetchStats();
      }
    } catch (e) {
      console.error("Failed to delete:", e);
    }
    setActionLoading(null);
  };

  const toggleUnsubscribe = async (id: number) => {
    setActionLoading(`unsub-${id}`);
    try {
      const res = await fetch(`/api/admin/leads/${id}/unsubscribe`, {
        method: "PATCH",
        headers: { "x-admin-key": adminKey }
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(leads.map(l => l.id === id ? { ...l, unsubscribed: data.unsubscribed } : l));
        fetchStats();
      }
    } catch (e) {
      console.error("Failed to toggle:", e);
    }
    setActionLoading(null);
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    setActionLoading(`user-${id}`);
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        headers: { "x-admin-key": adminKey }
      });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
        fetchStats();
      }
    } catch (e) {
      console.error("Failed to delete:", e);
    }
    setActionLoading(null);
  };

  const [tempPassword, setTempPassword] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const resetUserPassword = async (id: string, email: string) => {
    if (!confirm(`Reset password for ${email}? A new temporary password will be generated.`)) return;
    setActionLoading(`reset-${id}`);
    try {
      const res = await fetch(`/api/admin/users/${id}/reset-password`, {
        method: "POST",
        headers: { "x-admin-key": adminKey }
      });
      if (res.ok) {
        const data = await res.json();
        setTempPassword({ email: data.email, password: data.tempPassword });
      }
    } catch (e) {
      console.error("Failed to reset password:", e);
    }
    setActionLoading(null);
  };

  const toggleUserActive = async (id: string) => {
    setActionLoading(`toggle-${id}`);
    try {
      const res = await fetch(`/api/admin/users/${id}/toggle-active`, {
        method: "PATCH",
        headers: { "x-admin-key": adminKey }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(users.map(u => u.id === id ? { ...u, verified: data.active ? 1 : 0 } : u));
      }
    } catch (e) {
      console.error("Failed to toggle active:", e);
    }
    setActionLoading(null);
  };

  const copyPassword = () => {
    if (tempPassword) {
      navigator.clipboard.writeText(tempPassword.password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeadsSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setLeadsPage(1);
    fetchLeads();
  };

  const handleUsersSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setUsersPage(1);
    fetchUsers();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#0f0f0f] border-[#1a1a1a]">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-emerald-500" />
            </div>
            <CardTitle className="text-xl text-white">Admin Dashboard</CardTitle>
            <p className="text-neutral-400 text-sm mt-2">Enter your admin key to continue</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Admin Key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && authenticate()}
              className="bg-[#171717] border-[#262626] text-white"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button
              onClick={authenticate}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              Access Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] p-4 md:p-8">
      {/* Password Reset Modal */}
      {tempPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f0f0f] border border-[#262626] rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-2">Password Reset</h3>
            <p className="text-neutral-400 text-sm mb-4">
              New temporary password for <span className="text-white">{tempPassword.email}</span>
            </p>
            <div className="bg-[#171717] border border-[#262626] rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <code className="text-emerald-400 font-mono text-lg">{tempPassword.password}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyPassword}
                  className="border-[#262626] text-neutral-300 h-8"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <p className="text-yellow-400 text-xs mb-4">
              Share this password securely. The user should change it after logging in.
            </p>
            <Button
              onClick={() => setTempPassword(null)}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              Done
            </Button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-neutral-400 mt-1">Manage users and newsletter subscribers</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button
              onClick={() => { fetchStats(); activeTab === "leads" ? fetchLeads() : fetchUsers(); }}
              variant="outline"
              className="border-[#262626] text-neutral-300 hover:bg-[#171717]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.removeItem("adminKey");
                setIsAuthenticated(false);
              }}
              className="border-[#262626] text-neutral-300 hover:bg-[#171717]"
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-xs">Total Leads</p>
                  <p className="text-2xl font-bold text-white">{stats.leads.total}</p>
                </div>
                <Mail className="w-6 h-6 text-emerald-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-xs">Subscribed</p>
                  <p className="text-2xl font-bold text-emerald-400">{stats.leads.subscribed}</p>
                </div>
                <MailCheck className="w-6 h-6 text-emerald-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-xs">Unsubscribed</p>
                  <p className="text-2xl font-bold text-red-400">{stats.leads.unsubscribed}</p>
                </div>
                <MailX className="w-6 h-6 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-xs">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.users.total}</p>
                </div>
                <Users className="w-6 h-6 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-xs">Leads Today</p>
                  <p className="text-2xl font-bold text-white">{stats.leads.today}</p>
                </div>
                <Calendar className="w-6 h-6 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-xs">This Week</p>
                  <p className="text-2xl font-bold text-white">{stats.leads.thisWeek}</p>
                </div>
                <TrendingUp className="w-6 h-6 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab("leads")}
            variant={activeTab === "leads" ? "default" : "outline"}
            className={activeTab === "leads"
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "border-[#262626] text-neutral-300 hover:bg-[#171717]"}
          >
            <Mail className="w-4 h-4 mr-2" />
            Leads ({stats.leads.total})
          </Button>
          <Button
            onClick={() => setActiveTab("users")}
            variant={activeTab === "users" ? "default" : "outline"}
            className={activeTab === "users"
              ? "bg-emerald-600 hover:bg-emerald-700"
              : "border-[#262626] text-neutral-300 hover:bg-[#171717]"}
          >
            <Users className="w-4 h-4 mr-2" />
            Users ({stats.users.total})
          </Button>
        </div>

        {/* Leads Tab */}
        {activeTab === "leads" && (
          <>
            {/* Search & Export */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <form onSubmit={handleLeadsSearch} className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <Input
                    placeholder="Search by email or name..."
                    value={leadsSearch}
                    onChange={(e) => setLeadsSearch(e.target.value)}
                    className="pl-10 bg-[#0f0f0f] border-[#262626] text-white"
                  />
                </div>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  Search
                </Button>
              </form>
              <Button onClick={() => exportCSV("leads")} className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Leads Table */}
            <Card className="bg-[#0f0f0f] border-[#1a1a1a] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#171717]">
                    <tr>
                      <th className="text-left p-4 text-neutral-400 font-medium text-sm">Email</th>
                      <th className="text-left p-4 text-neutral-400 font-medium text-sm">Name</th>
                      <th className="text-left p-4 text-neutral-400 font-medium text-sm">Income</th>
                      <th className="text-left p-4 text-neutral-400 font-medium text-sm">Source</th>
                      <th className="text-left p-4 text-neutral-400 font-medium text-sm">Status</th>
                      <th className="text-left p-4 text-neutral-400 font-medium text-sm">Date</th>
                      <th className="text-left p-4 text-neutral-400 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-neutral-500">Loading...</td>
                      </tr>
                    ) : leads.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-neutral-500">No leads found</td>
                      </tr>
                    ) : (
                      leads.map((lead) => (
                        <tr key={lead.id} className="border-t border-[#1a1a1a] hover:bg-[#171717]">
                          <td className="p-4 text-white">{lead.email}</td>
                          <td className="p-4 text-neutral-300">{lead.name || "-"}</td>
                          <td className="p-4">
                            {lead.income_range ? (
                              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs">
                                {lead.income_range}
                              </span>
                            ) : "-"}
                          </td>
                          <td className="p-4 text-neutral-400 text-sm">{lead.source}</td>
                          <td className="p-4">
                            {lead.unsubscribed ? (
                              <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs">Unsubscribed</span>
                            ) : (
                              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs">Subscribed</span>
                            )}
                          </td>
                          <td className="p-4 text-neutral-400 text-sm">
                            {new Date(lead.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleUnsubscribe(lead.id)}
                                disabled={actionLoading === `unsub-${lead.id}`}
                                className="border-[#262626] text-neutral-300 hover:bg-[#262626] h-8 px-2"
                                title={lead.unsubscribed ? "Resubscribe" : "Unsubscribe"}
                              >
                                {lead.unsubscribed ? <MailCheck className="w-4 h-4" /> : <MailX className="w-4 h-4" />}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteLead(lead.id)}
                                disabled={actionLoading === `lead-${lead.id}`}
                                className="border-red-900 text-red-400 hover:bg-red-900/20 h-8 px-2"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {leadsTotalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-[#1a1a1a]">
                  <p className="text-neutral-400 text-sm">Page {leadsPage} of {leadsTotalPages}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLeadsPage(p => Math.max(1, p - 1))}
                      disabled={leadsPage === 1}
                      className="border-[#262626] text-neutral-300"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLeadsPage(p => Math.min(leadsTotalPages, p + 1))}
                      disabled={leadsPage === leadsTotalPages}
                      className="border-[#262626] text-neutral-300"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </>
        )}

        {/* Users Tab */}
        {activeTab === "users" && (
          <>
            {/* Search & Export */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <form onSubmit={handleUsersSearch} className="flex gap-2 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                  <Input
                    placeholder="Search by email or name..."
                    value={usersSearch}
                    onChange={(e) => setUsersSearch(e.target.value)}
                    className="pl-10 bg-[#0f0f0f] border-[#262626] text-white"
                  />
                </div>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  Search
                </Button>
              </form>
              <Button onClick={() => exportCSV("users")} className="bg-blue-600 hover:bg-blue-700">
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>

            {/* Users Table */}
            <Card className="bg-[#0f0f0f] border-[#1a1a1a] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#171717]">
                    <tr>
                      <th className="text-left p-4 text-neutral-400 font-medium text-sm">Email</th>
                      <th className="text-left p-4 text-neutral-400 font-medium text-sm">Name</th>
                      <th className="text-left p-4 text-neutral-400 font-medium text-sm">Verified</th>
                      <th className="text-left p-4 text-neutral-400 font-medium text-sm">Joined</th>
                      <th className="text-left p-4 text-neutral-400 font-medium text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-neutral-500">Loading...</td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-neutral-500">No users found</td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="border-t border-[#1a1a1a] hover:bg-[#171717]">
                          <td className="p-4 text-white">{user.email}</td>
                          <td className="p-4 text-neutral-300">{user.name || "-"}</td>
                          <td className="p-4">
                            {user.verified ? (
                              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs flex items-center gap-1 w-fit">
                                <Shield className="w-3 h-3" /> Active
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs">Inactive</span>
                            )}
                          </td>
                          <td className="p-4 text-neutral-400 text-sm">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleUserActive(user.id)}
                                disabled={actionLoading === `toggle-${user.id}`}
                                className={user.verified
                                  ? "border-yellow-900 text-yellow-400 hover:bg-yellow-900/20 h-8 px-2"
                                  : "border-emerald-900 text-emerald-400 hover:bg-emerald-900/20 h-8 px-2"
                                }
                                title={user.verified ? "Deactivate User" : "Activate User"}
                              >
                                <Power className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => resetUserPassword(user.id, user.email)}
                                disabled={actionLoading === `reset-${user.id}`}
                                className="border-blue-900 text-blue-400 hover:bg-blue-900/20 h-8 px-2"
                                title="Reset Password"
                              >
                                <Key className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteUser(user.id)}
                                disabled={actionLoading === `user-${user.id}`}
                                className="border-red-900 text-red-400 hover:bg-red-900/20 h-8 px-2"
                                title="Delete User"
                              >
                                <UserX className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {usersTotalPages > 1 && (
                <div className="flex items-center justify-between p-4 border-t border-[#1a1a1a]">
                  <p className="text-neutral-400 text-sm">Page {usersPage} of {usersTotalPages}</p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUsersPage(p => Math.max(1, p - 1))}
                      disabled={usersPage === 1}
                      className="border-[#262626] text-neutral-300"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setUsersPage(p => Math.min(usersTotalPages, p + 1))}
                      disabled={usersPage === usersTotalPages}
                      className="border-[#262626] text-neutral-300"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
