import { useState } from "react";
import { Search, AlertTriangle, User, Activity, BookOpen, X, Brain } from "lucide-react";
import { PageTransition, AnimatedCard } from "@/components/animations";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export default function TeacherStudentsPage() {
  const [courseId, setCourseId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const { data: courses = [] } = useQuery({ queryKey: ['teacher_courses'], queryFn: () => apiFetch('/api/courses') });

  const { data: students = [], isFetching } = useQuery({
    queryKey: ['course_students', courseId],
    queryFn: () => apiFetch(`/api/courses/${courseId}/students`),
    enabled: !!courseId,
  });

  const { data: attendanceData = [] } = useQuery({
    queryKey: ['course_attendance', courseId],
    queryFn: () => apiFetch(`/api/attendance/course/${courseId}`),
    enabled: !!courseId,
  });

  const { data: marksData = [] } = useQuery({
    queryKey: ['course_results', courseId],
    queryFn: () => apiFetch(`/api/results/course/${courseId}`),
    enabled: !!courseId,
  });

  const { data: riskScore, isLoading: riskLoading } = useQuery({
    queryKey: ['student_risk', selectedStudent?.id],
    queryFn: () => apiFetch(`/api/ai/risk-score/${selectedStudent?.id}`),
    enabled: !!selectedStudent?.id,
  });

  // Calculate metrics for the table
  const studentsWithMetrics = students.map((s: any) => {
    // Attendance %
    const stuAtt = attendanceData.filter((a: any) => a.student_id === s.id);
    const total = stuAtt.length;
    const present = stuAtt.filter((a: any) => a.status === 'Present').length;
    const attPct = total > 0 ? (present / total) * 100 : 100;

    // Marks
    const stuMarks = marksData.filter((m: any) => m.student_id === s.id);
    const latestMarks = stuMarks.length > 0 ? stuMarks[stuMarks.length - 1] : null;

    // Local Risk Rule (Indicator)
    const isAtRisk = attPct < 75 || (latestMarks && (latestMarks.marks_obtained / latestMarks.total_marks) < 0.4);

    return {
      ...s,
      attPct: Math.round(attPct),
      latestMarks,
      isAtRisk
    };
  });

  const filtered = studentsWithMetrics.filter(
    (s: any) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      (s.roll_no && s.roll_no.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Student Tracker & AI Risk Analysis</h1>
        <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="mb-1 block text-sm font-medium text-foreground">Select Class</label>
          <select 
            value={courseId} 
            onChange={e => setCourseId(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">-- Choose a Class --</option>
            {courses.map((c: any) => <option key={c.id} value={c.id}>{c.name} ({c.code}) - Sem {c.semester}</option>)}
          </select>
        </div>

        <div className="flex-1 relative mt-[22px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or roll number..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-10 w-full rounded-xl border border-input bg-background pl-10 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            disabled={!courseId}
          />
        </div>
      </div>

      {courseId && (
        <AnimatedCard className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          {isFetching ? (
            <div className="p-8 text-center text-muted-foreground">Loading specific student data mapping...</div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50">
                <tr>
                  <th className="px-5 py-3 font-semibold text-foreground">Student</th>
                  <th className="px-5 py-3 font-semibold text-foreground">Roll No</th>
                  <th className="px-5 py-3 font-semibold text-foreground">Attendance %</th>
                  <th className="px-5 py-3 font-semibold text-foreground">Latest Marks</th>
                  <th className="px-5 py-3 font-semibold text-foreground text-center">Status / Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((s: any, i: number) => (
                  <motion.tr
                    key={s.id}
                    onClick={() => setSelectedStudent(s)}
                    className="transition-colors hover:bg-muted/50 cursor-pointer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                  >
                    <td className="px-5 py-3 font-medium text-foreground flex items-center gap-2">
                       {s.avatar_url ? (
                         <img src={`http://127.0.0.1:5001/${s.avatar_url}`} alt="Avatar" className="h-8 w-8 rounded-full border border-border" />
                       ) : (
                         <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/50 text-xs font-bold text-primary">
                           {s.name.charAt(0)}
                         </div>
                       )}
                       {s.name}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{s.roll_no || '-'}</td>
                    <td className="px-5 py-3 font-medium">
                      <span className={s.attPct < 75 ? "text-destructive" : "text-success"}>{s.attPct}%</span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                       {s.latestMarks ? `${s.latestMarks.marks_obtained}/${s.latestMarks.total_marks} (${s.latestMarks.grade})` : 'N/A'}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {s.isAtRisk ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 px-2 py-1 text-xs font-medium text-destructive">
                          <AlertTriangle className="h-3.5 w-3.5" /> High Risk
                        </span>
                      ) : (
                        <span className="rounded-md bg-success/10 px-2 py-1 text-xs font-medium text-success">
                          On Track
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">No students matched.</td></tr>
                )}
              </tbody>
            </table>
          )}
        </AnimatedCard>
      )}

      {/* Student Detail Modal */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xl m-4"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <button 
                onClick={() => setSelectedStudent(null)} 
                className="absolute right-4 top-4 rounded-full p-1.5 hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>

              <div className="flex items-center gap-4 mb-6">
                 {selectedStudent.avatar_url ? (
                   <img src={`http://127.0.0.1:5001/${selectedStudent.avatar_url}`} alt="Avatar" className="h-16 w-16 rounded-full object-cover border-2 border-primary/20" />
                 ) : (
                   <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-xl font-bold text-primary">
                     {selectedStudent.name.charAt(0)}
                   </div>
                 )}
                 <div>
                   <h2 className="text-xl font-bold text-foreground">{selectedStudent.name}</h2>
                   <p className="text-sm font-medium text-muted-foreground">{selectedStudent.roll_no} • {selectedStudent.email}</p>
                 </div>
              </div>

              {/* Success Guardian AI Assessment */}
              <div className={`p-4 rounded-xl border mb-6 ${riskScore?.risk_level === 'HIGH RISK' ? 'bg-destructive/10 border-destructive/20' : riskScore?.risk_level === 'MEDIUM RISK' ? 'bg-warning/10 border-warning/20' : 'bg-success/10 border-success/20'}`}>
                <h3 className="flex items-center gap-2 font-bold mb-2 text-foreground">
                  <Brain className="h-5 w-5" /> Success Guardian AI Assessment
                </h3>
                {riskLoading ? (
                  <p className="text-sm text-muted-foreground animate-pulse">Running heuristic analysis...</p>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong className="font-semibold">Predicted Risk Score:</strong> {riskScore?.risk_score}/100 
                      <span className="ml-2 px-2 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-background/50">{riskScore?.risk_level}</span>
                    </p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      AI determined this score using overall attendance ({riskScore?.attendance_percentage}%) and average performance aggregate ({riskScore?.average_marks}%).
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border p-3 text-center bg-muted/30">
                  <Activity className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xl font-bold">{selectedStudent.attPct}%</p>
                  <p className="text-xs text-muted-foreground">Class Attendance</p>
                </div>
                <div className="rounded-lg border border-border p-3 text-center bg-muted/30">
                  <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
                  <p className="text-xl font-bold">{selectedStudent.latestMarks?.grade || 'N/A'}</p>
                  <p className="text-xs text-muted-foreground">Latest Grade</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
