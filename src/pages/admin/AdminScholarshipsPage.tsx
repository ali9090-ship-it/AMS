import { useState } from "react";
import { Award, Plus, Users, FileText, Check, X, Loader2, Trash2 } from "lucide-react";
import { PageTransition, AnimatedCard, StaggerContainer, AnimatedListItem } from "@/components/animations";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { toast } from "sonner";

export default function AdminScholarshipsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'listings' | 'applications'>('listings');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    deadline: "",
    eligibility: "",
    description: ""
  });

  const { data: scholarships = [], isLoading: loadingListings } = useQuery({ 
    queryKey: ['scholarships'], 
    queryFn: () => apiFetch('/api/scholarships') 
  });

  const { data: applications = [], isLoading: loadingApps } = useQuery({ 
    queryKey: ['scholarship_applications'], 
    queryFn: () => apiFetch('/api/scholarships/applications'),
    enabled: activeTab === 'applications'
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiFetch('/api/scholarships', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships'] });
      setShowAddModal(false);
      setForm({ name: "", amount: "", deadline: "", eligibility: "", description: "" });
      toast.success("Scholarship listing created");
    },
    onError: (err: any) => toast.error(err.message)
  });

  const updateAppMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => 
      apiFetch(`/api/scholarships/applications/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarship_applications'] });
      toast.success("Application status updated");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/scholarships/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships'] });
      toast.success("Scholarship deleted");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Scholarship Management</h1>
          <p className="mt-1 text-sm text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Academic Grants & Financial Aid</p>
          <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'listings' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            Listings
          </button>
          <button 
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'applications' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            Applications
          </button>
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-4 w-4" /> Add Listing
          </motion.button>
        </div>
      </div>

      {activeTab === 'listings' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loadingListings ? (
            <div className="col-span-full py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto text-primary/50" /></div>
          ) : scholarships.length === 0 ? (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-2xl text-muted-foreground">No active scholarships.</div>
          ) : scholarships.map((s: any, i: number) => (
            <AnimatedCard key={s.id} index={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm group">
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <button 
                  onClick={() => deleteMutation.mutate(s.id)}
                  className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-foreground">{s.name}</h3>
              <p className="text-xl font-black text-primary mt-1">₹{s.amount || '0'}</p>
              <div className="mt-4 space-y-2 text-[10px] font-bold uppercase tracking-tighter">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Deadline</span>
                  <span className="text-foreground">{new Date(s.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-muted-foreground">Applicants</span>
                   <span className="text-foreground">Check Applications Tab</span>
                </div>
              </div>
              <p className="mt-4 text-[10px] text-muted-foreground line-clamp-2">{s.description}</p>
            </AnimatedCard>
          ))}
        </div>
      ) : (
        <AnimatedCard className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-bold text-foreground uppercase tracking-widest text-[10px]">Student</th>
                  <th className="px-6 py-4 font-bold text-foreground uppercase tracking-widest text-[10px]">Scholarship</th>
                  <th className="px-6 py-4 font-bold text-foreground uppercase tracking-widest text-[10px]">Status</th>
                  <th className="px-6 py-4 font-bold text-foreground uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingApps ? (
                  <tr><td colSpan={4} className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary/50" /></td></tr>
                ) : applications.length === 0 ? (
                  <tr><td colSpan={4} className="py-10 text-center text-muted-foreground font-medium">No applications found.</td></tr>
                ) : applications.map((app: any) => (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground">{app.student?.name || 'Anonymous'}</p>
                      <p className="text-[10px] text-muted-foreground">{app.student?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{app.scholarship?.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                        app.status === 'Approved' ? 'bg-success/10 text-success' : 
                        app.status === 'Rejected' ? 'bg-destructive/10 text-destructive' : 
                        'bg-warning/10 text-warning-foreground'
                      }`}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {['Pending', 'Approved', 'Rejected'].map(s => (
                          <button
                            key={s}
                            onClick={() => updateAppMutation.mutate({ id: app.id, status: s })}
                            className={`px-2 py-1 rounded-md text-[9px] font-bold border transition-all ${
                              app.status === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent text-muted-foreground border-border hover:bg-muted'
                            }`}
                          >
                            {s.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnimatedCard>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
            <motion.div 
              className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">New Scholarship Listing</h2>
                <button onClick={() => setShowAddModal(false)} className="rounded-full p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Scholarship Name</label>
                  <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold"/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Amount (₹)</label>
                    <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold"/>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Deadline</label>
                    <input type="date" required value={form.deadline} onChange={e => setForm({...form, deadline: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold"/>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Eligibility</label>
                  <input value={form.eligibility} onChange={e => setForm({...form, eligibility: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold"/>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Description</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold"/>
                </div>
                <button type="submit" disabled={createMutation.isPending} className="w-full h-12 rounded-xl bg-primary text-sm font-bold text-primary-foreground hover:bg-primary/90 mt-4 disabled:opacity-50">
                  {createMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mx-auto"/> : "CREATE LISTING"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
