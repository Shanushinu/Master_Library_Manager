import { useGetMyReservations, useCancelReservation } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Loader2, X, Clock } from "lucide-react";
import { formatDate, getReservationStatusColor } from "@/lib/utils";

export default function MyReservationsPage() {
  const { data: reservations, isLoading, refetch } = useGetMyReservations();
  const { toast } = useToast();

  const cancelMutation = useCancelReservation({
    mutation: {
      onSuccess: () => {
        toast({ title: "Cancelled", description: "Reservation has been cancelled." });
        refetch();
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.data?.message ?? "Could not cancel reservation", variant: "destructive" });
      },
    },
  });

  const activeReservations = reservations?.filter(r => !["FULFILLED", "EXPIRED", "CANCELLED"].includes(r.status)) ?? [];
  const pastReservations = reservations?.filter(r => ["FULFILLED", "EXPIRED", "CANCELLED"].includes(r.status)) ?? [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Reservations</h1>
        <p className="text-gray-500 text-sm mt-1">Books you have reserved</p>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Active Reservations <span className="text-sm font-normal text-gray-500">({activeReservations.length})</span>
        </h2>
        {activeReservations.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
              <ClipboardList className="w-10 h-10 mb-3 opacity-30" />
              <p>No active reservations</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeReservations.map((res) => (
              <Card key={res.id} className={`border-0 shadow-sm ${res.status === "READY" ? "border-l-4 border-l-green-500" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900 truncate">{res.bookTitle}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getReservationStatusColor(res.status)}`}>
                          {res.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{res.bookAuthor}</p>
                      <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Reserved: {formatDate(res.createdAt)}
                        </span>
                        {res.queuePosition > 0 && (
                          <span>Queue position: #{res.queuePosition}</span>
                        )}
                        {res.expiryDate && (
                          <span className="text-amber-600">Expires: {formatDate(res.expiryDate)}</span>
                        )}
                      </div>
                      {res.status === "READY" && (
                        <div className="mt-2 text-xs text-green-700 bg-green-50 rounded px-2 py-1 inline-block">
                          ✓ Book is ready for pickup! Expires {formatDate(res.expiryDate)}
                        </div>
                      )}
                    </div>
                    {["PENDING", "READY"].includes(res.status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                        disabled={cancelMutation.isPending}
                        onClick={() => cancelMutation.mutate({ id: res.id })}
                      >
                        <X className="w-3 h-3 mr-1" /> Cancel
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {pastReservations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Past Reservations <span className="text-sm font-normal text-gray-500">({pastReservations.length})</span>
          </h2>
          <div className="space-y-2">
            {pastReservations.map((res) => (
              <Card key={res.id} className="border-0 shadow-sm opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="font-medium text-gray-700">{res.bookTitle}</span>
                      <div className="text-xs text-gray-400 mt-0.5">{formatDate(res.createdAt)}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getReservationStatusColor(res.status)}`}>
                      {res.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
