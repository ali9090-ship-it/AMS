import { PageTransition, AnimatedCard } from "@/components/animations";
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export default function CoursesPage() {
  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => apiFetch('/api/courses'),
  });

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Courses</h1>
        <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
        <p className="mt-1 text-sm text-muted-foreground">Your enrolled courses this semester</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((c: any, i: number) => (
          <AnimatedCard key={i} index={i} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">{c.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{c.code} · {c.teacher?.name || 'Instructor'}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                {c.credits || 4} Credits
              </span>
              <span className="text-xs text-muted-foreground">{c.schedule}</span>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </PageTransition>
  );
}
