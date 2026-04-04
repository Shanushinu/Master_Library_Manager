import { useGetDashboard } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Library, Users, BookMarked, AlertCircle, ClipboardList, BookOpen, Loader2 } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
  const { data, isLoading, isError } = useGetDashboard();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Failed to load dashboard. Please try again.
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Books", value: data.totalBooks, icon: Library, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Available Books", value: data.availableBooks, icon: BookOpen, color: "text-green-600", bg: "bg-green-50" },
    { label: "Total Users", value: data.totalUsers, icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Active Loans", value: data.activeLoans, icon: BookMarked, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Overdue Loans", value: data.overdueLoans, icon: AlertCircle, color: "text-red-600", bg: "bg-red-50" },
    { label: "Pending Reservations", value: data.pendingReservations, icon: ClipboardList, color: "text-yellow-600", bg: "bg-yellow-50" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Library overview and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className={`inline-flex p-2 rounded-lg ${s.bg} mb-3`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Stats */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Circulation by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {data.categoryStats && data.categoryStats.length > 0 ? (
              <div className="space-y-3">
                {data.categoryStats.map((stat: any) => (
                  <div key={stat.categoryKey} className="flex items-center gap-3">
                    <div className="text-base w-6">{getCategoryIcon(stat.categoryKey)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-gray-700 font-medium truncate">{stat.category}</span>
                        <span className="text-sm font-semibold text-gray-900 ml-2">{stat.loans}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${Math.min(100, (Number(stat.loans) / Math.max(1, ...data.categoryStats.map((s: any) => Number(s.loans)))) * 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-8">No circulation data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentActivity && data.recentActivity.length > 0 ? (
              <div className="space-y-3">
                {data.recentActivity.slice(0, 8).map((act: any) => (
                  <div key={act.id} className="flex items-start gap-3">
                    <div className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${
                      act.action === "CHECKOUT" ? "bg-green-500" :
                      act.action === "RETURN" ? "bg-blue-500" :
                      "bg-gray-400"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{act.description}</p>
                      <p className="text-xs text-gray-400">{formatDate(act.timestamp)}</p>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 ${
                      act.action === "CHECKOUT" ? "bg-green-100 text-green-700" :
                      act.action === "RETURN" ? "bg-blue-100 text-blue-700" :
                      "bg-gray-100 text-gray-600"
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
    </div>
  );
}

function getCategoryIcon(cat: string): string {
  const map: Record<string, string> = {
    COMPETITIVE_EXAM: "🎯", COLLEGE: "🎓", SCHOOL: "📚",
    COMIC: "🦸", HISTORY: "🏛️", NON_FICTION: "💡", FICTION: "📖", OTHER: "📰",
  };
  return map[cat] ?? "📖";
}
