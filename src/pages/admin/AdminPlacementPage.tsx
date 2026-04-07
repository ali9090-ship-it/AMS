import { useState } from "react";
import { Briefcase, Plus, Users, FileText, Check, X, Loader2, Download, Trash2 } from "lucide-react";
import { PageTransition, AnimatedCard, StaggerContainer, AnimatedListItem } from "@/components/animations";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiUpload } from '@/lib/api';
import { toast } from "sonner";

export default function AdminPlacementPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'drives' | 'applications'>('drives');
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState({
    company: "",
    role: "",
    package: "",
    deadline: "",
    eligibility: "",
    description: "",
    file: null as File | null
  });

  const { data: drives = [], isLoading: loadingDrives } = useQuery({ 
    queryKey: ['placement_jobs'], 
    queryFn: () => apiFetch('/api/placement/jobs') 
  });

  const { data: applications = [], isLoading: loadingApps } = useQuery({ 
    queryKey: ['placement_applications'], 
    queryFn: () => apiFetch('/api/placement/applications'),
    enabled: activeTab === 'applications'
  });

  const createDriveMutation = useMutation({
    mutationFn: (fd: FormData) => apiUpload('/api/placement/jobs', fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placement_jobs'] });
      setShowAddModal(false);
      setForm({ company: "", role: "", package: "", deadline: "", eligibility: "", description: "", file: null });
      toast.success("Placement drive posted successfully");
    },
    onError: (err: any) => toast.error(err.message)
  });

  const updateAppMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => 
      apiFetch(`/api/placement/applications/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placement_applications'] });
      toast.success("Application status updated");
    }
  });

  const deleteDriveMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/placement/jobs/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placement_jobs'] });
      toast.success("Drive deleted");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (val) fd.append(key, val as any);
    });
    createDriveMutation.mutate(fd);
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Training & Placement</h1>
          <p className="mt-1 text-sm text-muted-foreground font-medium uppercase tracking-widest text-[10px]">T&P Cell Management</p>
          <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab('drives')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'drives' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            Drives
          </button>
          <button 
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'applications' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
          >
            Applications
          </button>
          <motion.button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl bg-success px-4 py-2 text-sm font-bold text-success-foreground hover:bg-success/90 transition-all shadow-lg shadow-success/20"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-4 w-4" /> Add Drive
          </motion.button>
        </div>
      </div>

      {activeTab === 'drives' ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loadingDrives ? (
            <div className="col-span-full py-20 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary/50" />
            </div>
          ) : drives.length === 0 ? (
            <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-2xl">
              <p className="text-sm text-muted-foreground">No placement drives found. Create one to get started.</p>
            </div>
          ) : drives.map((d: any, i: number) => (
            <AnimatedCard key={d.id} index={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm group">
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <button 
                  onClick={() => deleteDriveMutation.mutate(d.id)}
                  className="p-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-lg font-bold text-foreground">{d.company}</h3>
              <p className="text-sm font-semibold text-primary">{d.role}</p>
              <div className="mt-4 space-y-2 text-xs font-medium">
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase tracking-widest text-[9px]">Package</span>
                  <span className="text-foreground">{d.package}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground uppercase tracking-widest text-[9px]">Deadline</span>
                  <span className="text-foreground">{new Date(d.deadline).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${new Date(d.deadline) > new Date() ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                  {new Date(d.deadline) > new Date() ? 'ACTIVE' : 'CLOSED'}
                </span>
                {d.brochure_url && (
                  <a 
                    href={`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001'}/${d.brochure_url}`} 
                    target="_blank" 
                    className="flex items-center gap-1 text-[10px] font-bold text-primary hover:underline"
                  >
                    <Download className="h-3 w-3" /> BROCHURE
                  </a>
                )}
              </div>
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
                  <th className="px-6 py-4 font-bold text-foreground uppercase tracking-widest text-[10px]">Drive</th>
                  <th className="px-6 py-4 font-bold text-foreground uppercase tracking-widest text-[10px]">Resume</th>
                  <th className="px-6 py-4 font-bold text-foreground uppercase tracking-widest text-[10px]">Status</th>
                  <th className="px-6 py-4 font-bold text-foreground uppercase tracking-widest text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingApps ? (
                  <tr><td colSpan={5} className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary/50" /></td></tr>
                ) : applications.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-muted-foreground">No applications received yet.</td></tr>
                ) : applications.map((app: any) => (
                  <tr key={app.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground">{app.student?.name || 'Student'}</p>
                      <p className="text-[10px] text-muted-foreground">{app.student?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-foreground">{app.job?.company}</p>
                      <p className="text-[10px] text-muted-foreground">{app.job?.role}</p>
                    </td>
                    <td className="px-6 py-4">
                      {app.resume_path && (
                        <a 
                          href={`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001'}/${app.resume_path}`} 
                          target="_blank"
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-bold text-primary hover:bg-primary/20 transition-all"
                        >
                          <FileText className="h-3.5 w-3.5" /> RESUME
                        </a>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                        app.status === 'Selected' ? 'bg-success/10 text-success' : 
                        app.status === 'Rejected' ? 'bg-destructive/10 text-destructive' : 
                        'bg-warning/10 text-warning-foreground'
                      }`}>
                        {app.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {['Shortlisted', 'Selected', 'Rejected'].map(s => (
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

      {/* Add Drive Modal */}
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
                <h2 className="text-xl font-bold">Post New Drive</h2>
                <button onClick={() => setShowAddModal(false)} className="rounded-full p-2 hover:bg-muted"><X className="h-5 w-5" /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Company Name</label>
                    <input 
                      required
                      value={form.company}
                      onChange={e => setForm({...form, company: e.target.value})}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Role</label>
                    <input 
                      required
                      value={form.role}
                      onChange={e => setForm({...form, role: e.target.value})}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Package (LPA)</label>
                    <input 
                      required
                      value={form.package}
                      onChange={e => setForm({...form, package: e.target.value})}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Deadline</label>
                    <input 
                      required
                      type="date"
                      value={form.deadline}
                      onChange={e => setForm({...form, deadline: e.target.value})}
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Eligibility Criteria</label>
                  <input 
                    value={form.eligibility}
                    placeholder="e.g. 7.5 CGPA+, No active backlogs"
                    onChange={e => setForm({...form, eligibility: e.target.value})}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Description</label>
                  <textarea 
                    rows={3}
                    value={form.description}
                    onChange={e => setForm({...form, description: e.target.value})}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 block">Brochure (Optional)</label>
                  <input 
                    type="file"
                    accept=".pdf,.png,.jpg"
                    onChange={e => setForm({...form, file: e.target.files?.[0] || null})}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-xs font-semibold file:mr-3 file:rounded file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-xs file:font-medium file:text-primary"
                  />
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={createDriveMutation.isPending}
                    className="w-full h-12 rounded-xl bg-primary text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50"
                  >
                    {createDriveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "POST PLACEMENT DRIVE"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
