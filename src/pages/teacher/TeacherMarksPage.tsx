import { useState, useEffect } from "react";
import { PageTransition, AnimatedCard, StaggerContainer, AnimatedListItem } from "@/components/animations";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Loader2, Edit, Save, X } from "lucide-react";
import { toast } from "sonner";

export default function TeacherMarksPage() {
  const queryClient = useQueryClient();
  const [courseId, setCourseId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  
  const [form, setForm] = useState({
    internal: 0,
    midSem: 0,
    endSem: 0,
    semester: 1
  });

  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: () => apiFetch('/api/courses') });
  
  useEffect(() => {
    if (courses.length > 0 && !courseId) {
      setCourseId(courses[0].id.toString());
    }
  }, [courses, courseId]);

  const { data: students = [], isLoading: loadingStudents } = useQuery({ 
    queryKey: ['courses', courseId, 'students'], 
    queryFn: () => apiFetch(`/api/courses/${courseId}/students`),
    enabled: !!courseId 
  });

  const { data: resultsRaw = [] } = useQuery({ 
    queryKey: ['results', 'course', courseId], 
    queryFn: () => apiFetch(`/api/results/course/${courseId}`),
    enabled: !!courseId
  });

  const upateMarksMutation = useMutation({
    mutationFn: (data: any) => apiFetch('/api/results/add', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results', 'course', courseId] });
      setShowModal(false);
      toast.success("Marks updated successfully");
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleEdit = (student: any) => {
    setSelectedStudent(student);
    const studentResults = resultsRaw.filter((r: any) => r.student_id === student.id);
    setForm({
      internal: studentResults.find((r: any) => r.exam_type === 'Internal')?.marks_obtained || 0,
      midSem: studentResults.find((r: any) => r.exam_type === 'Mid-Sem')?.marks_obtained || 0,
      endSem: studentResults.find((r: any) => r.exam_type === 'End-Sem')?.marks_obtained || 0,
      semester: courses.find((c: any) => c.id.toString() === courseId)?.semester || 1
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const courseObj = courses.find((c: any) => c.id.toString() === courseId);
    
    // Matrix Rule: Submit 3 separate records for each type if you want exact tracking, 
    // but the backend implementation usually expects one or separate calls.
    // Given our backend add_result logic, we should send individual records.
    
    const submissions = [
      { type: 'Internal', marks: form.internal, total: 30 },
      { type: 'Mid-Sem', marks: form.midSem, total: 25 },
      { type: 'End-Sem', marks: form.endSem, total: 70 }
    ];

    submissions.forEach(sub => {
      upateMarksMutation.mutate({
        student_id: selectedStudent.id,
        course_id: parseInt(courseId),
        semester: form.semester,
        exam_type: sub.type,
        marks_obtained: sub.marks,
        total_marks: sub.total
      });
    });
  };

  const getStudentDisplayData = (studentId: number) => {
    const studentResults = resultsRaw.filter((r: any) => r.student_id === studentId);
    const internal = studentResults.find((r: any) => r.exam_type === 'Internal')?.marks_obtained || 0;
    const midSem = studentResults.find((r: any) => r.exam_type === 'Mid-Sem')?.marks_obtained || 0;
    const endSem = studentResults.find((r: any) => r.exam_type === 'End-Sem')?.marks_obtained || 0;
    const total = internal + midSem + endSem;
    
    // Rough grade for table display
    const perc = (total / 125) * 100;
    let grade = 'F';
    if (perc >= 90) grade = 'A+';
    else if (perc >= 80) grade = 'A';
    else if (perc >= 70) grade = 'B+';
    else if (perc >= 60) grade = 'B';
    else if (perc >= 50) grade = 'C';
    else if (perc >= 40) grade = 'D';

    return { internal, midSem, endSem, total, grade };
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Marks / Examinations</h1>
          <p className="mt-1 text-sm text-muted-foreground font-medium">Manage student grades and exam performance.</p>
          <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
        </div>
        <select
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          className="h-10 rounded-xl border border-input bg-background px-4 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {courses.map((c: any) => (
            <option key={c.id} value={c.id.toString()}>{c.code} – {c.name}</option>
          ))}
        </select>
      </div>

      <AnimatedCard className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-5 py-4 font-bold text-foreground uppercase tracking-wider text-[10px]">Roll No</th>
                <th className="px-5 py-4 font-bold text-foreground uppercase tracking-wider text-[10px]">Student Name</th>
                <th className="px-5 py-4 font-bold text-foreground uppercase tracking-wider text-[10px]">Internal (30)</th>
                <th className="px-5 py-4 font-bold text-foreground uppercase tracking-wider text-[10px]">Mid-Sem (25)</th>
                <th className="px-5 py-4 font-bold text-foreground uppercase tracking-wider text-[10px]">End-Sem (70)</th>
                <th className="px-5 py-4 font-bold text-foreground uppercase tracking-wider text-[10px]">Total (125)</th>
                <th className="px-5 py-4 font-bold text-foreground uppercase tracking-wider text-[10px]">Grade</th>
                <th className="px-5 py-4 font-bold text-foreground uppercase tracking-wider text-[10px] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loadingStudents ? (
                <tr>
                  <td colSpan={8} className="text-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary/50" />
                    <p className="mt-2 text-xs text-muted-foreground font-medium">Fetching class list...</p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-20">
                    <p className="text-sm text-muted-foreground font-medium">No students enrolled in this course.</p>
                  </td>
                </tr>
              ) : (
                students.map((s: any, i: number) => {
                  const data = getStudentDisplayData(s.id);
                  return (
                    <motion.tr
                      key={s.id}
                      className="transition-colors hover:bg-muted/30 group"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{s.roll_no || '—'}</td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-foreground">{s.name}</div>
                        <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">{s.email}</div>
                      </td>
                      <td className="px-5 py-4 font-medium text-foreground">{data.internal}</td>
                      <td className="px-5 py-4 font-medium text-foreground">{data.midSem}</td>
                      <td className="px-5 py-4 font-medium text-foreground">{data.endSem}</td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-primary">{data.total}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          data.grade === 'F' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                        }`}>
                          {data.grade}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <button 
                          onClick={() => handleEdit(s)}
                          className="rounded-lg p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AnimatedCard>

      {/* Edit Marks Modal */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <motion.div 
            className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Entry: {selectedStudent.name}</h2>
                <p className="text-xs text-muted-foreground font-medium uppercase mt-1">Roll No: {selectedStudent.roll_no || 'N/A'}</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="rounded-full p-2 hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="mb-1.5 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Semester</label>
                  <input 
                    type="number"
                    value={form.semester}
                    onChange={e => setForm({...form, semester: parseInt(e.target.value)})}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Internal (Max 30)</label>
                  <input 
                    type="number"
                    max={30}
                    value={form.internal}
                    onChange={e => setForm({...form, internal: parseFloat(e.target.value)})}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Mid-Sem (Max 25)</label>
                  <input 
                    type="number"
                    max={25}
                    value={form.midSem}
                    onChange={e => setForm({...form, midSem: parseFloat(e.target.value)})}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-1.5 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">End-Sem (Max 70)</label>
                  <input 
                    type="number"
                    max={70}
                    value={form.endSem}
                    onChange={e => setForm({...form, endSem: parseFloat(e.target.value)})}
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl border border-border h-12 text-sm font-bold hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={upateMarksMutation.isPending}
                  className="flex-1 rounded-xl bg-primary h-12 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  <div className="flex items-center justify-center gap-2">
                    {upateMarksMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    {upateMarksMutation.isPending ? "Saving..." : "Save Marks"}
                  </div>
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </PageTransition>
  );
}
