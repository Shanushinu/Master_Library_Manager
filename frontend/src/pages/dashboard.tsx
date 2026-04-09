import { useGetDashboard } from "@workspace/api-client-react";
import { useMyNotifications, useMyFines, useMyGoals, useMonthlyLoans, useGenreStats } from "@/lib/api-extra";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Library, Users, BookMarked, AlertCircle, BookOpen, Loader2, DollarSign, Target, TrendingUp, Plus, BookPlus, CalendarPlus } from "lucide-react";
import { formatDate, formatCurrency, getCategoryIcon } from "@/lib/utils";
import { Link } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const CHART_COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1"];

export default function DashboardPage() {
  const { isStaff, isAdmin, user } = useAuth();
  const { data: dashData, isLoading } = useGetDashboard();
  const { data: notifications } = useMyNotifications();
  const { data: fines } = useMyFines();
  const { data: goals } = useMyGoals();
  const { data: monthlyData } = useMonthlyLoans();
  const { data: genreData } = useGenreStats();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  const currentGoal = goals?.[0];
  const unpaidFines = fines?.filter((f) => !f.paid) ?? [];
  const totalUnpaidFines = unpaidFines.reduce((sum, f) => sum + f.amount, 0);

  // Admin/Staff stats
  const adminStats = [
    { label: "Total Books", value: dashData?.totalBooks ?? 0, icon: Library, color: "text-blue-600", bg: "bg-blue-50", gradient: "from-blue-500 to-blue-600" },
    { label: "Active Loans", value: dashData?.activeLoans ?? 0, icon: BookMarked, color: "text-emerald-600", bg: "bg-emerald-50", gradient: "from-emerald-500 to-emerald-600" },
    { label: "Overdue Books", value: dashData?.overdueLoans ?? 0, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50", gradient: "from-red-500 to-red-600" },
    { label: "Members", value: dashData?.totalUsers ?? 0, icon: Users, color: "text-purple-600", bg: "bg-purple-50", gradient: "from-purple-500 to-purple-600" },
  ];

  // Member stats
  const memberStats = [
    { label: "Active Loans", value: dashData?.activeLoans ?? 0, icon: BookMarked, color: "text-blue-600", bg: "bg-blue-50", gradient: "from-blue-500 to-blue-600" },
    { label: "Books Due Soon", value: dashData?.overdueLoans ?? 0, icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50", gradient: "from-amber-500 to-amber-600" },
    { label: "Unpaid Fines", value: `₹${totalUnpaidFines.toFixed(0)}`, icon: DollarSign, color: "text-red-600", bg: "bg-red-50", gradient: "from-red-500 to-red-600" },
    { label: "Reading Goal", value: currentGoal ? `${currentGoal.completedBooks}/${currentGoal.targetBooks}` : "—", icon: Target, color: "text-emerald-600", bg: "bg-emerald-50", gradient: "from-emerald-500 to-emerald-600" },
  ];

  const stats = isStaff ? adminStats : memberStats;

  // Monthly loan chart data
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = monthlyData?.map((m: any, i: number) => ({
    month: monthNames[m.month ? m.month - 1 : i] || monthNames[i],
    loans: m.count || m.loans || 0,
  })) ?? monthNames.map(m => ({ month: m, loans: 0 }));

  // Genre pie chart data
  const pieData = (genreData ?? dashData?.categoryStats ?? []).map((g: any, i: number) => ({
    name: g.category || g.genre || g.categoryKey || `Genre ${i + 1}`,
    value: Number(g.loans || g.count || g.value || 0),
  })).filter((d: any) => d.value > 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isStaff ? "Dashboard" : `Welcome, ${user?.name?.split(" ")[0] ?? "User"}`}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {isStaff ? "Library overview and analytics" : "Your library activity at a glance"}
          </p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <CardContent className="p-5 relative">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br opacity-5 rounded-bl-3xl" style={{backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`}} />
                <div className={`inline-flex p-2.5 rounded-xl ${s.bg} mb-3`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className={`text-2xl font-bold text-gray-900`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5 font-medium">{s.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      {isStaff && (
        <div className="flex gap-3 flex-wrap">
          <Link href="/manage-loans">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-600/20 rounded-xl">
              <BookPlus className="w-4 h-4 mr-2" /> Issue Book
            </Button>
          </Link>
          <Link href="/books">
            <Button variant="outline" className="rounded-xl border-gray-200"><Plus className="w-4 h-4 mr-2" /> Add Book</Button>
          </Link>
          <Link href="/seat-booking">
            <Button variant="outline" className="rounded-xl border-gray-200"><CalendarPlus className="w-4 h-4 mr-2" /> Seat Booking</Button>
          </Link>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Loan Trend */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" /> Monthly Loan Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                  <Line type="monotone" dataKey="loans" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: "#3b82f6" }}
                    activeDot={{ r: 6, fill: "#3b82f6", stroke: "#fff", strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Genre Distribution Pie */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Top Genres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={85} paddingAngle={3}
                      dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={false} fontSize={11}>
                      {pieData.map((_: any, i: number) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">No genre data yet</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {dashData?.recentActivity && dashData.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {dashData.recentActivity.slice(0, 5).map((act: any) => (
                <div key={act.id} className="flex items-start gap-3">
                  <div className={`mt-1 flex-shrink-0 w-2.5 h-2.5 rounded-full ${
                    act.action === "CHECKOUT" ? "bg-green-500" : act.action === "RETURN" ? "bg-blue-500" : "bg-gray-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{act.description}</p>
                    <p className="text-xs text-gray-400">{formatDate(act.timestamp)}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${
                    act.action === "CHECKOUT" ? "bg-green-100 text-green-700" :
                    act.action === "RETURN" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                  }`}>{act.action}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
