import { useState, useEffect } from "react";
import { Check, X as XIcon, Loader2 } from "lucide-react";
import { PageTransition, AnimatedCard, StaggerContainer, AnimatedListItem } from "@/components/animations";
import { motion } from "framer-motion";
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';

export default function TeacherAttendancePage() {
  const [course, setCourse] = useState("");
  const [date] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});

  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: () => apiFetch('/api/courses') });
  
  const { data: students = [], isLoading: loadingStudents } = useQuery({ 
    queryKey: ['courses', course, 'students'], 
    queryFn: () => apiFetch(`/api/courses/${course}/students`),
    enabled: !!course
  });

  // Patch 2: Check if attendance already exists for today
  const { data: existingAttendance = [] } = useQuery({
    queryKey: ['attendance', 'course', course, date],
    queryFn: () => apiFetch(`/api/attendance/course/${course}?date=${date}`),
    enabled: !!course && !!date
  });


  useEffect(() => {
    if (courses.length > 0 && !course) {
      setCourse(courses[0].id.toString());
    }
  }, [courses, course]);

  const toggle = (studentId: string) => {
    setAttendance((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const markAll = (status: boolean) => {
    const all: Record<string, boolean> = {};
    students.forEach((s: any) => (all[s.id.toString()] = status));
    setAttendance(all);
  };

  const markMutation = useMutation({
    mutationFn: (data: any) => apiFetch('/api/attendance/mark', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      alert("Attendance marked successfully");
    },
    onError: (err: any) => {
      alert(err.message || "Failed to save attendance");
    }
  });

  const handleSubmit = () => {
    if (!course) return;

    const studentsData = students.map((s: any) => ({
      student_id: s.id,
      status: attendance[s.id.toString()] ? 'Present' : 'Absent'
    }));
    
    markMutation.mutate({ 
      course_id: parseInt(course), 
      date, 
      students: studentsData
    });
  };

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Mark Attendance</h1>
        <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
      </div>

      <div className="flex flex-wrap gap-4">
        <select
          value={course}
          onChange={(e) => setCourse(e.target.value)}
          className="h-10 rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {courses.map((c: any) => (
            <option key={c.id} value={c.id.toString()}>{c.code} – {c.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-2 h-10 rounded-xl border border-input bg-background px-4">
          <span className="text-xs text-muted-foreground">Date:</span>
          <span className="text-sm font-medium">{date}</span>
        </div>
        
      </div>

      <AnimatedCard className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <h2 className="text-sm font-semibold text-foreground">Student List</h2>
          <div className="flex gap-2">
            <motion.button
              onClick={() => markAll(true)}
              disabled={false}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors bg-accent text-accent-foreground hover:bg-primary hover:text-primary-foreground`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Mark All Present
            </motion.button>
            <motion.button
              onClick={() => markAll(false)}
              disabled={false}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Mark All Absent
            </motion.button>
          </div>
        </div>
        <StaggerContainer className="divide-y divide-border">
          {loadingStudents ? (
            <div className="flex flex-col items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary/50" />
              <p className="mt-2 text-xs text-muted-foreground">Loading enrolled students...</p>
            </div>
          ) : students.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-muted-foreground font-medium">No students enrolled in this course.</p>
            </div>
          ) : students.map((s: any) => {
            const isPresent = attendance[s.id.toString()] ?? false;
            return (
              <AnimatedListItem key={s.id}>
                <div className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.roll_no || '-'}</p>
                  </div>
                  <motion.button
                    onClick={() => toggle(s.id.toString())}
                    className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      isPresent
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                    whileTap={{ scale: 0.95 }}
                    layout
                  >
                    {isPresent ? <Check className="h-3 w-3" /> : <XIcon className="h-3 w-3" />}
                    {isPresent ? "Present" : "Absent"}
                  </motion.button>
                </div>
              </AnimatedListItem>
            );
          })}
        </StaggerContainer>
        <div className="border-t border-border px-5 py-3 flex gap-4 items-center">
          <motion.button
            onClick={handleSubmit}
            disabled={markMutation.isPending}
            className="rounded-xl bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {markMutation.isPending ? 'Submitting...' : 'Submit Attendance'}
          </motion.button>
          {markMutation.isSuccess && <span className="text-sm text-success">Attendance saved!</span>}
        </div>
      </AnimatedCard>
    </PageTransition>
  );
}
