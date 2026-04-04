import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn, getRoleLabel } from "@/lib/utils";
import {
  BookOpen, LayoutDashboard, Library, BookMarked,
  ClipboardList, Users, BarChart2, LogOut,
  Menu, X, Star, AlertCircle, BookPlus, ChevronRight
} from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["ROLE_ADMIN", "ROLE_LIBRARIAN"] },
  { label: "Book Catalog", path: "/books", icon: Library },
  { label: "My Loans", path: "/loans", icon: BookMarked, roles: ["ROLE_COLLEGE_STUDENT", "ROLE_SCHOOL_STUDENT", "ROLE_FACULTY", "ROLE_GENERAL_PATRON"] },
  { label: "My Reservations", path: "/reservations", icon: ClipboardList, roles: ["ROLE_COLLEGE_STUDENT", "ROLE_SCHOOL_STUDENT", "ROLE_FACULTY", "ROLE_GENERAL_PATRON"] },
  { label: "Manage Loans", path: "/manage-loans", icon: BookPlus, roles: ["ROLE_ADMIN", "ROLE_LIBRARIAN"] },
  { label: "Overdue Loans", path: "/overdue", icon: AlertCircle, roles: ["ROLE_ADMIN", "ROLE_LIBRARIAN"] },
  { label: "All Reservations", path: "/manage-reservations", icon: ClipboardList, roles: ["ROLE_ADMIN", "ROLE_LIBRARIAN"] },
  { label: "Recommendations", path: "/recommendations", icon: Star },
  { label: "User Management", path: "/admin/users", icon: Users, roles: ["ROLE_ADMIN"] },
  { label: "Reports", path: "/reports", icon: BarChart2, roles: ["ROLE_ADMIN", "ROLE_LIBRARIAN"] },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const visibleItems = NAV_ITEMS.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-700">
        <div className="bg-blue-500 rounded-lg p-1.5 flex-shrink-0">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-white text-sm">LibraryMS</div>
          <div className="text-xs text-slate-400 truncate">Library Management System</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path}>
              <a
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0" />}
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
            {user?.name?.[0] ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-white truncate">{user?.name}</div>
            <div className="text-xs text-slate-400 truncate">{getRoleLabel(user?.role ?? "")}</div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={logout}
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-slate-900 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 flex flex-col bg-slate-900 shadow-2xl">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded p-1">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">LibraryMS</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
