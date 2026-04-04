import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { AppLayout } from "@/components/layout";
import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import BooksPage from "@/pages/books";
import MyLoansPage from "@/pages/my-loans";
import MyReservationsPage from "@/pages/my-reservations";
import ManageLoansPage from "@/pages/manage-loans";
import OverdueLoansPage from "@/pages/overdue-loans";
import ManageReservationsPage from "@/pages/manage-reservations";
import RecommendationsPage from "@/pages/recommendations";
import AdminUsersPage from "@/pages/admin-users";
import ReportsPage from "@/pages/reports";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user } = useAuth();
  const [location] = useLocation();

  if (!user) return <Redirect to="/login" />;
  if (roles && !roles.includes(user.role)) return <Redirect to="/" />;
  return <>{children}</>;
}

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Redirect to="/login" />;
  if (user.role === "ROLE_ADMIN" || user.role === "ROLE_LIBRARIAN") {
    return <Redirect to="/dashboard" />;
  }
  return <Redirect to="/books" />;
}

function AppRouter() {
  const { user } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />

      <Route path="/">
        <ProtectedRoute>
          <AppLayout><HomeRedirect /></AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/dashboard">
        <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_LIBRARIAN"]}>
          <AppLayout><DashboardPage /></AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/books">
        <ProtectedRoute>
          <AppLayout><BooksPage /></AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/loans">
        <ProtectedRoute>
          <AppLayout><MyLoansPage /></AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/reservations">
        <ProtectedRoute>
          <AppLayout><MyReservationsPage /></AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/manage-loans">
        <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_LIBRARIAN"]}>
          <AppLayout><ManageLoansPage /></AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/overdue">
        <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_LIBRARIAN"]}>
          <AppLayout><OverdueLoansPage /></AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/manage-reservations">
        <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_LIBRARIAN"]}>
          <AppLayout><ManageReservationsPage /></AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/recommendations">
        <ProtectedRoute>
          <AppLayout><RecommendationsPage /></AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/users">
        <ProtectedRoute roles={["ROLE_ADMIN"]}>
          <AppLayout><AdminUsersPage /></AppLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/reports">
        <ProtectedRoute roles={["ROLE_ADMIN", "ROLE_LIBRARIAN"]}>
          <AppLayout><ReportsPage /></AppLayout>
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRouter />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
