import { MessageSquare, Download, Loader2, FileCheck, Users, BarChart3 } from "lucide-react";
import { PageTransition, AnimatedCard, StaggerContainer, AnimatedListItem } from "@/components/animations";
import { motion } from "framer-motion";
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

const apiUrl = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';
const reports = [
  { name: "Attendance Report", type: "Attendance", url: `${apiUrl}/api/reports/attendance` },
  { name: "Placement Report", type: "Placement", url: `${apiUrl}/api/reports/placement` },
  { name: "Scholarships Report", type: "Scholarships", url: `${apiUrl}/api/reports/scholarships` },
  { name: "Admissions Report", type: "Admissions", url: `${apiUrl}/api/reports/admissions` },
];

export default function AdminFeedbackPage() {
  const { data: stats = [], isLoading: loadingStats } = useQuery({ 
    queryKey: ['admin_feedback_stats'], 
    queryFn: () => apiFetch('/api/feedback/stats') 
  });
  
  const { data: recentFeedback = [], isLoading: loadingFeedback } = useQuery({ 
    queryKey: ['admin_all_feedback'], 
    queryFn: () => apiFetch('/api/feedback') 
  });

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feedback & Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground font-medium uppercase tracking-widest text-[10px]">Institutional Performance Monitoring</p>
          <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <AnimatedCard className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-6 flex items-center gap-2 text-base font-bold text-foreground">
            <BarChart3 className="h-4 w-4 text-primary" /> Sentiment Analysis
          </h2>
          
          {loadingStats ? (
            <div className="py-20 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary/50" /></div>
          ) : stats.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-border rounded-xl text-muted-foreground text-sm">No feedback data available for analysis.</div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2">
              {stats.map((f: any, i: number) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">{f.category}</h3>
                    <span className="text-[10px] font-bold text-success">{f.positive}% Positive</span>
                  </div>
                  <div className="flex h-2.5 overflow-hidden rounded-full bg-muted shadow-inner">
                    <motion.div
                      className="bg-success shadow-[0_0_10px_rgba(var(--success),0.3)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${f.positive}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    />
                    <motion.div
                      className="bg-warning"
                      initial={{ width: 0 }}
                      animate={{ width: `${f.neutral}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 + 0.2 }}
                    />
                    <motion.div
                      className="bg-destructive"
                      initial={{ width: 0 }}
                      animate={{ width: `${f.negative}%` }}
                      transition={{ duration: 0.6, delay: i * 0.1 + 0.4 }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">
                    <span>Satisfied: {f.positive}%</span>
                    <span>Neutral: {f.neutral}%</span>
                    <span>Concerns: {f.negative}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AnimatedCard>

        <AnimatedCard className="rounded-2xl border border-border bg-card p-6 shadow-sm lg:col-span-1">
          <h2 className="mb-6 flex items-center gap-2 text-base font-bold text-foreground">
            <MessageSquare className="h-4 w-4 text-primary" /> Recent Submissions
          </h2>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {loadingFeedback ? (
              <Loader2 className="h-5 w-5 animate-spin mx-auto text-primary/50" />
            ) : recentFeedback.length === 0 ? (
              <p className="text-center py-10 text-xs font-bold text-muted-foreground uppercase">Empty</p>
            ) : recentFeedback.slice(0, 5).map((fb: any) => (
              <div key={fb.id} className="p-3 rounded-xl border border-border bg-muted/20">
                <div className="flex justify-between mb-1">
                  <span className="text-[9px] font-black text-primary uppercase">{fb.course_name || 'General'}</span>
                  <span className="text-[9px] text-muted-foreground font-bold">{new Date(fb.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs font-medium text-foreground line-clamp-2 italic">"{fb.comment}"</p>
              </div>
            ))}
          </div>
        </AnimatedCard>
      </div>

      <AnimatedCard className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-bold text-foreground">System Generated Reports</h2>
          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-[10px] font-bold text-primary uppercase tracking-widest">Live Audit Active</span>
        </div>
        <StaggerContainer className="grid gap-4 sm:grid-cols-2">
          {reports.map((r, i) => (
            <AnimatedListItem key={i}>
              <div className="flex items-center justify-between rounded-xl border border-border p-4 transition-all hover:border-primary/40 hover:bg-primary/[0.02] group">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                    <FileCheck className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{r.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{r.type} · CSV Download</p>
                  </div>
                </div>
                <motion.a
                  href={r.url}
                  download
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all shadow-sm"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Download className="h-4 w-4" />
                </motion.a>
              </div>
            </AnimatedListItem>
          ))}
        </StaggerContainer>
      </AnimatedCard>
    </PageTransition>
  );
}
