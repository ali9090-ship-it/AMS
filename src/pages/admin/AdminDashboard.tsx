import { Users, BookOpen, GraduationCap, Briefcase, Award, MessageSquare, X, Edit, Save, Loader2 } from "lucide-react";
import { PageTransition, AnimatedCard, StaggerContainer, AnimatedListItem } from "@/components/animations";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { apiFetch } from '@/lib/api';


export default function AdminDashboard() {
  const { data: students = [] } = useQuery({ queryKey: ['users', 'students'], queryFn: () => apiFetch('/api/users?role=student') });
  const { data: teachers = [] } = useQuery({ queryKey: ['users', 'teachers'], queryFn: () => apiFetch('/api/users?role=teacher') });
  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: () => apiFetch('/api/courses') });
  const { data: placements = [] } = useQuery({ queryKey: ['placement_jobs'], queryFn: () => apiFetch('/api/placement/jobs') });
  const { data: scholarships = [] } = useQuery({ queryKey: ['scholarships'], queryFn: () => apiFetch('/api/scholarships') });
  const { data: admissions = [] } = useQuery({ queryKey: ['admissions'], queryFn: () => apiFetch('/api/admissions').catch(() => []) });
  const { data: announcements = [] } = useQuery({ queryKey: ['announcements'], queryFn: () => apiFetch('/api/announcements') });

  const queryClient = useQueryClient();
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: '', content: '', type: '', target_role: 'all' });

  const updateMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiFetch(`/api/announcements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setIsEditing(false);
      setSelectedUpdate(null);
    }
  });

  const metrics = [
    { icon: Users, label: "Total Students", value: students.length.toString() },
    { icon: Users, label: "Total Teachers", value: teachers.length.toString() },
    { icon: BookOpen, label: "Active Courses", value: courses.length.toString() },
    { icon: GraduationCap, label: "Admissions in Progress", value: admissions.length.toString() },
    { icon: Briefcase, label: "Placement Drives", value: placements.length.toString() },
    { icon: Award, label: "Scholarships Active", value: scholarships.length.toString() },
  ];

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.abs(now.getTime() - date.getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const activities = announcements.slice(0, 5).map((a: any) => ({
    original: a,
    action: a.title,
    detail: `Posted to ${a.type} category`,
    time: getTimeAgo(a.created_at)
  }));

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m, i) => (
          <AnimatedCard key={i} index={i} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <m.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{m.value}</p>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-tight">{m.label}</p>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AnimatedCard index={6} className="rounded-xl border border-border bg-card p-6 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" /> Recent Broadcasts
            </h2>
          </div>
          <StaggerContainer className="space-y-4">
            {activities.length > 0 ? activities.map((a: any, i: number) => (
              <AnimatedListItem key={i}>
                <div 
                  className="flex items-center justify-between group cursor-pointer hover:bg-muted/50 p-2 -mx-2 rounded-lg transition-colors"
                  onClick={() => {
                    setSelectedUpdate(a.original);
                    setEditForm({
                      title: a.original.title,
                      content: a.original.content || '',
                      type: a.original.type,
                      target_role: a.original.target_role || 'all'
                    });
                    setIsEditing(false);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{a.action}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{a.detail}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap bg-muted px-2 py-1 rounded">{a.time}</span>
                </div>
              </AnimatedListItem>
            )) : (
              <p className="text-sm text-muted-foreground text-center py-10">No recent announcements found.</p>
            )}
          </StaggerContainer>
        </AnimatedCard>
      </div>

      {/* View/Edit Broadcast Modal */}
      {selectedUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in duration-200 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-border p-5 shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">{isEditing ? 'Edit Broadcast' : 'View Broadcast'}</h2>
              </div>
              <button onClick={() => setSelectedUpdate(null)} className="rounded-full p-2 hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 overflow-y-auto min-h-0">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Title</label>
                    <input className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={editForm.title} onChange={e => setEditForm(f => ({...f, title: e.target.value}))} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Content</label>
                    <textarea className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm min-h-[100px]" value={editForm.content} onChange={e => setEditForm(f => ({...f, content: e.target.value}))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Type</label>
                      <select className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={editForm.type} onChange={e => setEditForm(f => ({...f, type: e.target.value}))}>
                        <option value="General">General</option>
                        <option value="Notice">Notice</option>
                        <option value="Event">Event</option>
                        <option value="Exam">Exam</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Target</label>
                      <select className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm" value={editForm.target_role} onChange={e => setEditForm(f => ({...f, target_role: e.target.value}))}>
                        <option value="all">All</option>
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setIsEditing(false)} className="rounded-lg border border-input px-4 py-2 text-sm font-bold text-foreground hover:bg-muted transition-colors">Cancel</button>
                    <button onClick={() => updateMutation.mutate(selectedUpdate.id)} disabled={updateMutation.isPending} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
                      {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />} Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{selectedUpdate.type} · To: {selectedUpdate.target_role || 'all'}</p>
                    <h3 className="text-xl font-bold text-foreground">{selectedUpdate.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Posted by {selectedUpdate.author_name}</p>
                  </div>
                  <div className="rounded-xl bg-muted/30 p-4 border border-border">
                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{selectedUpdate.content}</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm font-bold text-foreground hover:bg-muted transition-colors">
                      <Edit className="h-4 w-4" /> Edit
                    </button>
                    <button onClick={() => setSelectedUpdate(null)} className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors">
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
