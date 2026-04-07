import { Calendar, Loader2, Clock, MapPin, Download } from "lucide-react";
import { PageTransition, AnimatedCard } from "@/components/animations";
import { motion } from "framer-motion";
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export default function StudentAdmissionsPage() {
  const { data: exams = [], isLoading: loadingExams } = useQuery({ 
    queryKey: ['exams', 'schedules'], 
    queryFn: () => apiFetch('/api/exams/schedules') 
  });

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Examinations</h1>
        <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
        <p className="mt-1 text-sm text-muted-foreground">View your exam schedules and download hall tickets.</p>
      </div>

      {/* Exam Timetable */}
      <AnimatedCard index={0} className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Calendar className="h-4 w-4 text-primary" /> Exam Timetable
          </h2>
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{exams.length} Exams</span>
        </div>
        
        <div className="overflow-x-auto">
          {loadingExams ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
              <p className="mt-4 text-sm text-muted-foreground font-medium">Loading exam timetable...</p>
            </div>
          ) : exams.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-sm text-muted-foreground">No upcoming exams scheduled.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Exam & Subject</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center">Time</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Venue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {exams.map((e: any, i: number) => (
                  <motion.tr
                    key={e.id}
                    className="hover:bg-primary/5 transition-colors group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground group-hover:text-primary transition-colors">{e.name}</p>
                      <p className="text-[11px] font-bold text-primary/70 uppercase tracking-tighter">{e.subject}</p>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {e.exam_date}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        {e.start_time}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-foreground uppercase tracking-tight">
                        <MapPin className="h-3 w-3 text-primary/60" />
                        Room {e.room}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </AnimatedCard>

      {/* Hall Ticket */}
      <AnimatedCard index={1} className="rounded-2xl border-2 border-primary/10 bg-primary/5 p-6 shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <Download className="h-32 w-32 rotate-12" />
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="text-center sm:text-left">
            <h3 className="text-lg font-bold text-foreground">Official Hall Ticket</h3>
            <p className="text-sm text-muted-foreground font-medium">Mid-Semester Examinations March 2026</p>
            <div className="mt-3 flex gap-4 justify-center sm:justify-start">
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest border-b border-primary/30">Download PDF</span>
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest border-b border-primary/30">Print Ticket</span>
            </div>
          </div>
          <motion.button
            className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="h-4 w-4" /> Download Hall Ticket
          </motion.button>
        </div>
      </AnimatedCard>
    </PageTransition>
  );
}
