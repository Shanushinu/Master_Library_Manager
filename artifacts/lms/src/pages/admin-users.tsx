import { useState } from "react";
import { useGetAllUsers, useChangeUserRole } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Users, Shield } from "lucide-react";
import { getRoleLabel, getRoleBadgeColor, formatDate } from "@/lib/utils";

const ROLES = [
  "ROLE_ADMIN", "ROLE_LIBRARIAN", "ROLE_FACULTY",
  "ROLE_COLLEGE_STUDENT", "ROLE_SCHOOL_STUDENT", "ROLE_GENERAL_PATRON"
];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const { data: users, isLoading, refetch } = useGetAllUsers();
  const { toast } = useToast();

  const changeRoleMutation = useChangeUserRole({
    mutation: {
      onSuccess: () => {
        toast({ title: "Role updated", description: "User role has been changed." });
        refetch();
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.data?.message ?? "Could not update role", variant: "destructive" });
      },
    },
  });

  const filtered = users?.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  }) ?? [];

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" />
          User Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">{users?.length ?? 0} total users</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="border rounded-md px-3 py-2 text-sm bg-white"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
        </select>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-4 py-3 font-medium text-gray-600">User</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Role</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Details</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Joined</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Change Role</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {user.name[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-400">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getRoleBadgeColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {user.collegeName && <div>🎓 {user.collegeName}</div>}
                      {user.schoolGrade && <div>📚 Grade: {user.schoolGrade}</div>}
                      {user.phone && <div>📞 {user.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      <select
                        className="border rounded px-2 py-1 text-xs bg-white"
                        value={user.role}
                        onChange={(e) => {
                          if (e.target.value !== user.role) {
                            changeRoleMutation.mutate({ id: user.id, data: { role: e.target.value as any } });
                          }
                        }}
                        disabled={changeRoleMutation.isPending}
                      >
                        {ROLES.map(r => <option key={r} value={r}>{getRoleLabel(r)}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-8 text-gray-500">No users found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
