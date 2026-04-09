import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useRegister, useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, Eye, EyeOff, Loader2, UserPlus } from "lucide-react";

const ROLES = [
  { value: "ROLE_COLLEGE_STUDENT", label: "College Student" },
  { value: "ROLE_SCHOOL_STUDENT", label: "School Student" },
  { value: "ROLE_GENERAL_PATRON", label: "General Patron" },
] as const;

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [studentId, setStudentId] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login: authLogin } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const registerMutation = useRegister({
    mutation: {
      onSuccess: () => {
        // After registering, auto-login
        loginMutation.mutate({ data: { email, password } });
      },
      onError: (err: any) => {
        toast({ title: "Registration failed", description: err?.data?.message ?? "Could not create account", variant: "destructive" });
      },
    },
  });

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        authLogin({ userId: data.userId, email: data.email, name: data.name, role: data.role, token: data.token });
        toast({ title: "Welcome!", description: "Account created successfully" });
        navigate("/dashboard");
      },
      onError: () => {
        toast({ title: "Account created", description: "Please log in with your credentials" });
        navigate("/login");
      },
    },
  });

  const isStudentRole = role === "ROLE_COLLEGE_STUDENT" || role === "ROLE_SCHOOL_STUDENT";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !role) {
      toast({ title: "Validation Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Validation Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }
    registerMutation.mutate({
      data: { name, email, password, role: role as any, phone: phone || undefined } as any,
    });
  };

  const isLoading = registerMutation.isPending || loginMutation.isPending;

  return (
    <div className="min-h-screen flex">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-purple-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(139,92,246,0.15),transparent_50%)]" />
        <div className="relative z-10 flex flex-col justify-center px-12 py-16 text-white max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-3 shadow-lg shadow-purple-500/25">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">LibraryMS</h1>
              <p className="text-purple-300 text-sm">Library Management System</p>
            </div>
          </div>

          <h2 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            Join Our Library Community
          </h2>
          <p className="text-slate-300 text-base leading-relaxed mb-8">
            Create your account to borrow books, reserve seats, track your reading goals, and access our full digital catalog.
          </p>

          <div className="space-y-4">
            {[
              { icon: "📚", title: "Borrow Books", desc: "Access thousands of titles across all categories" },
              { icon: "💺", title: "Reserve Seats", desc: "Book your spot in reading rooms & study halls" },
              { icon: "🎯", title: "Reading Goals", desc: "Set and track your annual reading targets" },
              { icon: "⭐", title: "Reviews", desc: "Share your thoughts and discover rated books" },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <div className="font-semibold text-white text-sm">{item.title}</div>
                  <div className="text-xs text-purple-300">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="bg-indigo-600 rounded-xl p-2"><BookOpen className="w-6 h-6 text-white" /></div>
            <span className="text-2xl font-bold text-gray-900">LibraryMS</span>
          </div>

          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-indigo-600" /> Create Account
              </h2>
              <p className="text-gray-500 text-sm mt-1">Fill in your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required
                  className="h-10 rounded-xl border-gray-200" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-email" className="text-sm font-medium text-gray-700">Email *</Label>
                <Input id="reg-email" type="email" placeholder="you@example.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} required className="h-10 rounded-xl border-gray-200" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reg-password" className="text-sm font-medium text-gray-700">Password *</Label>
                <div className="relative">
                  <Input id="reg-password" type={showPassword ? "text" : "password"} placeholder="Min 6 characters"
                    value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                    className="h-10 rounded-xl pr-10 border-gray-200" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">Role *</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="h-10 rounded-xl border-gray-200">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isStudentRole && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                  <Label htmlFor="studentId" className="text-sm font-medium text-gray-700">Student ID</Label>
                  <Input id="studentId" placeholder="e.g. STU-2024-001" value={studentId}
                    onChange={(e) => setStudentId(e.target.value)} className="h-10 rounded-xl border-gray-200" />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone (optional)</Label>
                <Input id="phone" placeholder="+91 9876543210" value={phone}
                  onChange={(e) => setPhone(e.target.value)} className="h-10 rounded-xl border-gray-200" />
              </div>

              <Button type="submit" disabled={isLoading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 font-semibold shadow-lg shadow-indigo-600/25 mt-2">
                {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating account...</> : "Create Account"}
              </Button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 hover:text-indigo-800 font-semibold">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
