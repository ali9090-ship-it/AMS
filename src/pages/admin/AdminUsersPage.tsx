import { useState } from "react";
import { Search, UserPlus, Edit, Trash2, X, Eye, EyeOff, Upload } from "lucide-react";
import { PageTransition, AnimatedCard } from "@/components/animations";
import { motion, AnimatePresence } from "framer-motion";
import { validateEmail, detectRole, type UserRole } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

type RegisteredUser = { id: number; name: string; email: string; role: string; branch: string; status: string; };

const BRANCHES = ["CSE", "IT", "AIML", "DS", "EXTC", "MECH", "CIVIL", "ALL"];

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editUser, setEditUser] = useState<RegisteredUser | null>(null);
  const [csvRows, setCsvRows] = useState<any[]>([]);
  const [csvError, setCsvError] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: users = [] } = useQuery({ queryKey: ['users'], queryFn: () => apiFetch('/api/users') });

  // Form state
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" as UserRole, branch: "CSE", roll_no: "", status: "Pending" as "Active" | "Inactive" | "Pending" });
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const filtered = users.filter((u) => {
    const matchesQuery = u.name.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase()) || (u.roll_no || "").includes(query);
    const matchesRole = roleFilter === "All" || u.role === roleFilter.toLowerCase();
    return matchesQuery && matchesRole;
  });

  const resetForm = () => {
    setForm({ name: "", email: "", password: "", role: "student", branch: "CSE", roll_no: "", status: "Pending" });
    setFormError("");
    setShowPassword(false);
    setEditUser(null);
  };

  const openAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const openEdit = (user: RegisteredUser) => {
    setEditUser(user);
    setForm({ 
      name: user.name, 
      email: user.email, 
      password: "", 
      role: user.role as UserRole, 
      branch: user.branch, 
      roll_no: (user as any).roll_no || "",
      status: user.status as any 
    });
    setFormError("");
    setShowPassword(false);
    setShowModal(true);
  };

  const handleEmailChange = (email: string) => {
    setForm((f) => {
      const updated = { ...f, email };
      // Auto-detect role from email pattern
      if (email.includes("@mhssce.ac.in")) {
        const { valid } = validateEmail(email);
        if (valid) {
          updated.role = detectRole(email);
        }
      }
      return updated;
    });
  };

  const createMutation = useMutation({
    mutationFn: (data: any) => apiFetch('/api/users', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowModal(false);
      resetForm();
      toast({ title: "User created", description: `${form.name} can now log in to the ${form.role} portal.` });
    },
    onError: (err: any) => setFormError(err.message)
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; updates: any }) => apiFetch(`/api/users/${data.id}`, { method: 'PUT', body: JSON.stringify(data.updates) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowModal(false);
      resetForm();
      toast({ title: "User updated", description: `${form.name} has been updated successfully.` });
    },
    onError: (err: any) => setFormError(err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/users/${id}`, { method: 'DELETE' }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({ title: "User deleted", description: `User has been removed.`, variant: "destructive" });
    }
  });

  const bulkMutation = useMutation({
    mutationFn: (users: any[]) => apiFetch('/api/users/bulk', { method: 'POST', body: JSON.stringify({ users }) }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowBulkModal(false);
      setCsvRows([]);
      toast({ title: "Bulk import complete", description: res?.message || `${csvRows.length} users created.` });
    },
    onError: (err: any) => setCsvError(err.message)
  });

  const handleSubmit = () => {
    setFormError("");

    if (!form.name.trim()) { setFormError("Name is required."); return; }
    if (!form.email.trim()) { setFormError("Email is required."); return; }

    const { valid, error } = validateEmail(form.email);
    if (!valid) { setFormError(error || "Invalid email."); return; }

    if (editUser) {
      // Update — no password reset allowed from admin
      const updates: any = {
        name: form.name.trim(),
        role: form.role,
        branch: form.branch,
        roll_no: form.roll_no,
        status: form.status,
      };
      updateMutation.mutate({ id: editUser.id, updates });
    } else {
      // Add
      if (form.password.length < 6) { setFormError("Password must be at least 6 characters."); return; }
      createMutation.mutate({
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password,
        role: form.role,
        branch: form.branch,
        roll_no: form.roll_no,
        status: form.status,
      });
    }
  };

  const handleDelete = (user: RegisteredUser) => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return;
    deleteMutation.mutate(user.id);
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">User Management</h1>
          <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
          <p className="mt-1 text-sm text-muted-foreground">{users.length} registered users</p>
        </div>
        <div className="flex gap-2">
          <motion.button
            onClick={() => { setCsvRows([]); setCsvError(""); setShowBulkModal(true); }}
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload className="h-4 w-4" /> Bulk Import
          </motion.button>
          <motion.button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <UserPlus className="h-4 w-4" /> Add User
          </motion.button>
        </div>
      </div>



      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name, email, or roll no..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="h-10 rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option>All</option>
          <option>Student</option>
          <option>Teacher</option>
          <option>Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <AnimatedCard className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/50">
            <tr>
              <th className="px-5 py-3 font-semibold text-foreground">Name</th>
              <th className="px-5 py-3 font-semibold text-foreground">Roll No / ID</th>
              <th className="px-5 py-3 font-semibold text-foreground">Email</th>
              <th className="px-5 py-3 font-semibold text-foreground">Role</th>
              <th className="px-5 py-3 font-semibold text-foreground">Department</th>
              <th className="px-5 py-3 font-semibold text-foreground">Status</th>
              <th className="px-5 py-3 font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((u, i) => (
              <motion.tr
                key={u.id}
                className="transition-colors hover:bg-muted/50"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
              >
                <td className="px-5 py-3 font-medium text-foreground">{u.name}</td>
                <td className="px-5 py-3 text-xs font-bold text-primary">{(u as any).roll_no || "—"}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium capitalize ${
                    u.role === "admin" ? "bg-primary/10 text-primary" :
                    u.role === "teacher" ? "bg-info/10 text-info" :
                    "bg-accent text-accent-foreground"
                  }`}>{u.role}</span>
                </td>
                <td className="px-5 py-3 text-muted-foreground font-medium">{u.branch}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                    u.status === "Active" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                  }`}>{u.status}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(u)}
                      title="Edit / Reset Password"
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    {u.status !== "Active" ? (
                      <button
                        onClick={() => updateMutation.mutate({ id: u.id, updates: { status: "Active" } })}
                        title="Activate"
                        className="rounded-lg p-1.5 text-success hover:bg-success/10 transition-colors"
                      >
                        <UserPlus className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <button
                        onClick={() => updateMutation.mutate({ id: u.id, updates: { status: "Inactive" } })}
                        title="Deactivate"
                        className="rounded-lg p-1.5 text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <EyeOff className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(u)}
                      title="Delete User"
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </AnimatedCard>

      {/* Add/Edit User Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative mx-4 w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button onClick={() => { setShowModal(false); resetForm(); }} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-lg font-bold text-foreground">{editUser ? "Edit User Account" : "Add New User Account"}</h2>
              <div className="mt-1 h-1 w-10 rounded-full bg-primary" />
              <p className="mt-2 text-xs text-muted-foreground">
                {editUser ? "Updates will be applied immediately." : "User credentials will be generated for the AMS portal."}
              </p>

              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase tracking-widest">Full Name</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. Anas Ansari"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase tracking-widest">Roll Number / ID</label>
                    <input
                      value={form.roll_no}
                      onChange={(e) => setForm((f) => ({ ...f, roll_no: e.target.value }))}
                      placeholder="e.g. 241723CS"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase tracking-widest">College Email (@mhssce.ac.in)</label>
                  <input
                    value={form.email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="name.roll.branch@mhssce.ac.in"
                    disabled={!!editUser}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium disabled:opacity-60"
                  />
                </div>

                {!editUser && (
                <div>
                  <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Initial Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                      placeholder="Min 6 characters"
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase tracking-widest">Access Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserRole }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase tracking-widest">Branch / Dept</label>
                    <select
                      value={form.branch}
                      onChange={(e) => setForm((f) => ({ ...f, branch: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-bold text-muted-foreground uppercase tracking-widest">Account Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="Active">Active ✅</option>
                    <option value="Inactive">Inactive ❌</option>
                    <option value="Pending">Pending ⏳</option>
                  </select>
                </div>

                {formError && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs font-bold text-destructive py-2 px-3 bg-destructive/10 rounded-lg"
                  >
                    {formError}
                  </motion.p>
                )}

                <motion.button
                  onClick={handleSubmit}
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 disabled:opacity-50"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Processing...' : editUser ? "Apply Changes" : "Confirm & Create"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative mx-4 w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-xl max-h-[85vh] flex flex-col"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button onClick={() => setShowBulkModal(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-lg font-bold text-foreground">Bulk Import Users</h2>
              <div className="mt-1 h-1 w-10 rounded-full bg-primary" />
              <p className="mt-2 text-xs text-muted-foreground">
                Upload a CSV file with columns: <code className="bg-muted px-1 rounded">name,email,password,role,branch,roll_no</code>
              </p>

              <div className="mt-4">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => {
                    setCsvError("");
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      const text = ev.target?.result as string;
                      const lines = text.split("\n").map(l => l.trim()).filter(l => l.length > 0);
                      if (lines.length < 2) { setCsvError("CSV must have a header row and at least 1 data row."); return; }
                      const header = lines[0].toLowerCase().split(",").map(h => h.trim());
                      const nameIdx = header.indexOf("name");
                      const emailIdx = header.indexOf("email");
                      const passwordIdx = header.indexOf("password");
                      const roleIdx = header.indexOf("role");
                      const branchIdx = header.indexOf("branch");
                      const rollIdx = header.indexOf("roll_no");
                      if (nameIdx === -1 || emailIdx === -1) { setCsvError("CSV must have 'name' and 'email' columns."); return; }
                      const parsed = lines.slice(1).map(line => {
                        const cols = line.split(",").map(c => c.trim());
                        return {
                          name: cols[nameIdx] || "",
                          email: cols[emailIdx] || "",
                          password: cols[passwordIdx] || "default123",
                          role: cols[roleIdx] || "student",
                          branch: cols[branchIdx] || "",
                          roll_no: cols[rollIdx] || "",
                        };
                      });
                      setCsvRows(parsed);
                    };
                    reader.readAsText(file);
                  }}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-bold file:text-primary"
                />
              </div>

              {csvError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-xs font-bold text-destructive py-2 px-3 bg-destructive/10 rounded-lg">
                  {csvError}
                </motion.p>
              )}

              {csvRows.length > 0 && (
                <div className="mt-4 flex-1 overflow-auto">
                  <p className="text-xs font-bold text-muted-foreground mb-2">{csvRows.length} users parsed — preview:</p>
                  <div className="rounded-lg border border-border overflow-hidden">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/50 border-b border-border">
                          <th className="px-3 py-2 text-left font-semibold">#</th>
                          <th className="px-3 py-2 text-left font-semibold">Name</th>
                          <th className="px-3 py-2 text-left font-semibold">Email</th>
                          <th className="px-3 py-2 text-left font-semibold">Role</th>
                          <th className="px-3 py-2 text-left font-semibold">Branch</th>
                          <th className="px-3 py-2 text-left font-semibold">Roll No</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {csvRows.slice(0, 20).map((row, i) => (
                          <tr key={i} className="hover:bg-muted/30">
                            <td className="px-3 py-1.5 text-muted-foreground">{i + 1}</td>
                            <td className="px-3 py-1.5 font-medium">{row.name}</td>
                            <td className="px-3 py-1.5 text-muted-foreground">{row.email}</td>
                            <td className="px-3 py-1.5"><span className="capitalize">{row.role}</span></td>
                            <td className="px-3 py-1.5">{row.branch}</td>
                            <td className="px-3 py-1.5">{row.roll_no || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {csvRows.length > 20 && <p className="text-[10px] text-muted-foreground px-3 py-1">...and {csvRows.length - 20} more</p>}
                  </div>
                </div>
              )}

              <motion.button
                onClick={() => { setCsvError(""); bulkMutation.mutate(csvRows); }}
                disabled={csvRows.length === 0 || bulkMutation.isPending}
                className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/95 disabled:opacity-50"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                {bulkMutation.isPending ? "Importing..." : `Import ${csvRows.length} Users`}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}


