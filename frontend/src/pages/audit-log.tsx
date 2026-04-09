import { useState } from "react";
import { useAuditLogs } from "@/lib/api-extra";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollText, Loader2, ChevronLeft, ChevronRight, User, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

const ACTION_COLORS: Record<string, string> = {
  CHECKOUT: "bg-green-100 text-green-700",
  RETURN: "bg-blue-100 text-blue-700",
  CREATE: "bg-purple-100 text-purple-700",
  UPDATE: "bg-amber-100 text-amber-700",
  DELETE: "bg-red-100 text-red-700",
  RENEW: "bg-cyan-100 text-cyan-700",
  FINE: "bg-orange-100 text-orange-700",
  RESERVE: "bg-indigo-100 text-indigo-700",
};

export default function AuditLogPage() {
  const [page, setPage] = useState(0);
  const { data, isLoading } = useAuditLogs(page, 20);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-blue-600" /> Audit Log
        </h1>
        <p className="text-gray-500 text-sm mt-1">All administrative actions and system events</p>
      </div>

      <Card className="border-0 shadow-sm rounded-xl">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-48"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
          ) : data?.content && data.content.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left">
                      <th className="px-4 py-3 font-medium text-gray-600 w-12">#</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Timestamp</th>
                      <th className="px-4 py-3 font-medium text-gray-600">User</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Action</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Entity</th>
                      <th className="px-4 py-3 font-medium text-gray-600">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.content.map((log: any, i: number) => (
                      <tr key={log.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-400 text-xs">{page * 20 + i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="w-3 h-3" />
                            {log.timestamp ? new Date(log.timestamp).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-1 text-sm text-gray-700">
                            <User className="w-3 h-3 text-gray-400" />
                            {log.userId ? `User #${log.userId}` : "System"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-600"}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {log.entityType ? `${log.entityType} #${log.entityId}` : "—"}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-600 max-w-xs truncate">{log.description || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <span className="text-xs text-gray-500">{data.totalElements} total entries</span>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="rounded-lg">
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-gray-600">Page {page + 1} of {data.totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= data.totalPages - 1} onClick={() => setPage(p => p + 1)} className="rounded-lg">
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-gray-400">
              <ScrollText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>No audit log entries</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
