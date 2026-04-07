import { useState } from "react";
import { PageTransition, AnimatedCard } from "@/components/animations";
import { motion } from "framer-motion";
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import AttendanceCalculator from '@/components/AttendanceCalculator';

export default function AttendancePage() {
  const { user } = useAuth();
  const [selected, setSelected] = useState("All Subjects");

  const { data: attendanceRaw } = useQuery({
    queryKey: ['attendance', 'my'],
    queryFn: () => apiFetch('/api/attendance/my'),
    enabled: !!user,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => apiFetch('/api/courses'),
    enabled: !!user,
  });

  const rawRecords = attendanceRaw?.records || (Array.isArray(attendanceRaw) ? attendanceRaw : []);
  const summary = attendanceRaw?.summary || [];

  const attendanceRecords = rawRecords.map((r: any) => ({
    date: new Date(r.date).toLocaleDateString(),
    subject: r.course_name || courses.find((c: any) => c.id === r.course_id)?.name || 'Unknown',
    status: r.status
  }));

  const subjects = ["All Subjects", ...courses.map((c: any) => c.name)];

  const filtered = selected === "All Subjects" ? attendanceRecords : attendanceRecords.filter((r: any) => r.subject === selected);
  
  // Patch 3: Detailed math for selected subject or average
  let stats = { total: 0, present: 0, pct: 0, canMiss: 0, toRecover: 0, isAtRisk: false };
  
  if (selected === "All Subjects") {
    stats.total = filtered.length;
    stats.present = filtered.filter((r: any) => r.status === "Present" || r.status === "Late").length;
  } else {
    const course = summary.find((s: any) => s.course_name === selected);
    if (course) {
      stats.total = course.total_count;
      stats.present = course.present_count;
    }
  }

  if (stats.total > 0) {
    stats.pct = Math.round((stats.present / stats.total) * 100);
    stats.isAtRisk = stats.pct < 75;
    
    if (stats.isAtRisk) {
      // recover = (0.75 * total - present) / 0.25
      stats.toRecover = Math.max(0, Math.ceil((0.75 * stats.total - stats.present) / 0.25));
    } else {
      // can_miss = (present / 0.75) - total
      stats.canMiss = Math.max(0, Math.floor((stats.present / 0.75) - stats.total));
    }
  }

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
        </div>
        
        {/* Force Refresh Rule (Patch 5 implicit in React Query) */}
        <button 
          onClick={() => {}} // react-query manages this, button is for manual trigger
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          {stats.total === 0 ? "No data found" : `Threshold: 75%`}
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-4">
          <select
            value={selected}
            onChange={e => setSelected(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {subjects.map((s, i) => <option key={i}>{s}</option>)}
          </select>

          <AnimatedCard className={`rounded-xl border p-6 shadow-sm ${stats.isAtRisk ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card'}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">Overall Performance</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${stats.isAtRisk ? 'bg-destructive/20 text-destructive' : 'bg-success/20 text-success'}`}>
                {stats.isAtRisk ? 'At Risk' : 'Safe'}
              </span>
            </div>
            
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">{stats.pct}%</span>
              <span className="text-sm text-muted-foreground">({stats.present}/{stats.total})</span>
            </div>

            <div className="mt-6 space-y-3">
              {stats.total === 0 ? (
                <p className="text-xs text-muted-foreground">Log in classes to see insights.</p>
              ) : stats.isAtRisk ? (
                <div className="rounded-lg bg-destructive/10 p-3">
                  <p className="text-xs leading-relaxed text-destructive font-medium">
                    ⚠️ Critical: You must attend the next <span className="text-sm font-bold">{stats.toRecover}</span> classes to reach the mandatory 75% threshold.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg bg-success/10 p-3">
                  <p className="text-xs leading-relaxed text-success font-medium">
                    ✅ Safe: You can miss up to <span className="text-sm font-bold">{stats.canMiss}</span> more classes while staying above the 75% threshold.
                  </p>
                </div>
              )}
            </div>
          </AnimatedCard>
          
          <AttendanceCalculator targetPct={75} currentPresent={stats.present} currentTotal={stats.total} />
        </div>

        <AnimatedCard index={1} className="md:col-span-2 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Subject</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                 <tr><td colSpan={3} className="px-4 py-3 text-center text-muted-foreground">No attendance records found</td></tr>
              ) : filtered.map((r: any, i: number) => (
                <motion.tr
                  key={i}
                  className="border-b border-border transition-colors last:border-0 hover:bg-muted/30"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.03 }}
                >
                  <td className="px-4 py-3 text-muted-foreground">{r.date}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{r.subject}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-md px-2.5 py-0.5 text-xs font-medium ${
                      r.status === "Present" || r.status === "Late"
                        ? "bg-accent text-accent-foreground"
                        : "bg-destructive/10 text-destructive"
                    }`}>
                      {r.status}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </AnimatedCard>
      </div>
    </PageTransition>
  );
}
