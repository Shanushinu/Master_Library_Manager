import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric"
  });
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function getRoleLabel(role: string): string {
  const map: Record<string, string> = {
    ROLE_ADMIN: "Admin",
    ROLE_LIBRARIAN: "Librarian",
    ROLE_FACULTY: "Faculty",
    ROLE_COLLEGE_STUDENT: "College Student",
    ROLE_SCHOOL_STUDENT: "School Student",
    ROLE_GENERAL_PATRON: "General Patron",
  };
  return map[role] ?? role;
}

export function getRoleBadgeColor(role: string): string {
  const map: Record<string, string> = {
    ROLE_ADMIN: "bg-red-100 text-red-800",
    ROLE_LIBRARIAN: "bg-purple-100 text-purple-800",
    ROLE_FACULTY: "bg-blue-100 text-blue-800",
    ROLE_COLLEGE_STUDENT: "bg-green-100 text-green-800",
    ROLE_SCHOOL_STUDENT: "bg-yellow-100 text-yellow-800",
    ROLE_GENERAL_PATRON: "bg-gray-100 text-gray-800",
  };
  return map[role] ?? "bg-gray-100 text-gray-800";
}

export function getLoanStatusColor(status: string): string {
  const map: Record<string, string> = {
    ACTIVE: "bg-green-100 text-green-800",
    RETURNED: "bg-gray-100 text-gray-600",
    OVERDUE: "bg-red-100 text-red-800",
    RENEWED: "bg-blue-100 text-blue-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
}

export function getReservationStatusColor(status: string): string {
  const map: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-800",
    READY: "bg-green-100 text-green-800",
    FULFILLED: "bg-gray-100 text-gray-600",
    EXPIRED: "bg-red-100 text-red-800",
    CANCELLED: "bg-gray-100 text-gray-500",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
}

export function getCategoryIcon(cat: string): string {
  const map: Record<string, string> = {
    COMPETITIVE_EXAM: "🎯",
    COLLEGE: "🎓",
    SCHOOL: "📚",
    COMIC: "🦸",
    HISTORY: "🏛️",
    NON_FICTION: "💡",
    FICTION: "📖",
    OTHER: "📰",
  };
  return map[cat] ?? "📖";
}
