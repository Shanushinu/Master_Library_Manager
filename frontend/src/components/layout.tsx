import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useMyNotifications, useMarkAllNotificationsRead } from "@/lib/api-extra";
import { Button } from "@/components/ui/button";
import { cn, getRoleLabel } from "@/lib/utils";
import {
  BookOpen, LayoutDashboard, Library, BookMarked,
  ClipboardList, Users, BarChart2, LogOut,
  Menu, X, Star, AlertCircle, BookPlus, ChevronRight,
  Bell, Armchair, UserCircle, Activity, ScrollText
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
  { label: "My Loans", path: "/loans", icon: BookMarked, roles: ["ROLE_COLLEGE_STUDENT", "ROLE_SCHOOL_STUDENT", "ROLE_FACULTY", "ROLE_GENERAL_PATRON", "ROLE_STUDENT", "ROLE_MEMBER"] },
  { label: "My Reservations", path: "/reservations", icon: ClipboardList, roles: ["ROLE_COLLEGE_STUDENT", "ROLE_SCHOOL_STUDENT", "ROLE_FACULTY", "ROLE_GENERAL_PATRON", "ROLE_STUDENT", "ROLE_MEMBER"] },
  { label: "Seat Booking", path: "/seat-booking", icon: Armchair },
  { label: "Manage Loans", path: "/manage-loans", icon: BookPlus, roles: ["ROLE_ADMIN", "ROLE_LIBRARIAN"] },
  { label: "Overdue Loans", path: "/overdue", icon: AlertCircle, roles: ["ROLE_ADMIN", "ROLE_LIBRARIAN"] },
  { label: "All Reservations", path: "/manage-reservations", icon: ClipboardList, roles: ["ROLE_ADMIN", "ROLE_LIBRARIAN"] },
  { label: "Recommendations", path: "/recommendations", icon: Star },
  { label: "Profile", path: "/profile", icon: UserCircle },
  { label: "User Management", path: "/admin/users", icon: Users, roles: ["ROLE_ADMIN"] },
  { label: "Reports", path: "/reports", icon: BarChart2, roles: ["ROLE_ADMIN", "ROLE_LIBRARIAN"] },
  { label: "Analytics", path: "/analytics", icon: Activity, roles: ["ROLE_ADMIN"] },
  { label: "Audit Log", path: "/audit-log", icon: ScrollText, roles: ["ROLE_ADMIN"] },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { data: notifications } = useMyNotifications();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = notifications?.filter((n) => !n.read).length ?? 0;

  const visibleItems = NAV_ITEMS.filter(item =>
    !item.roles || (user && item.roles.includes(user.role))
  );

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-slate-700/50">
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-1.5 flex-shrink-0 shadow-lg shadow-blue-500/20">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <div className="font-bold text-white text-sm">LibraryMS</div>
          <div className="text-xs text-slate-400 truncate">Library Management</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map((item) => {
          const isActive = location === item.path || (item.path !== "/" && location.startsWith(item.path));
          const Icon = item.icon;
          return (
            <Link key={item.path} href={item.path}>
              <a onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                )}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 ml-auto flex-shrink-0" />}
              </a>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-700/50">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg shadow-blue-500/20">
            {user?.name?.[0] ?? "?"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-white truncate">{user?.name}</div>
            <div className="text-xs text-slate-400 truncate">{getRoleLabel(user?.role ?? "")}</div>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={logout}
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-xl">
          <LogOut className="w-4 h-4 mr-2" /> Sign out
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 flex flex-col bg-slate-900 shadow-2xl">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 bg-white border-b border-gray-100 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600">
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 lg:hidden">
              <div className="bg-blue-600 rounded-lg p-1"><BookOpen className="w-4 h-4 text-white" /></div>
              <span className="font-bold text-gray-900">LibraryMS</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)}
                className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-red-500/30 animate-in zoom-in duration-200">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
                  <div className="absolute right-0 top-12 z-50 w-80 bg-white rounded-2xl shadow-2xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                      <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={() => markAllRead.mutate()}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium">Mark all read</button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications && notifications.length > 0 ? (
                        notifications.slice(0, 10).map((n) => (
                          <div key={n.id} className={cn("px-4 py-3 border-b border-gray-50 last:border-0 transition-colors",
                            !n.read ? "bg-blue-50/50" : "")}>
                            <p className="text-sm text-gray-800 font-medium">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-400 text-sm">No notifications</div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* User Avatar */}
            <Link href="/profile">
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0] ?? "?"}
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name?.split(" ")[0]}</span>
              </div>
            </Link>
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
