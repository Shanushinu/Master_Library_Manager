import { useGetDashboard, useGetOverdueReport } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, Loader2 } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function ReportsPage() {
  const { data: stats, isLoading } = useGetDashboard();
  const { data: overdue } = useGetOverdueReport();

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  const maxLoans = Math.max(1, ...((stats?.categoryStats ?? []).map((s: any) => Number(s.loans))));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-blue-600" />
          Reports & Analytics
        </h1>
        <p className="text-gray-500 text-sm mt-1">Library usage statistics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Books", value: stats?.totalBooks ?? 0, color: "text-blue-600" },
          { label: "Active Loans", value: stats?.activeLoans ?? 0, color: "text-green-600" },
          { label: "Overdue Loans", value: stats?.overdueLoans ?? 0, color: "text-red-600" },
          { label: "Pending Reservations", value: stats?.pendingReservations ?? 0, color: "text-yellow-600" },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Circulation */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Circulation by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.categoryStats && stats.categoryStats.length > 0 ? (
            <div className="space-y-4">
              {stats.categoryStats.map((stat: any) => (
                <div key={stat.categoryKey} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{stat.category}</span>
                    <span className="text-gray-500">{stat.loans} loans</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all"
                      style={{ width: `${(Number(stat.loans) / maxLoans) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm text-center py-8">No circulation data yet</p>
          )}
        </CardContent>
      </Card>

      {/* Overdue Report */}
      {overdue && overdue.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-red-600">Overdue Report ({overdue.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-red-50 text-left">
                    <th className="px-4 py-3 font-medium text-gray-600">Book</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Patron</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Due Date</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Est. Fine</th>
                  </tr>
                </thead>
                <tbody>
                  {overdue.map((loan) => {
                    const days = Math.max(0, Math.floor((new Date().getTime() - new Date(loan.dueDate).getTime()) / 86400000));
                    return (
                      <tr key={loan.id} className="border-b last:border-0">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 truncate max-w-[200px]">{loan.bookTitle}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{loan.userName}</td>
                        <td className="px-4 py-3 text-red-600">{formatDate(loan.dueDate)}</td>
                        <td className="px-4 py-3 text-red-600 font-medium">{formatCurrency(Math.min(50, days * 0.5))}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
