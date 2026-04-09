import { Link, useLocation, Redirect } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { 
  BookOpen, 
  Library, 
  Armchair, 
  BarChart2, 
  ChevronRight, 
  Github,
  Star,
  Users,
  ShieldCheck,
  Zap
} from "lucide-react";

export default function LandingPage() {
  const { user } = useAuth();
  
  if (user) {
    return <Redirect to="/home" />;
  }
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 rounded-lg p-1.5 shadow-lg shadow-blue-600/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              LibraryMS
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-blue-600 transition-colors">How it works</a>
            <a href="#stats" className="hover:text-blue-600 transition-colors">Stats</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-600 hover:text-blue-600 hover:bg-blue-50">
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all active:scale-95">
                Join Now
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 transition-all rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-[120px] opacity-60" />
        </div>

        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-6 border border-blue-100 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Star className="w-3 h-3 fill-current" />
            <span>MODERN LIBRARY MANAGEMENT</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700">
            The next generation of <span className="text-blue-600">Library Management</span>
          </h1>
          
          <p className="text-lg lg:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-1000">
            Streamline your cataloging, manage loans with ease, and provide your members with a premium digital experience. Everything you need to run a modern library.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
            <Link href="/register">
              <Button size="lg" className="h-14 px-8 text-lg font-semibold bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/30 rounded-2xl group transition-all">
                Get Started Free
                <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-2xl transition-all">
                View Demo
              </Button>
            </Link>
          </div>

          <div className="mt-20 relative max-w-5xl mx-auto animate-in fade-in zoom-in duration-1000 delay-300">
             <div className="bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl relative">
                <div className="aspect-[16/9] bg-slate-800 rounded-[1.5rem] overflow-hidden border border-slate-700/50 flex items-center justify-center">
                   <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-slate-700/50 flex items-center justify-center">
                        <Zap className="w-8 h-8 text-blue-400" />
                      </div>
                      <span className="text-slate-400 font-medium">Dashboard Preview Placeholder</span>
                   </div>
                </div>
                {/* Decorative floating elements */}
                <div className="absolute -right-12 top-10 w-24 h-24 bg-blue-500/20 rounded-3xl blur-2xl -z-10" />
                <div className="absolute -left-12 bottom-10 w-24 h-24 bg-indigo-500/20 rounded-3xl blur-2xl -z-10" />
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-50/50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base font-bold text-blue-600 tracking-wider uppercase mb-3">Powerful Features</h2>
            <p className="text-4xl font-bold text-slate-900 tracking-tight">Everything you need to succeed</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { 
                icon: Library, 
                title: "Smart Catalog", 
                desc: "Intelligent book search and filtering with real-time availability tracking.",
                color: "bg-blue-50 text-blue-600"
              },
              { 
                icon: Armchair, 
                title: "Seat Reservation", 
                desc: "Let members book reading desks and study rooms directly from the app.",
                color: "bg-indigo-50 text-indigo-600"
              },
              { 
                icon: BarChart2, 
                title: "Deep Analytics", 
                desc: "Comprehensive charts and reports on borrowing trends and user engagement.",
                color: "bg-amber-50 text-amber-600"
              },
              { 
                icon: ShieldCheck, 
                title: "Role-Based Access", 
                desc: "Secure permissions for Admins, Librarians, Faculty, and Students.",
                color: "bg-emerald-50 text-emerald-600"
              },
              { 
                icon: Users, 
                title: "Member Portal", 
                desc: "Personal dashboards for members to track their loans and reservations.",
                color: "bg-purple-50 text-purple-600"
              },
              { 
                icon: Github, 
                title: "Open Source", 
                desc: "Built with modern technologies including React, Spring Boot, and MySQL.",
                color: "bg-slate-950 text-white"
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm ${feature.color}`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-24 bg-blue-600 text-white rounded-[3rem] mx-4 lg:mx-10 my-10 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {[
              { label: "Active Libraries", value: "250+" },
              { label: "Daily Transactions", value: "10K+" },
              { label: "Registered Users", value: "50K+" },
              { label: "Book Titles", value: "1M+" }
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-4xl lg:text-5xl font-black mb-2">{stat.value}</div>
                <div className="text-blue-100 text-sm font-medium uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-12 bg-white">
        <div className="container mx-auto px-4 border-t border-slate-100 pt-16">
          <div className="grid lg:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-blue-600 rounded-lg p-1.5">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight">LibraryMS</span>
              </div>
              <p className="text-slate-500 max-w-xs mb-8">
                Empowering libraries across the globe with state-of-the-art management tools and premium digital experiences.
              </p>
              <div className="flex items-center gap-4">
                 {/* Social placeholders */}
                 <div className="w-8 h-8 rounded-full bg-slate-100 hover:bg-blue-50 transition-colors flex items-center justify-center cursor-pointer">
                    <Github className="w-4 h-4 text-slate-600" />
                 </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-slate-900 mb-6">Product</h4>
              <ul className="space-y-4 text-slate-500 text-sm">
                <li><a href="#features" className="hover:text-blue-600 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Case Studies</a></li>
                <li><a href="#" className="hover:text-blue-600 transition-colors">Documentation</a></li>
              </ul>
            </div>

            <div>
               <h4 className="font-bold text-slate-900 mb-6">Support</h4>
               <ul className="space-y-4 text-slate-500 text-sm">
                 <li><a href="#" className="hover:text-blue-600 transition-colors">Help Center</a></li>
                 <li><a href="#" className="hover:text-blue-600 transition-colors">Contact Us</a></li>
                 <li><a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a></li>
               </ul>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between text-slate-400 text-xs font-medium border-t border-slate-50 pt-8">
            <p>© 2024 LibraryMS. All rights reserved.</p>
            <p className="flex items-center gap-4 mt-4 md:mt-0">
               <span>Cookie Policy</span>
               <span>Terms of Service</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
