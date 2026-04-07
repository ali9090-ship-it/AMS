import { Calendar, Plus, X, Loader2, Clock, MapPin } from "lucide-react";
import { PageTransition, AnimatedCard, StaggerContainer, AnimatedListItem } from "@/components/animations";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useState } from "react";
import { toast } from "sonner";

export default function AdminAdmissionsPage() {
  const queryClient = useQueryClient();
  const [showExamModal, setShowExamModal] = useState(false);
  const [examForm, setExamForm] = useState({ name: "", subject: "", exam_date: "", start_time: "", room: "", status: "Scheduled" });

  const { data: exams = [], isLoading: loadingExams } = useQuery({ 
    queryKey: ['exams', 'schedules'], 
    queryFn: () => apiFetch('/api/exams/schedules') 
  });

  const createExamMutation = useMutation({
    mutationFn: (data: any) => apiFetch('/api/exams/schedules', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', 'schedules'] });
      setShowExamModal(false);
      setExamForm({ name: "", subject: "", exam_date: "", start_time: "", room: "", status: "Scheduled" });
      toast.success("Exam scheduled");
    }
  });

  const deleteExamMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/exams/schedules/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exams', 'schedules'] });
      toast.success("Exam removed");
    }
  });

  return (
    <PageTransition className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Examinations</h1>
          <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
        </div>
        <button
          onClick={() => setShowExamModal(true)}
          className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4" /> Schedule Exam
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {loadingExams ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
          </div>
        ) : exams.length === 0 ? (
          <div className="py-20 text-center font-medium text-muted-foreground">
            <p className="text-sm">No exams scheduled yet.</p>
            <p className="text-[10px] uppercase tracking-widest mt-1">Click "Schedule Exam" to create one</p>
          </div>
        ) : (
          <StaggerContainer className="divide-y divide-border">
            {exams.map((e: any) => (
              <AnimatedListItem key={e.id}>
                <div className="group flex items-center justify-between p-4 transition-colors hover:bg-muted/30">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground leading-tight">{e.name}</p>
                      <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase ${
                        e.status === "Scheduled" ? "bg-success/10 text-success" :
                        e.status === "Draft" ? "bg-muted text-muted-foreground" :
                        "bg-warning/10 text-warning"
                      }`}>{e.status}</span>
                    </div>
                    <p className="text-xs font-semibold text-primary/80 uppercase tracking-tighter">{e.subject}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase">
                        <Clock className="h-2.5 w-2.5" /> {e.exam_date} @ {e.start_time}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase">
                        <MapPin className="h-2.5 w-2.5" /> Room {e.room}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => { if(confirm("Delete schedule?")) deleteExamMutation.mutate(e.id); }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </AnimatedListItem>
            ))}
          </StaggerContainer>
        )}
      </div>

      {/* Add Exam Modal */}
      {showExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in duration-200">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">Schedule New Exam</h2>
              <button 
                onClick={() => setShowExamModal(false)}
                className="rounded-full p-2 hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Exam Name</label>
                <input
                  type="text"
                  value={examForm.name}
                  onChange={e => setExamForm({ ...examForm, name: e.target.value })}
                  placeholder="e.g. Mid-Semester 2026"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                />
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Subject</label>
                <input
                  type="text"
                  value={examForm.subject}
                  onChange={e => setExamForm({ ...examForm, subject: e.target.value })}
                  placeholder="e.g. Data Structures"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Date</label>
                  <input
                    type="date"
                    value={examForm.exam_date}
                    onChange={e => setExamForm({ ...examForm, exam_date: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Time</label>
                  <input
                    type="time"
                    value={examForm.start_time}
                    onChange={e => setExamForm({ ...examForm, start_time: e.target.value })}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Room Number</label>
                <input
                  type="text"
                  value={examForm.room}
                  onChange={e => setExamForm({ ...examForm, room: e.target.value })}
                  placeholder="e.g. Lab 405"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-medium"
                />
              </div>
              
              <button
                onClick={() => createExamMutation.mutate(examForm)}
                disabled={!examForm.name || !examForm.subject || !examForm.exam_date}
                className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
              >
                {createExamMutation.isPending ? "Scheduling..." : "Create Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
