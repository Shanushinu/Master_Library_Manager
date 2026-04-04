import { useState } from "react";
import { useGetMyRecommendations, useCreateRecommendation, useGetPendingRecommendations } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, Plus, X } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function RecommendationsPage() {
  const { user, isStaff, isFaculty } = useAuth();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [reason, setReason] = useState("");

  const canRecommend = isStaff || isFaculty;

  const { data: myRecs, refetch: refetchMy } = useGetMyRecommendations();
  const { data: pendingRecs, refetch: refetchPending } = useGetPendingRecommendations();

  const createMutation = useCreateRecommendation({
    mutation: {
      onSuccess: () => {
        toast({ title: "Recommended!", description: "Your recommendation has been submitted." });
        setTitle(""); setAuthor(""); setIsbn(""); setReason(""); setShowForm(false);
        refetchMy(); if (isStaff) refetchPending();
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.data?.message ?? "Could not submit recommendation", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ data: { title, author, isbn: isbn || undefined, reason: reason || undefined } });
  };

  const statusColor = (status: string) => {
    if (status === "PENDING") return "bg-yellow-100 text-yellow-700";
    if (status === "APPROVED") return "bg-green-100 text-green-700";
    if (status === "REJECTED") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500" />
            Book Recommendations
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {canRecommend ? "Suggest books for the library collection" : "View recommended books"}
          </p>
        </div>
        {canRecommend && (
          <Button onClick={() => setShowForm(!showForm)} className="bg-blue-600 hover:bg-blue-700">
            {showForm ? <><X className="w-4 h-4 mr-1" />Cancel</> : <><Plus className="w-4 h-4 mr-1" />Recommend a Book</>}
          </Button>
        )}
      </div>

      {showForm && canRecommend && (
        <Card className="border-0 shadow-sm border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Book Recommendation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Book Title *</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" required />
                </div>
                <div className="space-y-2">
                  <Label>Author *</Label>
                  <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" required />
                </div>
                <div className="space-y-2">
                  <Label>ISBN (optional)</Label>
                  <Input value={isbn} onChange={(e) => setIsbn(e.target.value)} placeholder="978-..." />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Reason for recommendation</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Why should the library add this book?"
                  rows={3}
                />
              </div>
              <Button type="submit" disabled={createMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Submit Recommendation
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {isStaff && pendingRecs && pendingRecs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Pending Review <span className="text-sm font-normal text-gray-500">({pendingRecs.length})</span>
          </h2>
          <div className="space-y-3">
            {pendingRecs.map((rec: any) => (
              <Card key={rec.id} className="border-0 shadow-sm border-l-4 border-l-yellow-400">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{rec.title}</div>
                      <div className="text-sm text-gray-500">by {rec.author}</div>
                      {rec.isbn && <div className="text-xs text-gray-400 mt-0.5">ISBN: {rec.isbn}</div>}
                      {rec.reason && <p className="text-sm text-gray-600 mt-2 italic">"{rec.reason}"</p>}
                      <div className="text-xs text-gray-400 mt-2">Recommended by {rec.userName} on {formatDate(rec.createdAt)}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${statusColor(rec.status)}`}>{rec.status}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {myRecs && myRecs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            My Recommendations <span className="text-sm font-normal text-gray-500">({myRecs.length})</span>
          </h2>
          <div className="space-y-2">
            {myRecs.map((rec: any) => (
              <Card key={rec.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="font-medium text-gray-900">{rec.title}</span>
                      <span className="text-gray-500 text-sm ml-2">by {rec.author}</span>
                      <div className="text-xs text-gray-400 mt-0.5">{formatDate(rec.createdAt)}</div>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor(rec.status)}`}>{rec.status}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {(!myRecs || myRecs.length === 0) && (!pendingRecs || pendingRecs.length === 0) && (
        <Card className="border-0 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Star className="w-12 h-12 mb-3 opacity-20" />
            <p>No recommendations yet</p>
            {canRecommend && <p className="text-sm mt-1">Click "Recommend a Book" to suggest a title</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
