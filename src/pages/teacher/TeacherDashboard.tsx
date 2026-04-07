import { BookOpen, CalendarCheck, ClipboardList, AlertTriangle, MessageSquare, Loader2, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageTransition, AnimatedCard, StaggerContainer, AnimatedListItem } from "@/components/animations";
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: () => apiFetch('/api/courses') });
  const { data: announcements = [], isLoading: loadingAnnouncements } = useQuery({ 
    queryKey: ['announcements'], 
    queryFn: () => apiFetch('/api/announcements') 
  });
  const { data: atRiskStudents = [], isLoading: loadingRisk } = useQuery({
    queryKey: ['at_risk_students'],
    queryFn: () => apiFetch('/api/ai/at-risk-students'),
  });
  
  // Todays Classes
  const todaysClasses = courses.slice(0, 3).map((c: any) => ({
    course: c.name,
    time: c.schedule || "10:00 AM",
    room: c.branch || "Theory Room 1",
    students: c.student_count || 0
  }));

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

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Welcome, Prof. {user?.name ?? "Teacher"}</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Faculty Academic Control Center</p>
          <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: BookOpen, label: "Courses Assigned", value: courses.length.toString() },
          { icon: CalendarCheck, label: "Classes Today", value: todaysClasses.length.toString() },
          { icon: AlertTriangle, label: "At-Risk Students", value: atRiskStudents.length.toString() },
        ].map((s, i) => (
          <AnimatedCard key={i} index={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <s.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-black text-foreground">{s.value}</p>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{s.label}</p>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* News Feed */}
        <AnimatedCard index={3} className="lg:col-span-1 rounded-2xl border border-border bg-card p-6 shadow-sm overflow-hidden flex flex-col">
          <h2 className="mb-6 flex items-center gap-2 text-base font-bold text-foreground">
            <MessageSquare className="h-4 w-4 text-primary" /> Institution Updates
          </h2>
          <div className="flex-1 space-y-4">
            {loadingAnnouncements ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary/50" />
            ) : announcements.length === 0 ? (
              <p className="text-center py-10 text-[10px] font-bold text-muted-foreground uppercase">No Broadcasts</p>
            ) : announcements.slice(0, 4).map((a: any, i: number) => (
              <div 
                key={i} 
                onClick={() => setSelectedUpdate(a)}
                className="group relative pl-4 border-l-2 border-primary/20 hover:border-primary transition-all cursor-pointer"
              >
                <p className="text-xs font-bold text-foreground line-clamp-1">{a.title}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">{a.type}</span>
                  <span className="text-[9px] font-bold text-primary bg-primary/5 px-1.5 rounded">{getTimeAgo(a.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </AnimatedCard>

        {/* Schedule */}
        <AnimatedCard index={4} className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 text-base font-bold text-foreground">
            <CalendarCheck className="h-4 w-4 text-primary" /> Academic Schedule
          </h2>
          <StaggerContainer className="space-y-3">
            {todaysClasses.length === 0 ? <p className="text-xs text-muted-foreground font-bold text-center py-10 uppercase tracking-widest">No classes scheduled</p> : todaysClasses.map((c: any, i: number) => (
              <AnimatedListItem key={i}>
                <div className="flex items-center justify-between rounded-xl border border-border p-4 transition-all hover:bg-muted/30 group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center font-black text-xs text-primary group-hover:bg-primary/[0.05]">
                      {c.time.split(':')[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{c.course}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{c.time} · {c.room}</p>
                    </div>
                  </div>
                  <span className="rounded-lg bg-muted px-3 py-1 text-[10px] font-black text-muted-foreground uppercase tracking-tighter group-hover:bg-primary/10 group-hover:text-primary">
                    {c.students} Students
                  </span>
                </div>
              </AnimatedListItem>
            ))}
          </StaggerContainer>
        </AnimatedCard>
      </div>

      {/* At-risk students */}
      <AnimatedCard index={5} className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-widest">
            <AlertTriangle className="h-4 w-4 text-warning" /> Academic Alert Zone
          </h2>
          <span className="px-2 py-0.5 rounded bg-warning/10 text-[9px] font-black text-warning uppercase">{atRiskStudents.length} Flagged</span>
        </div>
        {loadingRisk ? (
          <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary/50" />
        ) : atRiskStudents.length === 0 ? (
          <p className="text-xs text-muted-foreground font-medium text-center py-4">No at-risk students detected. All students are on track.</p>
        ) : (
          <div className="space-y-2">
            {atRiskStudents.slice(0, 5).map((s: any) => (
              <div key={s.student_id} className="flex items-center justify-between rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-foreground">{s.name}</p>
                  <p className="text-xs text-muted-foreground">{s.roll_no} · Attendance: {s.attendance_percentage}% · Marks: {s.average_marks_percentage}%</p>
                </div>
                <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${s.risk_level === 'HIGH' ? 'bg-destructive/10 text-destructive' : 'bg-warning/10 text-warning'}`}>
                  {s.risk_level} ({s.risk_score})
                </span>
              </div>
            ))}
          </div>
        )}
      </AnimatedCard>

      {/* Notification Modal */}
      {selectedUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Institution Update</h2>
              </div>
              <button 
                onClick={() => setSelectedUpdate(null)}
                className="rounded-full p-2 hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{selectedUpdate.type}</p>
                <h3 className="text-xl font-bold text-foreground">{selectedUpdate.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">Posted on {new Date(selectedUpdate.created_at).toLocaleDateString()}</p>
              </div>
              <div className="rounded-xl bg-muted/30 p-4 border border-border">
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{selectedUpdate.content}</p>
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => setSelectedUpdate(null)}
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
