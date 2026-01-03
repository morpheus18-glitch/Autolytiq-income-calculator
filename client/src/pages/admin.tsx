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
  Lock
} from "lucide-react";

interface Lead {
  id: number;
  email: string;
  name: string | null;
  income_range: string | null;
  source: string;
  created_at: string;
  updated_at: string;
}

interface LeadsResponse {
  leads: Lead[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminKey, setAdminKey] = useState("");
  const [error, setError] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

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
    fetchLeads();
    fetchStats();
  }, [isAuthenticated, page]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/leads?page=${page}&limit=20&search=${searchTerm}`, {
        headers: { "x-admin-key": adminKey }
      });
      if (res.ok) {
        const data: LeadsResponse = await res.json();
        setLeads(data.leads);
        setTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error("Failed to fetch leads:", e);
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

  const exportCSV = async () => {
    try {
      const res = await fetch(`/api/admin/leads/export`, {
        headers: { "x-admin-key": adminKey }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error("Failed to export:", e);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLeads();
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Lead Dashboard</h1>
            <p className="text-neutral-400 mt-1">Manage your newsletter subscribers</p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button
              onClick={exportCSV}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export CSV
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Total Leads</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <Users className="w-8 h-8 text-emerald-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">Today</p>
                  <p className="text-2xl font-bold text-white">{stats.today}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">This Week</p>
                  <p className="text-2xl font-bold text-white">{stats.thisWeek}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-[#0f0f0f] border-[#1a1a1a]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">This Month</p>
                  <p className="text-2xl font-bold text-white">{stats.thisMonth}</p>
                </div>
                <Mail className="w-8 h-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <Input
                placeholder="Search by email or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0f0f0f] border-[#262626] text-white"
              />
            </div>
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Search
            </Button>
          </div>
        </form>

        {/* Leads Table */}
        <Card className="bg-[#0f0f0f] border-[#1a1a1a] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#171717]">
                <tr>
                  <th className="text-left p-4 text-neutral-400 font-medium text-sm">Email</th>
                  <th className="text-left p-4 text-neutral-400 font-medium text-sm">Name</th>
                  <th className="text-left p-4 text-neutral-400 font-medium text-sm">Income Range</th>
                  <th className="text-left p-4 text-neutral-400 font-medium text-sm">Source</th>
                  <th className="text-left p-4 text-neutral-400 font-medium text-sm">Subscribed</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-neutral-500">
                      Loading...
                    </td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-neutral-500">
                      No leads found
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-[#1a1a1a] hover:bg-[#171717]">
                      <td className="p-4 text-white">{lead.email}</td>
                      <td className="p-4 text-neutral-300">{lead.name || "-"}</td>
                      <td className="p-4">
                        {lead.income_range ? (
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-sm">
                            {lead.income_range}
                          </span>
                        ) : "-"}
                      </td>
                      <td className="p-4 text-neutral-400 text-sm">{lead.source}</td>
                      <td className="p-4 text-neutral-400 text-sm">
                        {new Date(lead.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-[#1a1a1a]">
              <p className="text-neutral-400 text-sm">
                Page {page} of {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-[#262626] text-neutral-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-[#262626] text-neutral-300"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
