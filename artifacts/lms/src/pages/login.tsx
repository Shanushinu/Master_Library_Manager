import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Eye, EyeOff, Loader2 } from "lucide-react";

const DEMO_CREDENTIALS = [
  { role: "Admin", email: "admin@library.com", password: "Admin@123" },
  { role: "Librarian", email: "librarian@library.com", password: "Lib@123" },
  { role: "Faculty", email: "faculty@library.com", password: "Faculty@123" },
  { role: "College Student", email: "college@library.com", password: "Student@123" },
  { role: "School Student", email: "school@library.com", password: "Student@123" },
  { role: "General Patron", email: "patron@library.com", password: "Patron@123" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        login({
          userId: data.userId,
          email: data.email,
          name: data.name,
          role: data.role,
          token: data.token,
        });
        navigate("/");
      },
      onError: (err: any) => {
        toast({
          title: "Login failed",
          description: err?.data?.message ?? "Invalid email or password",
          variant: "destructive",
        });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { email, password } });
  };

  const fillDemo = (cred: typeof DEMO_CREDENTIALS[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left: Branding */}
        <div className="text-white space-y-6 hidden lg:block">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 rounded-xl p-3">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">LibraryMS</h1>
              <p className="text-blue-300 text-sm">Library Management System</p>
            </div>
          </div>
          <p className="text-slate-300 text-lg leading-relaxed">
            A comprehensive platform for managing books, loans, reservations, and library operations across multiple patron types.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "21 Books", sub: "Across 8 categories" },
              { label: "6 Roles", sub: "Role-based access" },
              { label: "Fine Tracking", sub: "Auto-calculated" },
              { label: "Queue System", sub: "Reservation management" },
            ].map((item) => (
              <div key={item.label} className="bg-white/10 rounded-lg p-3">
                <div className="font-semibold text-white">{item.label}</div>
                <div className="text-xs text-blue-300">{item.sub}</div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <p className="text-sm text-slate-400 font-medium">Quick login with demo accounts:</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.role}
                  onClick={() => fillDemo(cred)}
                  className="text-left text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-slate-300 transition-colors"
                >
                  <span className="block font-medium text-white">{cred.role}</span>
                  <span className="text-slate-400">{cred.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Login Form */}
        <Card className="shadow-2xl border-0 bg-white">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex items-center gap-2 lg:hidden mb-2">
              <div className="bg-blue-600 rounded-lg p-1.5">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900">LibraryMS</span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Welcome back</CardTitle>
            <CardDescription>Sign in to access the library system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@library.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</>
                ) : "Sign in"}
              </Button>
            </form>

            <div className="mt-6 lg:hidden">
              <p className="text-xs text-gray-500 mb-2 font-medium">Demo accounts:</p>
              <div className="grid grid-cols-2 gap-1.5">
                {DEMO_CREDENTIALS.map((cred) => (
                  <button
                    key={cred.role}
                    onClick={() => fillDemo(cred)}
                    className="text-left text-xs bg-gray-50 hover:bg-gray-100 border rounded px-2 py-1.5 transition-colors"
                  >
                    <span className="block font-medium text-gray-800">{cred.role}</span>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
