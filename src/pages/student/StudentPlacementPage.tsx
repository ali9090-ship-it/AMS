import { useState, useRef } from "react";
import { Briefcase, ExternalLink } from "lucide-react";
import { PageTransition, AnimatedCard, StaggerContainer, AnimatedListItem } from "@/components/animations";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiUpload } from '@/lib/api';

const skills = [
  { name: "Data Structures & Algorithms", link: "#" },
  { name: "Aptitude & Reasoning", link: "#" },
  { name: "Communication Skills", link: "#" },
];

export default function StudentPlacementPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDriveId, setSelectedDriveId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'available' | 'my_apps'>('available');

  const { data: drivesRaw = [] } = useQuery({ queryKey: ['placement_jobs'], queryFn: () => apiFetch('/api/placement/jobs') });
  const { data: myAppsRaw = [] } = useQuery({ queryKey: ['placement_my_apps'], queryFn: () => apiFetch('/api/placement/applications/my') });

  const applyMutation = useMutation({
    mutationFn: async ({ id, fd }: { id: number, fd: FormData }) => {
      return apiUpload(`/api/placement/jobs/${id}/apply`, fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['placement_jobs'] });
      queryClient.invalidateQueries({ queryKey: ['placement_my_apps'] });
      setSelectedDriveId(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  });

  const handleRegisterClick = (id: number) => {
    setSelectedDriveId(id);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedDriveId !== null) {
      const fd = new FormData();
      fd.append('file', e.target.files[0]);
      applyMutation.mutate({ id: selectedDriveId, fd });
    }
  };

  const drives = drivesRaw.map((d: any) => ({
    id: d.id,
    company: d.company,
    role: d.role,
    package: d.package,
    date: new Date(d.deadline).toLocaleDateString(),
    applied: d.my_application_status !== null,
    status: d.my_application_status || 'Open',
    brochure_url: d.brochure_url
  }));

  const myApps = myAppsRaw.map((a: any) => ({
    id: a.id,
    company: a.job?.company || 'Unknown',
    role: a.job?.role || 'Unknown',
    appliedOn: a.applied_at ? new Date(a.applied_at).toLocaleDateString() : 'N/A',
    status: a.status
  }));

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Training & Placement</h1>
        <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
      </div>

      <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx" onChange={handleFileSelect} />

      <div className="flex border-b border-border">
        <button 
          onClick={() => setActiveTab('available')}
          className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'available' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Available Drives
        </button>
        <button 
          onClick={() => setActiveTab('my_apps')}
          className={`pb-2 px-4 text-sm font-medium transition-colors ${activeTab === 'my_apps' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
        >
          My Applications
        </button>
      </div>

      {activeTab === 'available' && (
        <AnimatedCard index={1} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
            <Briefcase className="h-4 w-4 text-primary" /> Placement Drives
          </h2>
          <StaggerContainer className="space-y-3">
            {drives.length === 0 ? <p className="text-sm text-muted-foreground">No placement drives currently available.</p> : drives.map((d: any, i: number) => (
              <AnimatedListItem key={i}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                  <div className="flex-1 text-center sm:text-left">
                    <p className="text-sm font-semibold text-foreground">{d.company} — {d.role}</p>
                    <p className="text-xs text-muted-foreground">{d.package} · Deadline: {d.date}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2">
                    {d.brochure_url && (
                      <a href={`http://127.0.0.1:5001/${d.brochure_url}`} download className="text-xs text-primary hover:underline">Download Brochure</a>
                    )}
                    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      d.status === "Approved" || d.status === "Selected" ? "bg-success/10 text-success" :
                      d.status === "Rejected" ? "bg-destructive/10 text-destructive" :
                      d.status === "Pending" ? "bg-warning/20 text-warning-foreground" :
                      "bg-accent text-accent-foreground"
                    }`}>{d.status}</span>
                    {!d.applied && (
                      <motion.button
                        className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleRegisterClick(d.id)}
                        disabled={applyMutation.isPending && selectedDriveId === d.id}
                      >
                        {applyMutation.isPending && selectedDriveId === d.id ? 'Uploading...' : 'Apply Now'}
                      </motion.button>
                    )}
                  </div>
                </div>
              </AnimatedListItem>
            ))}
          </StaggerContainer>
        </AnimatedCard>
      )}

      {activeTab === 'my_apps' && (
        <AnimatedCard index={1} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-foreground">My Applications</h2>
          <StaggerContainer className="space-y-3">
            {myApps.length === 0 ? <p className="text-sm text-muted-foreground">You haven't applied to any drives yet.</p> : myApps.map((a: any, i: number) => (
              <AnimatedListItem key={i}>
                <div className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/50">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{a.company} — {a.role}</p>
                    <p className="text-xs text-muted-foreground">Applied On: {a.appliedOn}</p>
                  </div>
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                    a.status === "Selected" || a.status === "Shortlisted" ? "bg-success/10 text-success" :
                    a.status === "Rejected" ? "bg-destructive/10 text-destructive" :
                    "bg-warning/20 text-warning-foreground"
                  }`}>{a.status}</span>
                </div>
              </AnimatedListItem>
            ))}
          </StaggerContainer>
        </AnimatedCard>
      )}

      <AnimatedCard index={2} className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-foreground">Recommended Preparation</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {skills.map((s, i) => (
            <AnimatedCard key={i} index={i} className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50">
              <p className="text-sm text-foreground">{s.name}</p>
              <ExternalLink className="h-3.5 w-3.5 text-primary" />
            </AnimatedCard>
          ))}
        </div>
      </AnimatedCard>
    </PageTransition>
  );
}
