// Manual API hooks for new backend endpoints not in the generated client.
// Uses the same customFetch from @workspace/api-client-react.
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const API = "/api";

function authHeaders(): HeadersInit {
  try {
    const stored = localStorage.getItem("lms_auth");
    if (stored) {
      const { token } = JSON.parse(stored);
      if (token) return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    }
  } catch {}
  return { "Content-Type": "application/json" };
}

async function apiFetch<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(url, { ...opts, headers: { ...authHeaders(), ...opts.headers } });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw { status: res.status, data: err, message: err.message || res.statusText };
  }
  if (res.status === 204) return null as T;
  return res.json();
}

// ─── Notifications ───────────────────────────────────────────────
export interface NotificationItem {
  id: number; title: string; message: string; type: string; read: boolean; createdAt: string;
}

export function useMyNotifications() {
  return useQuery<NotificationItem[]>({
    queryKey: ["notifications", "my"],
    queryFn: () => apiFetch(`${API}/notifications/my`),
    refetchInterval: 30000,
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch(`${API}/notifications/${id}/read`, { method: "PUT" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch(`${API}/notifications/read-all`, { method: "PUT" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

// ─── Fines ───────────────────────────────────────────────────────
export interface FineItem {
  id: number; loanId: number; amount: number; reason: string; paid: boolean; paidAt: string | null; createdAt: string;
}

export function useMyFines() {
  return useQuery<FineItem[]>({
    queryKey: ["fines", "my"],
    queryFn: () => apiFetch(`${API}/fines/my`),
  });
}

export function usePayFine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (fineId: number) => apiFetch(`${API}/fines/${fineId}/pay`, { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["fines"] }); qc.invalidateQueries({ queryKey: ["my-loans"] }); },
  });
}

// ─── Seat Booking ────────────────────────────────────────────────
export interface ReadingRoom {
  id: number; name: string; totalSeats: number;
}

export interface SeatBookingItem {
  id: number; roomId: number; roomName: string; seatNumber: number;
  bookingDate: string; startTime: string | null; endTime: string | null; status: string;
}

export function useReadingRooms() {
  return useQuery<ReadingRoom[]>({
    queryKey: ["seats", "rooms"],
    queryFn: () => apiFetch(`${API}/seats/rooms`),
  });
}

export function useAvailableSeats(roomId: number | null, date: string | null) {
  return useQuery<number[]>({
    queryKey: ["seats", "available", roomId, date],
    queryFn: () => apiFetch(`${API}/seats/available?room=${roomId}&date=${date}`),
    enabled: !!roomId && !!date,
  });
}

export function useBookSeat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { roomId: number; seatNumber: number; bookingDate: string; startTime?: string; endTime?: string }) =>
      apiFetch(`${API}/seats/book`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["seats"] }); },
  });
}

export function useCancelSeatBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiFetch(`${API}/seats/${id}/cancel`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seats"] }),
  });
}

export function useMySeatBookings() {
  return useQuery<SeatBookingItem[]>({
    queryKey: ["seats", "my"],
    queryFn: () => apiFetch(`${API}/seats/my`),
  });
}

// ─── Book Reviews ────────────────────────────────────────────────
export interface BookReview {
  id: number; userId: number; userName: string; rating: number; comment: string; createdAt: string;
}

export function useBookReviews(bookId: number | null) {
  return useQuery<BookReview[]>({
    queryKey: ["reviews", bookId],
    queryFn: () => apiFetch(`${API}/books/${bookId}/reviews`),
    enabled: !!bookId,
  });
}

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, rating, comment }: { bookId: number; rating: number; comment: string }) =>
      apiFetch(`${API}/books/${bookId}/reviews`, { method: "POST", body: JSON.stringify({ rating, comment }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["reviews"] }),
  });
}

// ─── Reading Goals ───────────────────────────────────────────────
export interface ReadingGoal {
  id: number; year: number; targetBooks: number; completedBooks: number; status: string;
}

export function useMyGoals() {
  return useQuery<ReadingGoal[]>({
    queryKey: ["goals", "my"],
    queryFn: () => apiFetch(`${API}/goals/my`),
  });
}

export function useCreateGoal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { year: number; targetBooks: number }) =>
      apiFetch(`${API}/goals`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}

// ─── Analytics ───────────────────────────────────────────────────
export function useTopBooks(limit = 10) {
  return useQuery<any[]>({
    queryKey: ["analytics", "top-books", limit],
    queryFn: () => apiFetch(`${API}/analytics/top-books?limit=${limit}`),
  });
}

export function useActiveMembers(limit = 10) {
  return useQuery<any[]>({
    queryKey: ["analytics", "active-members", limit],
    queryFn: () => apiFetch(`${API}/analytics/active-members?limit=${limit}`),
  });
}

export function useGenreStats() {
  return useQuery<any[]>({
    queryKey: ["analytics", "genre-stats"],
    queryFn: () => apiFetch(`${API}/analytics/genre-stats`),
  });
}

export function useMonthlyLoans(year?: number) {
  const y = year || new Date().getFullYear();
  return useQuery<any[]>({
    queryKey: ["analytics", "monthly-loans", y],
    queryFn: () => apiFetch(`${API}/analytics/monthly-loans?year=${y}`),
  });
}

// ─── Report Exports ──────────────────────────────────────────────
export async function downloadReport(type: string, format: "csv" | "pdf", params?: Record<string, string>) {
  const qs = new URLSearchParams({ format, ...params }).toString();
  const res = await fetch(`${API}/reports/${type}?${qs}`, { headers: authHeaders() });
  if (!res.ok) throw new Error("Report download failed");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${type}_report.${format}`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Audit Logs ──────────────────────────────────────────────────
export function useAuditLogs(page = 0, size = 20) {
  return useQuery<{ content: any[]; totalPages: number; totalElements: number }>({
    queryKey: ["audit-logs", page, size],
    queryFn: () => apiFetch(`${API}/audit?page=${page}&size=${size}`),
  });
}

// ─── Book Copies ─────────────────────────────────────────────────
export interface BookCopy {
  id: number; bookId: number; copyNumber: number; barcode: string;
  condition: string; shelfLocation: string; rackNumber: string; available: boolean;
}

export function useBookCopies(bookId: number | null) {
  return useQuery<BookCopy[]>({
    queryKey: ["book-copies", bookId],
    queryFn: () => apiFetch(`${API}/books/${bookId}/copies`),
    enabled: !!bookId,
  });
}
