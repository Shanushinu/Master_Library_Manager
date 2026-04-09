import { useState } from "react";
import { useGetDashboard, useGetOverdueReport } from "@workspace/api-client-react";
import { downloadReport } from "@/lib/api-extra";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart2, Loader2, Download, FileText, FileSpreadsheet, Calendar } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

const REPORT_TYPES = [
  { value: "loans", label: "Loan Report" },
  { value: "overdue", label: "Overdue Report" },
  { value: "fines", label: "Fine Report" },
  { value: "members", label: "Member Report" },
];

export default function ReportsPage() {
  const { toast } = useToast();
  const { data: stats, isLoading } = useGetDashboard();
  const { data: overdue } = useGetOverdueReport();
  const [reportType, setReportType] = useState("loans");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: "csv" | "pdf") => {
    setExporting(true);
    try {
      const params: Record<string, string> = {};
      if (fromDate) params.from = fromDate;
      if (toDate) params.to = toDate;
      await downloadReport(reportType, format, params);
      toast({ title: "Report downloaded!", description: `${reportType} report exported as ${format.toUpperCase()}` });
    } catch {
      toast({ title: "Export failed", description: "Could not generate report", variant: "destructive" });
    }
    setExporting(false);
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  const maxLoans = Math.max(1, ...((stats?.categoryStats ?? []).map((s: any) => Number(s.loans))));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart2 className="w-6 h-6 text-blue-600" /> Reports
        </h1>
        <p className="text-gray-500 text-sm mt-1">Generate and export library reports</p>
      </div>

      {/* Report Builder */}
      <Card className="border-0 shadow-sm rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Generate Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500 uppercase">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger className="w-48 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {REPORT_TYPES.map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500 uppercase">From</Label>
              <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="w-40 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-gray-500 uppercase">To</Label>
              <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="w-40 rounded-xl" />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleExport("csv")} disabled={exporting} variant="outline" className="rounded-xl">
                <FileSpreadsheet className="w-4 h-4 mr-1" /> CSV
              </Button>
              <Button onClick={() => handleExport("pdf")} disabled={exporting}
                className="rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700">
                <FileText className="w-4 h-4 mr-1" /> PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Books", value: stats?.totalBooks ?? 0, color: "text-blue-600" },
          { label: "Active Loans", value: stats?.activeLoans ?? 0, color: "text-green-600" },
          { label: "Overdue Loans", value: stats?.overdueLoans ?? 0, color: "text-red-600" },
          { label: "Pending Reservations", value: stats?.pendingReservations ?? 0, color: "text-yellow-600" },
        ].map((s) => (
          <Card key={s.label} className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-4 text-center">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Category Circulation */}
      <Card className="border-0 shadow-sm rounded-xl">
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
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                      style={{ width: `${(Number(stat.loans) / maxLoans) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 text-sm text-center py-8">No circulation data yet</p>}
        </CardContent>
      </Card>

      {/* Overdue Report */}
      {overdue && overdue.length > 0 && (
        <Card className="border-0 shadow-sm rounded-xl">
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
                        <td className="px-4 py-3"><div className="font-medium text-gray-900 truncate max-w-[200px]">{loan.bookTitle}</div></td>
                        <td className="px-4 py-3 text-gray-700">{loan.userName}</td>
                        <td className="px-4 py-3 text-red-600">{formatDate(loan.dueDate)}</td>
                        <td className="px-4 py-3 text-red-600 font-medium">{formatCurrency(days * 2)}</td>
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
