import { useGetMyLoans, useRenewLoan } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookMarked, Loader2, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { formatDate, formatCurrency, getLoanStatusColor } from "@/lib/utils";

export default function MyLoansPage() {
  const { data: loans, isLoading, refetch } = useGetMyLoans();
  const { toast } = useToast();

  const renewMutation = useRenewLoan({
    mutation: {
      onSuccess: () => {
        toast({ title: "Renewed!", description: "Your loan has been renewed." });
        refetch();
      },
      onError: (err: any) => {
        toast({ title: "Renewal failed", description: err?.data?.message ?? "Could not renew loan", variant: "destructive" });
      },
    },
  });

  const activeLoans = loans?.filter(l => l.status !== "RETURNED") ?? [];
  const returnedLoans = loans?.filter(l => l.status === "RETURNED") ?? [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Loans</h1>
        <p className="text-gray-500 text-sm mt-1">Books you have borrowed</p>
      </div>

      {/* Active Loans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Active Loans <span className="text-sm font-normal text-gray-500">({activeLoans.length})</span>
        </h2>
        {activeLoans.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
              <BookMarked className="w-10 h-10 mb-3 opacity-30" />
              <p>No active loans</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeLoans.map((loan) => {
              const isOverdue = new Date(loan.dueDate) < new Date() && loan.status !== "RETURNED";
              return (
                <Card key={loan.id} className={`border-0 shadow-sm ${isOverdue ? "border-l-4 border-l-red-500" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 truncate">{loan.bookTitle}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getLoanStatusColor(isOverdue ? "OVERDUE" : loan.status)}`}>
                            {isOverdue ? "OVERDUE" : loan.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{loan.bookAuthor}</p>
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                          <span>Checked out: {formatDate(loan.checkoutDate)}</span>
                          <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                            Due: {formatDate(loan.dueDate)}
                          </span>
                          {loan.renewedCount > 0 && (
                            <span>Renewed {loan.renewedCount}x</span>
                          )}
                        </div>
                        {isOverdue && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                            <AlertCircle className="w-3 h-3" />
                            This book is overdue. Fine: $0.50/day (max $50)
                          </div>
                        )}
                        {loan.fineAmount > 0 && (
                          <div className="mt-2 text-xs">
                            <span className="text-red-600 font-medium">Fine: {formatCurrency(loan.fineAmount)}</span>
                            {loan.finePaid && <span className="ml-2 text-green-600">✓ Paid</span>}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={renewMutation.isPending}
                        onClick={() => renewMutation.mutate({ id: loan.id })}
                        className="flex-shrink-0"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Renew
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Loan History */}
      {returnedLoans.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Loan History <span className="text-sm font-normal text-gray-500">({returnedLoans.length})</span>
          </h2>
          <div className="space-y-2">
            {returnedLoans.map((loan) => (
              <Card key={loan.id} className="border-0 shadow-sm opacity-70">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="font-medium text-gray-700 truncate">{loan.bookTitle}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-400 mt-1">
                        <span>Out: {formatDate(loan.checkoutDate)}</span>
                        <span>Returned: {formatDate(loan.returnedDate)}</span>
                        {loan.fineAmount > 0 && <span>Fine: {formatCurrency(loan.fineAmount)}</span>}
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${getLoanStatusColor(loan.status)}`}>
                      {loan.status}
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
