import { PageTransition, AnimatedCard } from "@/components/animations";
import { motion } from "framer-motion";
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export default function ResultsPage() {
  const { data: resultsRaw } = useQuery({ queryKey: ['results', 'my'], queryFn: () => apiFetch('/api/results/my') });

  const records = resultsRaw?.records || (Array.isArray(resultsRaw) ? resultsRaw : []);
  const cgpa = resultsRaw?.cgpa || 0;
  const semesters = resultsRaw?.semesters || {};

  const results = records.map((r: any) => ({
    exam: r.exam_type,
    subject: r.course_name || 'Unknown',
    marks: `${Math.round(r.marks_obtained)}/${Math.round(r.total_marks)}`,
    grade: r.grade,
    status: r.grade === 'F' ? 'Fail' : 'Pass',
    semester: r.semester
  }));

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Results</h1>
        <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
      </div>

      {/* CGPA Display */}
      {cgpa > 0 && (
        <AnimatedCard className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Overall CGPA</p>
              <p className="text-3xl font-bold text-primary">{cgpa.toFixed(2)}</p>
            </div>
            {Object.keys(semesters).length > 0 && (
              <div className="ml-8 flex gap-4">
                {Object.values(semesters).map((sem: any) => (
                  <div key={sem.semester} className="text-center">
                    <p className="text-xs text-muted-foreground">Sem {sem.semester}</p>
                    <p className="text-sm font-semibold text-foreground">{sem.sgpa}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </AnimatedCard>
      )}

      <AnimatedCard className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left font-semibold text-foreground">Exam</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Subject</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Marks</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Grade</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-3 text-center text-muted-foreground">No results found</td></tr>
            ) : results.map((r: any, i: number) => (
              <motion.tr
                key={i}
                className="border-b border-border transition-colors last:border-0 hover:bg-muted/30"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <td className="px-4 py-3 text-muted-foreground">{r.exam}</td>
                <td className="px-4 py-3 font-medium text-foreground">{r.subject}</td>
                <td className="px-4 py-3 text-foreground">{r.marks}</td>
                <td className="px-4 py-3">
                  <span className="rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">{r.grade}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${r.status === 'Pass' ? 'bg-accent text-accent-foreground' : 'bg-destructive/10 text-destructive'}`}>{r.status}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </AnimatedCard>
    </PageTransition>
  );
}
