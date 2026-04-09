import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { useMyGoals, useCreateGoal, useMyFines } from "@/lib/api-extra";
import { useGetMyLoans } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UserCircle, Edit3, BookOpen, Target, Award, TrendingUp, Loader2, Download, CreditCard, Mail, Phone, Calendar } from "lucide-react";
import { getRoleLabel, getRoleBadgeColor, formatDate, cn } from "@/lib/utils";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: goals } = useMyGoals();
  const { data: loans } = useGetMyLoans();
  const { data: fines } = useMyFines();
  const createGoal = useCreateGoal();
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalTarget, setGoalTarget] = useState(12);
  const [showIdCard, setShowIdCard] = useState(false);

  const currentGoal = goals?.[0];
  const totalBooksRead = loans?.filter(l => l.status === "RETURNED").length ?? 0;
  const activeLoans = loans?.filter(l => l.status !== "RETURNED").length ?? 0;
  const goalProgress = currentGoal ? Math.round((currentGoal.completedBooks / currentGoal.targetBooks) * 100) : 0;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Profile Header Card */}
      <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
        <CardContent className="p-6 -mt-12">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-blue-500/30 border-4 border-white">
              {user?.name?.[0] ?? "?"}
            </div>
            <div className="flex-1 pb-1">
              <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("text-xs px-2.5 py-0.5 rounded-full font-medium", getRoleBadgeColor(user?.role ?? ""))}>
                  {getRoleLabel(user?.role ?? "")}
                </span>
                <span className="text-xs text-gray-400">Member since 2024</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="rounded-xl"><Edit3 className="w-3 h-3 mr-1" /> Edit</Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4 text-gray-400" /> {user?.email}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CreditCard className="w-4 h-4 text-gray-400" /> ID: {user?.userId}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Books Read", value: totalBooksRead, icon: BookOpen, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "Active Loans", value: activeLoans, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Reading Streak", value: `${totalBooksRead > 0 ? Math.min(totalBooksRead, 7) : 0} days`, icon: Award, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Goal Progress", value: currentGoal ? `${goalProgress}%` : "—", icon: Target, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(s => (
          <Card key={s.label} className="border-0 shadow-sm rounded-xl">
            <CardContent className="p-4">
              <div className={cn("inline-flex p-2 rounded-xl mb-2", s.bg)}>
                <s.icon className={cn("w-4 h-4", s.color)} />
              </div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reading Goal Widget */}
      <Card className="border-0 shadow-sm rounded-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><Target className="w-4 h-4 text-purple-600" /> Reading Goal {new Date().getFullYear()}</CardTitle>
            {!currentGoal && <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setShowGoalModal(true)}>Set Goal</Button>}
          </div>
        </CardHeader>
        <CardContent>
          {currentGoal ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">{currentGoal.completedBooks} of {currentGoal.targetBooks} books</span>
                <span className="font-bold text-purple-600">{goalProgress}%</span>
              </div>
              <Progress value={goalProgress} className="h-3 rounded-full" />
              <p className="text-xs text-gray-400">
                {currentGoal.targetBooks - currentGoal.completedBooks > 0
                  ? `${currentGoal.targetBooks - currentGoal.completedBooks} books to go!`
                  : "🎉 Goal completed!"}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-4 text-center">No reading goal set for this year. Click "Set Goal" to get started!</p>
          )}
        </CardContent>
      </Card>

      {/* Digital Library ID Card */}
      <Card className="border-0 shadow-sm rounded-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4 text-blue-600" /> Digital Library Card</CardTitle>
            <Button size="sm" variant="outline" className="rounded-lg" onClick={() => setShowIdCard(true)}>
              <Download className="w-3 h-3 mr-1" /> View Card
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 rounded-2xl p-6 text-white max-w-sm shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5" />
              <span className="font-bold text-sm">LibraryMS</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-xl font-bold">
                {user?.name?.[0]}
              </div>
              <div>
                <div className="font-semibold">{user?.name}</div>
                <div className="text-xs text-blue-300">{getRoleLabel(user?.role ?? "")}</div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-blue-200">
              <span>ID: LMS-{String(user?.userId).padStart(5, "0")}</span>
              <span>Valid: Dec 2026</span>
            </div>
            <div className="mt-3 bg-white/10 rounded-lg p-2 text-center font-mono text-xs tracking-[0.2em]">
              {`||||  ||||| |||| ||||| ||||`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Set Goal Modal */}
      <Dialog open={showGoalModal} onOpenChange={setShowGoalModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Set Reading Goal for {new Date().getFullYear()}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Label>Books to read this year</Label>
            <Input type="number" min={1} max={365} value={goalTarget} onChange={(e) => setGoalTarget(Number(e.target.value))} className="rounded-xl" />
            <p className="text-xs text-gray-500">That's about {Math.ceil(goalTarget / 12)} books per month</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGoalModal(false)} className="rounded-xl">Cancel</Button>
            <Button className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600"
              disabled={createGoal.isPending}
              onClick={() => {
                createGoal.mutate({ year: new Date().getFullYear(), targetBooks: goalTarget });
                setShowGoalModal(false);
                toast({ title: "Goal set!", description: `Target: ${goalTarget} books this year` });
              }}>
              {createGoal.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Set Goal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
