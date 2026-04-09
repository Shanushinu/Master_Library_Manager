import { useGetMyLoans, useRenewLoan } from "@workspace/api-client-react";
import { useMyFines, usePayFine } from "@/lib/api-extra";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { BookMarked, Loader2, RefreshCw, AlertCircle, CheckCircle, Undo2, DollarSign } from "lucide-react";
import { formatDate, formatCurrency, getLoanStatusColor, cn } from "@/lib/utils";
import { useState } from "react";

export default function MyLoansPage() {
  const { data: loans, isLoading, refetch } = useGetMyLoans();
  const { data: fines } = useMyFines();
  const payFine = usePayFine();
  const { toast } = useToast();
  const [returnDialog, setReturnDialog] = useState<number | null>(null);

  const renewMutation = useRenewLoan({
    mutation: {
      onSuccess: () => { toast({ title: "Renewed!", description: "Your loan has been renewed for 14 more days." }); refetch(); },
      onError: (err: any) => { toast({ title: "Renewal failed", description: err?.data?.message ?? "Could not renew loan", variant: "destructive" }); },
    },
  });

  const activeLoans = loans?.filter(l => l.status !== "RETURNED") ?? [];
  const returnedLoans = loans?.filter(l => l.status === "RETURNED") ?? [];
  const unpaidFines = fines?.filter(f => !f.paid) ?? [];

  if (isLoading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Loans</h1>
          <p className="text-gray-500 text-sm mt-1">Books you have borrowed</p>
        </div>
        {unpaidFines.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-sm">
            <span className="text-red-700 font-medium">
              <DollarSign className="w-3.5 h-3.5 inline -mt-0.5" /> {unpaidFines.length} unpaid fine{unpaidFines.length > 1 ? "s" : ""} — {formatCurrency(unpaidFines.reduce((s, f) => s + f.amount, 0))}
            </span>
          </div>
        )}
      </div>

      {/* Unpaid Fines */}
      {unpaidFines.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wide">Unpaid Fines</h2>
          {unpaidFines.map(fine => (
            <Card key={fine.id} className="border border-red-200 bg-red-50/50 shadow-none rounded-xl">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800">Fine: {formatCurrency(fine.amount)}</p>
                  <p className="text-xs text-red-600">{fine.reason} • {formatDate(fine.createdAt)}</p>
                </div>
                <Button size="sm" variant="destructive" className="rounded-lg" disabled={payFine.isPending}
                  onClick={() => { payFine.mutate(fine.id); toast({ title: "Fine paid!" }); }}>
                  <DollarSign className="w-3 h-3 mr-1" /> Pay
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Active Loans */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Active Loans <span className="text-sm font-normal text-gray-500">({activeLoans.length})</span>
        </h2>
        {activeLoans.length === 0 ? (
          <Card className="border-0 shadow-sm rounded-xl">
            <CardContent className="flex flex-col items-center justify-center py-12 text-gray-500">
              <BookMarked className="w-10 h-10 mb-3 opacity-30" /><p>No active loans</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeLoans.map((loan) => {
              const isOverdue = new Date(loan.dueDate) < new Date() && loan.status !== "RETURNED";
              const maxRenewals = loan.renewedCount >= 3;
              const hasUnpaidFine = unpaidFines.some(f => f.loanId === loan.id);
              return (
                <Card key={loan.id} className={cn("border-0 shadow-sm rounded-xl transition-all",
                  isOverdue && "border-l-4 border-l-red-500 bg-red-50/30")}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900 truncate">{loan.bookTitle}</h3>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getLoanStatusColor(isOverdue ? "OVERDUE" : loan.status)}`}>
                            {isOverdue ? "OVERDUE" : loan.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{loan.bookAuthor}</p>
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
                          <span>Checked out: {formatDate(loan.checkoutDate)}</span>
                          <span className={isOverdue ? "text-red-600 font-medium" : ""}>Due: {formatDate(loan.dueDate)}</span>
                          {loan.renewedCount > 0 && <span>Renewed {loan.renewedCount}x</span>}
                        </div>
                        {isOverdue && (
                          <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                            <AlertCircle className="w-3 h-3" /> Overdue. Fine: ₹2/day
                          </div>
                        )}
                        {loan.fineAmount > 0 && (
                          <div className="mt-2 text-xs">
                            <span className="text-red-600 font-medium">Fine: {formatCurrency(loan.fineAmount)}</span>
                            {loan.finePaid && <span className="ml-2 text-green-600">✓ Paid</span>}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" className="rounded-lg"
                          disabled={renewMutation.isPending || maxRenewals || hasUnpaidFine}
                          onClick={() => renewMutation.mutate({ id: loan.id })}
                          title={maxRenewals ? "Max 3 renewals reached" : hasUnpaidFine ? "Pay fine first" : "Renew loan"}>
                          <RefreshCw className="w-3 h-3 mr-1" /> Renew
                        </Button>
                        <Button size="sm" variant="outline" className="rounded-lg text-orange-600 border-orange-200 hover:bg-orange-50"
                          onClick={() => setReturnDialog(loan.id)}>
                          <Undo2 className="w-3 h-3 mr-1" /> Return
                        </Button>
                      </div>
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
              <Card key={loan.id} className="border-0 shadow-sm opacity-70 rounded-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span className="font-medium text-gray-700 truncate">{loan.bookTitle}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-400 mt-1 ml-6">
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

      {/* Return Confirmation Dialog */}
      <Dialog open={returnDialog !== null} onOpenChange={() => setReturnDialog(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Confirm Return</DialogTitle>
            <DialogDescription>Are you sure you want to return this book? Please bring it to the library circulation desk.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setReturnDialog(null)} className="rounded-xl">Cancel</Button>
            <Button className="rounded-xl bg-orange-600 hover:bg-orange-700" onClick={() => {
              toast({ title: "Return initiated", description: "Please bring the book to the circulation desk." });
              setReturnDialog(null);
            }}>Confirm Return</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
