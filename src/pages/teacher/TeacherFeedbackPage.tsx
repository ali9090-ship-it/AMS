import { MessageSquare, ThumbsUp, ThumbsDown, Minus, Loader2 } from "lucide-react";
import { PageTransition, AnimatedCard, StaggerContainer, AnimatedListItem } from "@/components/animations";
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export default function TeacherFeedbackPage() {
  const { data: feedback = [], isLoading } = useQuery({ 
    queryKey: ['teacher_feedback'], 
    queryFn: () => apiFetch('/api/feedback/my') 
  });

  // Group feedback by course for the summary cards
  const coursesMap = feedback.reduce((acc: any, f: any) => {
    const cName = f.course_name || "General";
    if (!acc[cName]) acc[cName] = [];
    acc[cName].push(f);
    return acc;
  }, {});

  const feedbackSummary = Object.entries(coursesMap).map(([course, fb]: [string, any]) => {
    const total = fb.length;
    const pos = fb.filter((f: any) => f.rating >= 4).length;
    const neu = fb.filter((f: any) => f.rating === 3).length;
    const neg = fb.filter((f: any) => f.rating <= 2).length;
    
    return {
      course,
      positive: Math.round((pos / total) * 100),
      neutral: Math.round((neu / total) * 100),
      negative: Math.round((neg / total) * 100),
      responses: total
    };
  });

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Course Feedback</h1>
        <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
        <p className="mt-2 text-sm text-muted-foreground font-medium">Anonymised, aggregated feedback from your students based on real submissions.</p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary/50" />
          <p className="mt-4 text-xs font-bold text-muted-foreground uppercase tracking-widest">Loading Feedback...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {feedbackSummary.length === 0 ? (
              <div className="col-span-full py-10 text-center border-2 border-dashed border-border rounded-2xl text-muted-foreground text-sm font-medium">
                No feedback received yet for your courses.
              </div>
            ) : feedbackSummary.map((f, i) => (
              <AnimatedCard key={i} index={i} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
                <h3 className="text-sm font-bold text-foreground truncate" title={f.course}>{f.course}</h3>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{f.responses} responses</p>
                <div className="mt-4 grid grid-cols-3 gap-1">
                  <div className="flex flex-col items-center rounded-xl bg-success/5 py-3 border border-success/10">
                    <ThumbsUp className="h-3.5 w-3.5 text-success mb-1" />
                    <span className="text-xs font-black text-success">{f.positive}%</span>
                  </div>
                  <div className="flex flex-col items-center rounded-xl bg-muted/30 py-3 border border-border">
                    <Minus className="h-3.5 w-3.5 text-muted-foreground mb-1" />
                    <span className="text-xs font-black text-muted-foreground">{f.neutral}%</span>
                  </div>
                  <div className="flex flex-col items-center rounded-xl bg-destructive/5 py-3 border border-destructive/10">
                    <ThumbsDown className="h-3.5 w-3.5 text-destructive mb-1" />
                    <span className="text-xs font-black text-destructive">{f.negative}%</span>
                  </div>
                </div>
              </AnimatedCard>
            ))}
          </div>

          <AnimatedCard index={3} className="rounded-2xl border border-border bg-card p-6 shadow-sm overflow-hidden">
            <h2 className="mb-6 flex items-center gap-2 text-base font-bold text-foreground">
              <MessageSquare className="h-4 w-4 text-primary" /> Recent Student Comments
            </h2>
            
            {feedback.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs font-bold uppercase tracking-widest border-2 border-dashed border-border rounded-xl">
                No text-based feedback yet.
              </div>
            ) : (
              <StaggerContainer className="space-y-4">
                {feedback.slice(0, 10).map((f: any, i: number) => (
                  <AnimatedListItem key={f.id}>
                    <div className="group relative rounded-xl border border-border bg-background p-5 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-tighter">
                          {f.course_name}
                        </span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <div key={s} className={`h-1.5 w-1.5 rounded-full ${s <= f.rating ? 'bg-primary shadow-[0_0_5px_rgba(var(--primary),0.5)]' : 'bg-muted'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm font-medium text-foreground leading-relaxed italic pr-4">"{f.comment}"</p>
                      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                        <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
                          {new Date(f.created_at).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter transition-colors group-hover:text-primary">
                          {f.is_anonymous ? "Secret Submission" : "Verified Student"}
                        </span>
                      </div>
                    </div>
                  </AnimatedListItem>
                ))}
              </StaggerContainer>
            )}
          </AnimatedCard>
        </>
      )}
    </PageTransition>
  );
}
