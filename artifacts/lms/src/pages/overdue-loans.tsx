import { useGetOverdueLoans, useReturnBook } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function OverdueLoansPage() {
  const { data: loans, isLoading, refetch } = useGetOverdueLoans();
  const { toast } = useToast();

  const returnMutation = useReturnBook({
    mutation: {
      onSuccess: (data) => {
        toast({ title: "Returned", description: `Fine applied: ${formatCurrency(data.fineAmount)}` });
        refetch();
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.data?.message ?? "Could not process return", variant: "destructive" });
      },
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <AlertCircle className="w-6 h-6 text-red-500" />
          Overdue Loans
        </h1>
        <p className="text-gray-500 text-sm mt-1">Books past their due date</p>
      </div>

      {loans?.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-500">
            <AlertCircle className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium">No overdue loans</p>
            <p className="text-sm">All books are returned on time!</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base text-red-600">
              {loans?.length} Overdue {loans?.length === 1 ? "Book" : "Books"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-red-50 text-left">
                    <th className="px-4 py-3 font-medium text-gray-600">Book</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Patron</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Due Date</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Days Overdue</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Est. Fine</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loans?.map((loan) => {
                    const daysOverdue = Math.max(0, Math.floor((new Date().getTime() - new Date(loan.dueDate).getTime()) / 86400000));
                    const estFine = Math.min(50, daysOverdue * 0.5);
                    return (
                      <tr key={loan.id} className="border-b last:border-0 hover:bg-red-50/30">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 max-w-[180px] truncate">{loan.bookTitle}</div>
                          <div className="text-xs text-gray-400">{loan.bookAuthor}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{loan.userName}</td>
                        <td className="px-4 py-3 text-red-600 font-medium">{formatDate(loan.dueDate)}</td>
                        <td className="px-4 py-3">
                          <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                            {daysOverdue} days
                          </span>
                        </td>
                        <td className="px-4 py-3 text-red-600 font-semibold">{formatCurrency(estFine)}</td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            disabled={returnMutation.isPending}
                            onClick={() => returnMutation.mutate({ id: loan.id })}
                          >
                            <RotateCcw className="w-3 h-3 mr-1" /> Return
                          </Button>
                        </td>
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
