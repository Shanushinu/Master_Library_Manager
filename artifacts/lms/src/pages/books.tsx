import { useState } from "react";
import { useSearchBooks, useGetCategories, usePlaceReservation } from "@workspace/api-client-react";
import { BookResponse } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, BookOpen, Filter, X, Loader2, MapPin, Globe, Tag, Star } from "lucide-react";
import { cn, getCategoryIcon } from "@/lib/utils";

export default function BooksPage() {
  const { user, isStaff } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(0);
  const [selectedBook, setSelectedBook] = useState<BookResponse | null>(null);

  const { data: categoriesData } = useGetCategories();
  const { data: booksData, isLoading } = useSearchBooks(
    { q: search || undefined, category: selectedCategory || undefined, page, size: 20 },
  );

  const reserveMutation = usePlaceReservation({
    mutation: {
      onSuccess: () => {
        toast({ title: "Reserved!", description: "Your reservation has been placed.", });
        setSelectedBook(null);
      },
      onError: (err: any) => {
        toast({ title: "Reservation failed", description: err?.data?.message ?? "Could not place reservation", variant: "destructive" });
      },
    },
  });

  const categories = categoriesData?.categories ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Catalog</h1>
          <p className="text-gray-500 text-sm mt-1">Browse and search our collection</p>
        </div>
        {booksData && (
          <span className="text-sm text-gray-500">{booksData.totalElements} books found</span>
        )}
      </div>

      {/* Search Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by title, author, or ISBN..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9"
          />
        </div>
        {(search || selectedCategory) && (
          <Button variant="outline" onClick={() => { setSearch(""); setSelectedCategory(""); setPage(0); }}>
            <X className="w-4 h-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Category Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => { setSelectedCategory(""); setPage(0); }}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
            !selectedCategory ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
          )}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.main}
            onClick={() => { setSelectedCategory(cat.main); setPage(0); }}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
              selectedCategory === cat.main ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"
            )}
          >
            {getCategoryIcon(cat.main)} {cat.displayName}
          </button>
        ))}
      </div>

      {/* Books Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {booksData?.content.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                isStaff={isStaff}
                onReserve={() => setSelectedBook(book)}
              />
            ))}
          </div>

          {booksData && booksData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button
                variant="outline" size="sm"
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
              >Previous</Button>
              <span className="text-sm text-gray-600">Page {page + 1} of {booksData.totalPages}</span>
              <Button
                variant="outline" size="sm"
                disabled={page >= booksData.totalPages - 1}
                onClick={() => setPage(p => p + 1)}
              >Next</Button>
            </div>
          )}

          {booksData?.content.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No books found</p>
              <p className="text-sm">Try adjusting your search or filter</p>
            </div>
          )}
        </>
      )}

      {/* Reserve Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{selectedBook.title}</h3>
                <p className="text-gray-500 text-sm">{selectedBook.author}</p>
              </div>
              <button onClick={() => setSelectedBook(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1.5">
              <div className="flex justify-between"><span className="text-gray-500">Category</span><span>{selectedBook.mainCategoryDisplay}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Subcategory</span><span>{selectedBook.subCategory}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Available Copies</span>
                <span className={selectedBook.availableCopies > 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                  {selectedBook.availableCopies} / {selectedBook.totalCopies}
                </span>
              </div>
              {selectedBook.locationShelf && (
                <div className="flex justify-between"><span className="text-gray-500">Shelf</span><span>{selectedBook.locationShelf}</span></div>
              )}
            </div>
            {selectedBook.description && (
              <p className="text-sm text-gray-600">{selectedBook.description}</p>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setSelectedBook(null)} className="flex-1">Cancel</Button>
              <Button
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={reserveMutation.isPending}
                onClick={() => reserveMutation.mutate({ data: { bookId: selectedBook.id } })}
              >
                {reserveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reserve Book"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookCard({ book, isStaff, onReserve }: { book: BookResponse; isStaff: boolean; onReserve: () => void }) {
  const isAvailable = book.availableCopies > 0;
  return (
    <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate group-hover:text-blue-600 transition-colors">
              {book.title}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">{book.author}</p>
          </div>
          <span className="text-lg flex-shrink-0">{getCategoryIcon(book.mainCategory)}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            <Tag className="w-2.5 h-2.5" />{book.subCategory}
          </span>
          {book.referenceOnly && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Ref Only</span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className={cn("text-xs font-medium px-2 py-0.5 rounded-full", isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
            {isAvailable ? `${book.availableCopies} available` : "Unavailable"}
          </div>
          {book.locationShelf && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />{book.locationShelf}
            </span>
          )}
        </div>

        {!isStaff && (
          <Button
            size="sm"
            variant={isAvailable ? "default" : "outline"}
            className={cn("w-full text-xs", isAvailable ? "bg-blue-600 hover:bg-blue-700" : "")}
            onClick={onReserve}
          >
            {isAvailable ? "Reserve" : "Join Waitlist"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
