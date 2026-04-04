import { useGetAllReservations } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Loader2 } from "lucide-react";
import { formatDate, getReservationStatusColor } from "@/lib/utils";

export default function ManageReservationsPage() {
  const { data: reservations, isLoading } = useGetAllReservations();

  const active = reservations?.filter(r => ["PENDING", "READY"].includes(r.status)) ?? [];
  const past = reservations?.filter(r => !["PENDING", "READY"].includes(r.status)) ?? [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Reservations</h1>
        <p className="text-gray-500 text-sm mt-1">{active.length} active, {past.length} past</p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Active Reservations ({active.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">Book</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Patron</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Queue #</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Reserved On</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Expires</th>
                </tr>
              </thead>
              <tbody>
                {active.map((res) => (
                  <tr key={res.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900 max-w-[200px] truncate">{res.bookTitle}</div>
                      <div className="text-xs text-gray-400">{res.bookAuthor}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{res.userName}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getReservationStatusColor(res.status)}`}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm font-semibold text-gray-700">#{res.queuePosition}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(res.createdAt)}</td>
                    <td className="px-4 py-3 text-gray-500">{res.expiryDate ? formatDate(res.expiryDate) : "-"}</td>
                  </tr>
                ))}
                {active.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-gray-500">No active reservations</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
