import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { BookOpen, Eye, EyeOff, Loader2, Sparkles } from "lucide-react";

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
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        login({ userId: data.userId, email: data.email, name: data.name, role: data.role, token: data.token });
        navigate("/dashboard");
      },
      onError: (err: any) => {
        toast({ title: "Login failed", description: err?.data?.message ?? "Invalid email or password", variant: "destructive" });
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast({ title: "Validation Error", description: "Please fill in all fields", variant: "destructive" }); return; }
    loginMutation.mutate({ data: { email, password } });
  };

  const fillDemo = (cred: typeof DEMO_CREDENTIALS[0]) => { setEmail(cred.email); setPassword(cred.password); };

  return (
    <div className="min-h-screen flex">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-3 shadow-lg shadow-blue-500/25">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">LibraryMS</h1>
              <p className="text-blue-300 text-sm">Library Management System</p>
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Your Complete Digital Library
          </h2>
          <p className="text-slate-300 text-base leading-relaxed mb-8">
            Manage books, loans, reservations, seat bookings, and library operations — all in one elegant platform.
          </p>
          <div className="grid grid-cols-2 gap-3 mb-8">
            {[
              { label: "Smart Catalog", sub: "Search & filter books", icon: "📚" },
              { label: "Fine Tracking", sub: "Auto-calculated ₹2/day", icon: "💰" },
              { label: "Seat Booking", sub: "Reserve reading rooms", icon: "💺" },
              { label: "Analytics", sub: "Charts & reports", icon: "📊" },
            ].map((item) => (
              <div key={item.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 hover:bg-white/10 transition-colors">
                <span className="text-xl">{item.icon}</span>
                <div className="font-semibold text-white text-sm mt-1">{item.label}</div>
                <div className="text-xs text-blue-300">{item.sub}</div>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-slate-400 font-medium flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Quick demo login:</p>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_CREDENTIALS.map((cred) => (
                <button key={cred.role} onClick={() => fillDemo(cred)}
                  className="text-left text-xs bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-slate-300 transition-all hover:border-blue-400/30">
                  <span className="block font-medium text-white">{cred.role}</span>
                  <span className="text-slate-400">{cred.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="bg-blue-600 rounded-xl p-2"><BookOpen className="w-6 h-6 text-white" /></div>
            <span className="text-2xl font-bold text-gray-900">LibraryMS</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
              <p className="text-gray-500 text-sm mt-1">Sign in to access the library system</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email address</Label>
                <Input id="email" type="email" placeholder="you@library.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required autoFocus
                  className="h-11 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-blue-500/20" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                  <button type="button" className="text-xs text-blue-600 hover:text-blue-800 font-medium">Forgot password?</button>
                </div>
                <div className="relative">
                  <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)} required
                    className="h-11 rounded-xl pr-10 border-gray-200 focus:border-blue-500" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox id="remember" checked={rememberMe} onCheckedChange={(v) => setRememberMe(!!v)} />
                <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer">Remember me</Label>
              </div>

              <Button type="submit" className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-semibold shadow-lg shadow-blue-600/25"
                disabled={loginMutation.isPending}>
                {loginMutation.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in...</> : "Sign in"}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-800 font-semibold">Create account</Link>
            </p>
          </div>

          {/* Mobile demo section */}
          <div className="mt-6 lg:hidden">
            <p className="text-xs text-gray-500 mb-2 font-medium text-center">Demo accounts:</p>
            <div className="grid grid-cols-3 gap-1.5">
              {DEMO_CREDENTIALS.slice(0, 3).map((cred) => (
                <button key={cred.role} onClick={() => fillDemo(cred)}
                  className="text-xs bg-white border rounded-lg px-2 py-1.5 text-gray-600 hover:bg-blue-50 transition-colors">
                  {cred.role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
