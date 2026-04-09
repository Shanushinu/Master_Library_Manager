import { useState } from "react";
import { useTopBooks, useActiveMembers, useGenreStats, useMonthlyLoans } from "@/lib/api-extra";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Activity, Loader2, TrendingUp, BookOpen, Users, PieChart as PieIcon } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1", "#14b8a6", "#f97316"];

export default function AnalyticsPage() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data: topBooks, isLoading: booksLoading } = useTopBooks(10);
  const { data: activeMembers } = useActiveMembers(10);
  const { data: genreStats, isLoading: genreLoading } = useGenreStats();
  const { data: monthlyLoans, isLoading: monthlyLoading } = useMonthlyLoans(year);

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const areaData = monthlyLoans?.map((m: any, i: number) => ({
    month: monthNames[m.month ? m.month - 1 : i] || monthNames[i],
    loans: m.count || m.loans || 0,
  })) ?? monthNames.map(m => ({ month: m, loans: 0 }));

  const barData = (topBooks ?? []).map((b: any) => ({
    name: b.title?.length > 20 ? b.title.slice(0, 20) + "…" : b.title,
    loans: b.loanCount || b.count || 0,
  }));

  const donutData = (genreStats ?? []).map((g: any) => ({
    name: g.genre || g.category || g.categoryKey,
    value: Number(g.count || g.loans || g.value || 0),
  })).filter((d: any) => d.value > 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-600" /> Analytics
          </h1>
          <p className="text-gray-500 text-sm mt-1">Library usage insights and trends</p>
        </div>
        <Select value={year.toString()} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-28 rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[2024, 2025, 2026].map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Loan Trends (Area Chart) */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-600" /> Monthly Loan Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {monthlyLoading ? <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaData}>
                    <defs>
                      <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                    <Area type="monotone" dataKey="loans" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorLoans)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Genre Distribution (Donut) */}
        <Card className="border-0 shadow-sm rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2"><PieIcon className="w-4 h-4 text-purple-600" /> Genre Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              {genreLoading ? <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin" /></div> : donutData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donutData} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                      {donutData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data</div>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Borrowed Books (Bar Chart) */}
      <Card className="border-0 shadow-sm rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><BookOpen className="w-4 h-4 text-emerald-600" /> Most Borrowed Books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            {booksLoading ? <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin" /></div> : barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} stroke="#94a3b8" width={150} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none" }} />
                  <Bar dataKey="loans" fill="#10b981" radius={[0, 6, 6, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-full text-gray-400 text-sm">No data</div>}
          </div>
        </CardContent>
      </Card>

      {/* Top Active Members (Table) */}
      <Card className="border-0 shadow-sm rounded-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Users className="w-4 h-4 text-amber-600" /> Top Active Members</CardTitle>
        </CardHeader>
        <CardContent>
          {activeMembers && activeMembers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">#</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Member</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Role</th>
                  <th className="px-4 py-3 font-medium text-gray-600 text-right">Loans</th>
                </tr></thead>
                <tbody>
                  {activeMembers.map((m: any, i: number) => (
                    <tr key={m.userId || i} className="border-b last:border-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-400">{i + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{m.userName || m.name}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{m.role || "—"}</td>
                      <td className="px-4 py-3 text-right font-semibold text-blue-600">{m.loanCount || m.count || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <p className="text-center py-8 text-gray-400 text-sm">No member data</p>}
        </CardContent>
      </Card>
    </div>
  );
}
