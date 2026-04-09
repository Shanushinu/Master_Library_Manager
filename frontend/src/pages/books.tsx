import { useState, useEffect, useCallback } from "react";
import { useSearchBooks, useGetCategories, usePlaceReservation, useCreateBook, BookResponse as BookResp } from "@workspace/api-client-react";
import { useBookReviews, useCreateReview, useBookCopies } from "@/lib/api-extra";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, BookOpen, X, Loader2, MapPin, Tag, Star, Grid3X3, List, Plus, Filter, ChevronDown } from "lucide-react";
import { cn, getCategoryIcon } from "@/lib/utils";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => { const t = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(t); }, [value, delay]);
  return debounced;
}

export default function BooksPage() {
  const { isStaff } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [page, setPage] = useState(0);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedBook, setSelectedBook] = useState<BookResp | null>(null);
  const [showAddBook, setShowAddBook] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [availOnly, setAvailOnly] = useState(false);

  const { data: categoriesData } = useGetCategories();
  const { data: booksData, isLoading } = useSearchBooks(
    { q: debouncedSearch || undefined, category: selectedCategory || undefined, page, size: 20 },
  );

  const reserveMutation = usePlaceReservation({
    mutation: {
      onSuccess: () => { toast({ title: "Reserved!", description: "Your reservation has been placed." }); setSelectedBook(null); },
      onError: (err: any) => { toast({ title: "Reservation failed", description: err?.data?.message ?? "Could not place reservation", variant: "destructive" }); },
    },
  });

  const categories = categoriesData?.categories ?? [];
  let filteredBooks = booksData?.content ?? [];
  if (availOnly) filteredBooks = filteredBooks.filter(b => b.availableCopies > 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Book Catalog</h1>
          <p className="text-gray-500 text-sm mt-1">Browse and search our collection</p>
        </div>
        <div className="flex items-center gap-2">
          {booksData && <span className="text-sm text-gray-500">{booksData.totalElements} books</span>}
          {isStaff && (
            <Button onClick={() => setShowAddBook(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-600/20">
              <Plus className="w-4 h-4 mr-1" /> Add Book
            </Button>
          )}
        </div>
      </div>

      {/* Search & View Toggle */}
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Search by title, author, or ISBN..." value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="pl-9 h-11 rounded-xl border-gray-200" />
        </div>
        <Button variant="outline" size="icon" className={cn("rounded-xl", showFilters && "bg-blue-50 border-blue-200")}
          onClick={() => setShowFilters(!showFilters)}>
          <Filter className="w-4 h-4" />
        </Button>
        <div className="flex rounded-xl border border-gray-200 overflow-hidden">
          <button className={cn("p-2.5 transition-colors", viewMode === "grid" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50")}
            onClick={() => setViewMode("grid")}><Grid3X3 className="w-4 h-4" /></button>
          <button className={cn("p-2.5 transition-colors", viewMode === "list" ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50")}
            onClick={() => setViewMode("list")}><List className="w-4 h-4" /></button>
        </div>
        {(search || selectedCategory) && (
          <Button variant="outline" onClick={() => { setSearch(""); setSelectedCategory(""); setPage(0); }} className="rounded-xl">
            <X className="w-4 h-4 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-gray-500 uppercase">Categories:</span>
            <button onClick={() => { setSelectedCategory(""); setPage(0); }}
              className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                !selectedCategory ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300")}>
              All
            </button>
            {categories.map((cat) => (
              <button key={cat.main} onClick={() => { setSelectedCategory(cat.main); setPage(0); }}
                className={cn("px-3 py-1 rounded-full text-xs font-medium transition-colors border",
                  selectedCategory === cat.main ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300")}>
                {getCategoryIcon(cat.main)} {cat.displayName}
              </button>
            ))}
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={availOnly} onChange={(e) => setAvailOnly(e.target.checked)} className="rounded" />
            Available only
          </label>
        </div>
      )}

      {/* Books Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>
      ) : (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} isStaff={isStaff} onClick={() => setSelectedBook(book)} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Title</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 hidden md:table-cell">Author</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Category</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Available</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Action</th>
                </tr></thead>
                <tbody>
                  {filteredBooks.map((book) => (
                    <tr key={book.id} className="border-b last:border-0 hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedBook(book)}>
                      <td className="px-4 py-3 font-medium text-gray-900">{book.title}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{book.author}</td>
                      <td className="px-4 py-3"><span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{getCategoryIcon(book.mainCategory)} {book.subCategory}</span></td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", book.availableCopies > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                          {book.availableCopies}/{book.totalCopies}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="outline" className="rounded-lg text-xs" onClick={(e) => { e.stopPropagation(); setSelectedBook(book); }}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {booksData && booksData.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="rounded-xl">Previous</Button>
              <span className="text-sm text-gray-600">Page {page + 1} of {booksData.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= booksData.totalPages - 1} onClick={() => setPage(p => p + 1)} className="rounded-xl">Next</Button>
            </div>
          )}

          {filteredBooks.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No books found</p>
              <p className="text-sm">Try adjusting your search or filter</p>
            </div>
          )}
        </>
      )}

      {/* Book Detail Modal */}
      {selectedBook && (
        <BookDetailModal book={selectedBook} isStaff={isStaff}
          onClose={() => setSelectedBook(null)}
          onReserve={() => reserveMutation.mutate({ data: { bookId: selectedBook.id } })}
          reserving={reserveMutation.isPending} />
      )}

      {/* Add Book Modal */}
      {showAddBook && <AddBookModal onClose={() => setShowAddBook(false)} />}
    </div>
  );
}

function BookCard({ book, isStaff, onClick }: { book: BookResp; isStaff: boolean; onClick: () => void }) {
  const isAvailable = book.availableCopies > 0;
  return (
    <Card className="border-0 shadow-sm hover:shadow-lg transition-all cursor-pointer group rounded-xl" onClick={onClick}>
      <CardContent className="p-4 space-y-3">
        <div className="w-full h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center mb-2 group-hover:from-blue-50 group-hover:to-indigo-50 transition-colors">
          <BookOpen className="w-10 h-10 text-slate-300 group-hover:text-blue-400 transition-colors" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate group-hover:text-blue-600 transition-colors">{book.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{book.author}</p>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
            <Tag className="w-2.5 h-2.5" />{book.subCategory}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
            {isAvailable ? `${book.availableCopies} available` : "Unavailable"}
          </span>
          <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BookDetailModal({ book, isStaff, onClose, onReserve, reserving }: {
  book: BookResp; isStaff: boolean; onClose: () => void; onReserve: () => void; reserving: boolean;
}) {
  const { data: reviews } = useBookReviews(book.id);
  const { data: copies } = useBookCopies(book.id);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const createReview = useCreateReview();
  const { toast } = useToast();

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{book.title}</DialogTitle>
          <p className="text-gray-500">{book.author}</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Details Grid */}
          <div className="bg-gray-50 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Category</span><br/><span className="font-medium">{getCategoryIcon(book.mainCategory)} {book.mainCategoryDisplay}</span></div>
            <div><span className="text-gray-500">Subcategory</span><br/><span className="font-medium">{book.subCategory}</span></div>
            <div><span className="text-gray-500">Available</span><br/>
              <span className={cn("font-semibold", book.availableCopies > 0 ? "text-green-600" : "text-red-600")}>
                {book.availableCopies} / {book.totalCopies}
              </span>
            </div>
            {book.locationShelf && <div><span className="text-gray-500">Location</span><br/><span className="font-medium flex items-center gap-1"><MapPin className="w-3 h-3" />{book.locationShelf}</span></div>}
            {book.isbn && <div><span className="text-gray-500">ISBN</span><br/><span className="font-medium">{book.isbn}</span></div>}
            {book.language && <div><span className="text-gray-500">Language</span><br/><span className="font-medium">{book.language}</span></div>}
          </div>

          {book.description && <p className="text-sm text-gray-600">{book.description}</p>}

          {/* Copies */}
          {copies && copies.length > 0 && (
            <div>
              <h4 className="font-semibold text-sm text-gray-700 mb-2">Copies ({copies.length})</h4>
              <div className="space-y-1">
                {copies.map(c => (
                  <div key={c.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
                    <span className="font-mono">{c.barcode}</span>
                    <span className={cn("px-2 py-0.5 rounded-full", c.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                      {c.available ? "Available" : "Issued"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h4 className="font-semibold text-sm text-gray-700 mb-2">Reviews</h4>
            {reviews && reviews.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {reviews.map(r => (
                  <div key={r.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{r.userName}</span>
                      <div className="flex">{Array.from({ length: r.rating }).map((_, i) => <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />)}</div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{r.comment}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-gray-400">No reviews yet</p>}

            {/* Add Review */}
            {!isStaff && (
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Rating:</Label>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <button key={i} onClick={() => setNewRating(i)}>
                        <Star className={cn("w-4 h-4 transition-colors", i <= newRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300")} />
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Write a review..." value={newComment} onChange={(e) => setNewComment(e.target.value)} className="text-sm h-9 rounded-lg" />
                  <Button size="sm" className="rounded-lg" disabled={createReview.isPending || !newComment}
                    onClick={() => { createReview.mutate({ bookId: book.id, rating: newRating, comment: newComment }); setNewComment(""); toast({ title: "Review submitted!" }); }}>
                    Post
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">Close</Button>
            {!isStaff && (
              <Button className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl" disabled={reserving} onClick={onReserve}>
                {reserving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Reserve Book"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddBookModal({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [isbn, setIsbn] = useState("");
  const [category, setCategory] = useState("FICTION");
  const [subCategory, setSubCategory] = useState("");
  const [totalCopies, setTotalCopies] = useState(1);
  const [description, setDescription] = useState("");
  const [isbnLoading, setIsbnLoading] = useState(false);

  const createBook = useCreateBook({
    mutation: {
      onSuccess: () => { toast({ title: "Book added!" }); onClose(); },
      onError: (err: any) => { toast({ title: "Failed", description: err?.data?.message ?? "Error adding book", variant: "destructive" }); },
    },
  });

  // ISBN Auto-fill from Open Library
  const lookupIsbn = async () => {
    if (!isbn) return;
    setIsbnLoading(true);
    try {
      const res = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`);
      const data = await res.json();
      const book = data[`ISBN:${isbn}`];
      if (book) {
        setTitle(book.title || "");
        setAuthor(book.authors?.map((a: any) => a.name).join(", ") || "");
        toast({ title: "ISBN Found!", description: `Auto-filled: ${book.title}` });
      } else {
        toast({ title: "Not found", description: "No book found for this ISBN", variant: "destructive" });
      }
    } catch { toast({ title: "Lookup failed", variant: "destructive" }); }
    setIsbnLoading(false);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Add New Book</DialogTitle></DialogHeader>
        <form onSubmit={(e) => { e.preventDefault(); createBook.mutate({ data: { title, author, isbn: isbn || undefined, mainCategory: category as any, subCategory: subCategory || "General", totalCopies, description: description || undefined } }); }} className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 space-y-1"><Label className="text-xs">ISBN</Label><Input value={isbn} onChange={(e) => setIsbn(e.target.value)} placeholder="978-..." className="h-9 rounded-lg" /></div>
            <Button type="button" variant="outline" className="mt-5 rounded-lg" onClick={lookupIsbn} disabled={isbnLoading}>
              {isbnLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lookup"}
            </Button>
          </div>
          <div className="space-y-1"><Label className="text-xs">Title *</Label><Input value={title} onChange={(e) => setTitle(e.target.value)} required className="h-9 rounded-lg" /></div>
          <div className="space-y-1"><Label className="text-xs">Author *</Label><Input value={author} onChange={(e) => setAuthor(e.target.value)} required className="h-9 rounded-lg" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1"><Label className="text-xs">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="h-9 rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["FICTION", "NON_FICTION", "COMPETITIVE_EXAM", "COLLEGE", "SCHOOL", "COMIC", "HISTORY", "OTHER"].map(c => (
                    <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label className="text-xs">Subcategory</Label><Input value={subCategory} onChange={(e) => setSubCategory(e.target.value)} placeholder="e.g. Science" className="h-9 rounded-lg" /></div>
          </div>
          <div className="space-y-1"><Label className="text-xs">Total Copies</Label><Input type="number" min={1} value={totalCopies} onChange={(e) => setTotalCopies(Number(e.target.value))} className="h-9 rounded-lg" /></div>
          <div className="space-y-1"><Label className="text-xs">Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="rounded-lg" rows={2} /></div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">Cancel</Button>
            <Button type="submit" className="flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600" disabled={createBook.isPending}>
              {createBook.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add Book"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
