import { Briefcase } from "lucide-react";
import { PageTransition, AnimatedCard } from "@/components/animations";
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export default function TeacherPlacementPage() {
  const { data: drives = [] } = useQuery({ queryKey: ['placement_jobs'], queryFn: () => apiFetch('/api/placement/jobs') });

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Training & Placement</h1>
        <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
      </div>
      {drives.length === 0 && <p className="text-sm text-muted-foreground">No drives available.</p>}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {drives.map((d: any, i: number) => (
          <AnimatedCard key={i} index={i} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{d.company}</h3>
            <p className="text-xs text-muted-foreground">{d.role}</p>
            <p className="mt-2 text-xs text-muted-foreground">{new Date(d.deadline).toLocaleDateString()} · Package: {d.package}</p>
          </AnimatedCard>
        ))}
      </div>
    </PageTransition>
  );
}
