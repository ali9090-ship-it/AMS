import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { 
  BookOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Users, 
  X, 
  Loader2,
  CheckCircle2,
  GraduationCap
} from "lucide-react";
import { toast } from "sonner";
import { UserRole } from "@/lib/auth";

interface Course {
  id: number;
  name: string;
  code: string;
  teacher_id: number;
  teacher: {
    id: number;
    name: string;
  } | null;
  branch: string;
  semester: number;
  credits: number;
  schedule: string;
}

interface RegisteredUser {
  id: number;
  name: string;
  email: string;
  role: string;
  branch: string;
  status: string;
}

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  
  // Enrollment state
  const [studentSearch, setStudentSearch] = useState("");

  // Queries
  const { data: courses = [], isLoading: loadingCourses } = useQuery<Course[]>({ 
    queryKey: ['courses'], 
    queryFn: () => apiFetch('/api/courses') 
  });

  const { data: teachers = [] } = useQuery<RegisteredUser[]>({ 
    queryKey: ['users', 'teacher'], 
    queryFn: () => apiFetch('/api/users?role=teacher') 
  });

  const { data: students = [] } = useQuery<RegisteredUser[]>({ 
    queryKey: ['users', 'student'], 
    queryFn: () => apiFetch('/api/users?role=student') 
  });

  const { data: enrolledStudents = [], isLoading: loadingEnrollments } = useQuery<RegisteredUser[]>({
    queryKey: ['courses', selectedCourse?.id, 'students'],
    queryFn: () => apiFetch(`/api/courses/${selectedCourse?.id}/students`),
    enabled: !!selectedCourse
  });

  // Form state
  const [form, setForm] = useState({
    name: "",
    code: "",
    teacher_id: "",
    branch: "CSE",
    semester: 1,
    credits: 4,
    schedule: ""
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: any) => apiFetch('/api/courses', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowModal(false);
      toast.success("Course created successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to create course")
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => 
      apiFetch(`/api/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      setShowModal(false);
      toast.success("Course updated successfully");
    },
    onError: (err: any) => toast.error(err.message || "Failed to update course")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiFetch(`/api/courses/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success("Course deleted successfully");
    }
  });

  const enrollMutation = useMutation({
    mutationFn: ({ courseId, studentId }: { courseId: number, studentId: number }) => 
      apiFetch(`/api/courses/${courseId}/enroll`, { method: 'POST', body: JSON.stringify({ student_id: studentId }) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', selectedCourse?.id, 'students'] });
      toast.success("Student enrolled");
    }
  });

  const unenrollMutation = useMutation({
    mutationFn: ({ courseId, studentId }: { courseId: number, studentId: number }) => 
      apiFetch(`/api/courses/${courseId}/enroll/${studentId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', selectedCourse?.id, 'students'] });
      toast.success("Student removed");
    }
  });

  const enrollBulkMutation = useMutation({
    mutationFn: ({ courseId, studentIds }: { courseId: number, studentIds: number[] }) => 
      apiFetch(`/api/courses/${courseId}/enroll-bulk`, { method: 'POST', body: JSON.stringify({ student_ids: studentIds }) }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['courses', selectedCourse?.id, 'students'] });
      toast.success(res.message || "Bulk enrollment complete");
    },
    onError: (err: any) => toast.error(err.message || "Bulk enrollment failed")
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, teacher_id: parseInt(form.teacher_id), semester: parseInt(form.semester as any), credits: parseInt(form.credits as any) };
    if (editCourse) {
      updateMutation.mutate({ id: editCourse.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const openAdd = () => {
    setEditCourse(null);
    setForm({ name: "", code: "", teacher_id: teachers[0]?.id.toString() || "", branch: "CSE", semester: 1, credits: 4, schedule: "" });
    setShowModal(true);
  };

  const openEdit = (course: Course) => {
    setEditCourse(course);
    setForm({
      name: course.name,
      code: course.code,
      teacher_id: course.teacher_id?.toString() || "",
      branch: course.branch,
      semester: course.semester,
      credits: course.credits,
      schedule: course.schedule
    });
    setShowModal(true);
  };

  const openEnroll = (course: Course) => {
    setSelectedCourse(course);
    setShowEnrollModal(true);
  };

  const filtered = courses.filter(c => 
    c.name.toLowerCase().includes(query.toLowerCase()) || 
    c.code.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Course Management</h1>
          <p className="text-muted-foreground text-sm">Create courses, assign teachers, and enroll students.</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add New Course
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search courses by name or code..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-card px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 font-semibold">Course Details</th>
                <th className="px-4 py-3 font-semibold">Teacher</th>
                <th className="px-4 py-3 font-semibold">Branch/Sem</th>
                <th className="px-4 py-3 font-semibold">Credits</th>
                <th className="px-4 py-3 font-semibold">Schedule</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loadingCourses ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin mb-2" />
                    Loading courses...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    No courses found.
                  </td>
                </tr>
              ) : (
                filtered.map((course) => (
                  <tr key={course.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4">
                      <div className="font-semibold">{course.name}</div>
                      <div className="text-xs text-muted-foreground font-mono uppercase">{course.code}</div>
                    </td>
                    <td className="px-4 py-4">
                      {course.teacher ? (
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                            {course.teacher.name.charAt(0)}
                          </div>
                          <span>{course.teacher.name}</span>
                        </div>
                      ) : (
                        <span className="text-destructive text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium">{course.branch}</div>
                      <div className="text-xs text-muted-foreground">Semester {course.semester}</div>
                    </td>
                    <td className="px-4 py-4">{course.credits}</td>
                    <td className="px-4 py-4 text-xs font-medium">{course.schedule || "Not set"}</td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEnroll(course)}
                          title="Assign Students"
                          className="flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-xs font-bold text-primary hover:bg-primary/20 transition-colors"
                        >
                          <Users className="h-3.5 w-3.5" />
                          <span>Enroll</span>
                        </button>
                        <button
                          onClick={() => openEdit(course)}
                          title="Edit"
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this course and all enrollments?")) {
                              deleteMutation.mutate(course.id);
                            }
                          }}
                          title="Delete"
                          className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editCourse ? "Edit Course" : "Add New Course"}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">Course Name</label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Data Structures & Algorithms"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">Course Code</label>
                  <input
                    required
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 font-mono"
                    placeholder="e.g. CS301"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">Assign Teacher</label>
                  <select
                    value={form.teacher_id}
                    onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">Branch</label>
                  <select
                    value={form.branch}
                    onChange={(e) => setForm({ ...form, branch: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="CSE">CSE</option>
                    <option value="CE">CE</option>
                    <option value="IT">IT</option>
                    <option value="AIML">AIML</option>
                    <option value="EXTC">EXTC</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">Semester</label>
                  <input
                    type="number"
                    min={1}
                    max={8}
                    value={form.semester}
                    onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">Credits</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={form.credits}
                    onChange={(e) => setForm({ ...form, credits: parseInt(e.target.value) })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase">Schedule</label>
                  <input
                    type="text"
                    value={form.schedule}
                    onChange={(e) => setForm({ ...form, schedule: e.target.value })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="e.g. Mon 10:00 - 12:00"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {editCourse ? "Save Changes" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Students Modal */}
      {showEnrollModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[90vh] flex flex-col">
            <div className="mb-4 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl font-bold">Enroll Students</h2>
                <p className="text-sm text-muted-foreground font-medium uppercase tracking-tighter">
                  {selectedCourse.name} ({selectedCourse.code})
                </p>
              </div>
              <button 
                onClick={() => setShowEnrollModal(false)}
                className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4 shrink-0">
              <button
                onClick={() => enrollBulkMutation.mutate({ courseId: selectedCourse.id, studentIds: students.map(s => s.id) })}
                disabled={enrollBulkMutation.isPending}
                className="flex-1 rounded-lg bg-accent/20 border border-accent/30 py-2 text-[10px] font-bold text-accent-foreground hover:bg-accent/30 transition-all uppercase tracking-widest"
              >
                Enroll All ({students.length})
              </button>
              <button
                onClick={() => enrollBulkMutation.mutate({ courseId: selectedCourse.id, studentIds: students.filter(s => s.branch === selectedCourse.branch).map(s => s.id) })}
                disabled={enrollBulkMutation.isPending}
                className="flex-1 rounded-lg bg-primary/10 border border-primary/20 py-2 text-[10px] font-bold text-primary hover:bg-primary/20 transition-all uppercase tracking-widest"
              >
                Enroll {selectedCourse.branch} Only
              </button>
            </div>

            <div className="relative mb-4 shrink-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search students by name or branch..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-muted/50 px-10 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              <div className="grid gap-3">
                {students
                  .filter(s => 
                    s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                    s.branch.toLowerCase().includes(studentSearch.toLowerCase())
                  )
                  .map(student => {
                    const isEnrolled = enrolledStudents.some(es => es.id === student.id);
                    return (
                      <div 
                        key={student.id} 
                        className={`flex items-center justify-between rounded-lg border p-3 transition-all ${
                          isEnrolled ? "bg-primary/5 border-primary/20 shadow-sm" : "bg-card border-border hover:border-muted-foreground/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            isEnrolled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                          }`}>
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{student.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase">{student.branch} • {student.email}</p>
                          </div>
                        </div>
                        {isEnrolled ? (
                          <button
                            onClick={() => unenrollMutation.mutate({ courseId: selectedCourse.id, studentId: student.id })}
                            className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-[10px] font-bold text-success hover:bg-destructive/10 hover:text-destructive transition-all border border-success/20 group"
                          >
                            <span className="group-hover:hidden flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Enrolled
                            </span>
                            <span className="hidden group-hover:inline flex items-center gap-1">
                              <X className="h-3 w-3" /> Remove
                            </span>
                          </button>
                        ) : (
                          <button
                            onClick={() => enrollMutation.mutate({ courseId: selectedCourse.id, studentId: student.id })}
                            className="rounded-full bg-muted px-3 py-1 text-[10px] font-bold text-muted-foreground transition-all hover:bg-primary hover:text-primary-foreground"
                          >
                            Enroll Now
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border shrink-0 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                Showing {students.length} students total
              </span>
              <button
                onClick={() => setShowEnrollModal(false)}
                className="rounded-lg bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
