import { useState } from "react";
import { useGetAllUsers, useSearchBooks, useCheckoutBook, useReturnBook, useGetAllLoans } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, BookPlus, RotateCcw, X } from "lucide-react";
import { formatDate, getLoanStatusColor } from "@/lib/utils";

export default function ManageLoansPage() {
  const [tab, setTab] = useState<"checkout" | "list">("list");
  const [bookSearch, setBookSearch] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [page, setPage] = useState(0);
  const { toast } = useToast();

  const { data: users } = useGetAllUsers();
  const { data: booksData } = useSearchBooks(
    { q: bookSearch || undefined, size: 10 }
  );
  const { data: loansData, isLoading, refetch } = useGetAllLoans({ page, size: 15 });

  const checkoutMutation = useCheckoutBook({
    mutation: {
      onSuccess: () => {
        toast({ title: "Checked out!", description: "Book has been checked out successfully." });
        setSelectedBookId(""); setSelectedUserId(""); setBookSearch("");
        refetch(); setTab("list");
      },
      onError: (err: any) => {
        toast({ title: "Checkout failed", description: err?.data?.message ?? "Could not check out book", variant: "destructive" });
      },
    },
  });

  const returnMutation = useReturnBook({
    mutation: {
      onSuccess: (data) => {
        const msg = data.fineAmount > 0 ? `Fine: $${data.fineAmount.toFixed(2)}` : "No fine";
        toast({ title: "Returned!", description: `Book returned. ${msg}` });
        refetch();
      },
      onError: (err: any) => {
        toast({ title: "Return failed", description: err?.data?.message ?? "Could not return book", variant: "destructive" });
      },
    },
  });

  const handleCheckout = () => {
    if (!selectedBookId || !selectedUserId) {
      toast({ title: "Missing fields", description: "Please select both a book and a user", variant: "destructive" });
      return;
    }
    checkoutMutation.mutate({ data: { bookId: Number(selectedBookId), userId: Number(selectedUserId) } });
  };

  const activeLoans = loansData?.content.filter(l => l.status !== "RETURNED") ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Loans</h1>
          <p className="text-gray-500 text-sm mt-1">Checkout and return books</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={tab === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("list")}
          >All Loans</Button>
          <Button
            variant={tab === "checkout" ? "default" : "outline"}
            size="sm"
            onClick={() => setTab("checkout")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <BookPlus className="w-4 h-4 mr-1" /> New Checkout
          </Button>
        </div>
      </div>

      {tab === "checkout" && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Book Checkout</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Select User</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                >
                  <option value="">-- Choose a patron --</option>
                  {users?.filter(u => !["ROLE_ADMIN", "ROLE_LIBRARIAN"].includes(u.role)).map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Search Book</Label>
                <Input
                  placeholder="Search by title or author..."
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                />
              </div>
            </div>

            {bookSearch && booksData && (
              <div className="border rounded-lg overflow-hidden">
                {booksData.content.slice(0, 8).map((book) => (
                  <div
                    key={book.id}
                    onClick={() => { setSelectedBookId(String(book.id)); setBookSearch(book.title); }}
                    className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 border-b last:border-0 transition-colors ${selectedBookId === String(book.id) ? "bg-blue-50" : ""}`}
                  >
                    <div>
                      <div className="font-medium text-sm text-gray-900">{book.title}</div>
                      <div className="text-xs text-gray-500">{book.author} • {book.mainCategoryDisplay}</div>
                    </div>
                    <span className={`text-xs font-medium ${book.availableCopies > 0 ? "text-green-600" : "text-red-500"}`}>
                      {book.availableCopies > 0 ? `${book.availableCopies} avail.` : "Unavailable"}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={handleCheckout}
              disabled={checkoutMutation.isPending || !selectedBookId || !selectedUserId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {checkoutMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Confirm Checkout
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loans Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Active Loans ({activeLoans.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left">
                    <th className="px-4 py-3 font-medium text-gray-600">Book</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Patron</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Checked Out</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Due Date</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeLoans.map((loan) => {
                    const isOverdue = new Date(loan.dueDate) < new Date();
                    return (
                      <tr key={loan.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 max-w-[200px] truncate">{loan.bookTitle}</div>
                          <div className="text-xs text-gray-400">{loan.bookAuthor}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-700">{loan.userName}</td>
                        <td className="px-4 py-3 text-gray-500">{formatDate(loan.checkoutDate)}</td>
                        <td className={`px-4 py-3 ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                          {formatDate(loan.dueDate)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${getLoanStatusColor(isOverdue ? "OVERDUE" : loan.status)}`}>
                            {isOverdue ? "OVERDUE" : loan.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="outline"
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
              {activeLoans.length === 0 && (
                <div className="text-center py-8 text-gray-500">No active loans</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {loansData && loansData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="text-sm text-gray-600">Page {page + 1} of {loansData.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= loansData.totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
