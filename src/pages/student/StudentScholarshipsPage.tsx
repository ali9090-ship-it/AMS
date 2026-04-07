import { useState } from "react";
import { Award } from "lucide-react";
import { PageTransition, AnimatedCard, StaggerContainer, AnimatedListItem } from "@/components/animations";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export default function StudentScholarshipsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'available' | 'my_apps'>('available');

  const { data: scholarshipsRaw = [] } = useQuery({ queryKey: ['scholarships'], queryFn: () => apiFetch('/api/scholarships') });
  const { data: myAppsRaw = [] } = useQuery({ queryKey: ['scholarship_my_apps'], queryFn: () => apiFetch('/api/scholarships/applications/my') });

  const applyMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/scholarships/${id}/apply`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships'] });
      queryClient.invalidateQueries({ queryKey: ['scholarship_my_apps'] });
    }
  });

  const scholarships = scholarshipsRaw.map((s: any) => {
    const hasApplied = myAppsRaw.some((a: any) => a.scholarship?.name === s.name);
    const appliedStatus = hasApplied ? myAppsRaw.find((a: any) => a.scholarship?.name === s.name).status : null;
    return {
      id: s.id,
      name: s.name,
      amount: s.amount ? `₹${s.amount}` : "Varies",
      deadline: new Date(s.deadline).toLocaleDateString(),
      criteria: s.criteria || 'Open to all eligible students',
      status: s.my_application_status || appliedStatus || (new Date(s.deadline) < new Date() ? "Closed" : "Not Applied"),
      eligible: new Date(s.deadline) >= new Date(),
    };
  });

  const myApps = myAppsRaw.map((a: any) => ({
    id: a.id,
    name: a.scholarship?.name || 'Unknown',
    appliedOn: a.applied_at ? new Date(a.applied_at).toLocaleDateString() : new Date(a.created_at).toLocaleDateString(),
    status: a.status
  }));

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Scholarships</h1>
        <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
        <p className="mt-1 text-sm text-muted-foreground">Browse available scholarships and apply if eligible.</p>
      </div>

      <div className="flex border-b border-border">
        <button 
          onClick={() => setActiveTab('available')}
          className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'available' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Available Scholarships
        </button>
        <button 
          onClick={() => setActiveTab('my_apps')}
          className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'my_apps' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          My Applications
        </button>
      </div>

      {activeTab === 'available' && (
        <div className="space-y-4">
          {scholarships.length === 0 ? <p className="text-sm text-muted-foreground">No scholarships available at the moment.</p> : scholarships.map((s: any, i: number) => (
            <AnimatedCard key={i} index={i} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{s.name}</h3>
                    <p className="text-lg font-bold text-primary">{s.amount}</p>
                    <p className="text-xs text-muted-foreground">Deadline: {s.deadline}</p>
                    <p className="text-xs text-muted-foreground mt-1">Criteria: {s.criteria}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 w-full md:w-auto mt-2 md:mt-0">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                    s.status === "Approved" ? "bg-success/10 text-success" :
                    s.status === "Rejected" ? "bg-destructive/10 text-destructive" :
                    s.status === "Pending" ? "bg-warning/20 text-warning-foreground" :
                    s.status === "Closed" ? "bg-muted text-muted-foreground" :
                    "bg-accent text-accent-foreground"
                  }`}>{s.status}</span>
                  {s.eligible && s.status === "Not Applied" && (
                    <motion.button
                      onClick={() => applyMutation.mutate(s.id)}
                      disabled={applyMutation.isPending}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 w-full"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {applyMutation.isPending ? 'Applying...' : 'Apply Now'}
                    </motion.button>
                  )}
                </div>
              </div>
            </AnimatedCard>
          ))}
        </div>
      )}

      {activeTab === 'my_apps' && (
        <AnimatedCard index={1} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-foreground">My Applications</h2>
          <StaggerContainer className="space-y-3">
            {myApps.length === 0 ? <p className="text-sm text-muted-foreground">You haven't applied to any scholarships yet.</p> : myApps.map((a: any, i: number) => (
              <AnimatedListItem key={i}>
                <div className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{a.name}</p>
                    <p className="text-xs text-muted-foreground">Applied On: {a.appliedOn}</p>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                    a.status === "Approved" ? "bg-success/10 text-success" :
                    a.status === "Rejected" ? "bg-destructive/10 text-destructive" :
                    "bg-warning/20 text-warning-foreground"
                  }`}>{a.status}</span>
                </div>
              </AnimatedListItem>
            ))}
          </StaggerContainer>
        </AnimatedCard>
      )}

    </PageTransition>
  );
}
