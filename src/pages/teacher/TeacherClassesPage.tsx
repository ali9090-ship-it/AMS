import { BookOpen, Users, Upload, CheckCircle, Loader2, FileText } from "lucide-react";
import { PageTransition, AnimatedCard } from "@/components/animations";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiUpload } from '@/lib/api';
import { useRef, useState } from "react";
import { toast } from "sonner";

export default function TeacherClassesPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: () => apiFetch('/api/courses') });
  const { data: notes = [] } = useQuery({ queryKey: ['notes'], queryFn: () => apiFetch('/api/notes') });

  const uploadMutation = useMutation({
    mutationFn: async ({ course, file }: { course: any, file: File }) => {
      const fd = new FormData();
      fd.append('title', file.name.split('.').slice(0, -1).join('.') || file.name); // Drop extension for title
      fd.append('subject', course.name);
      fd.append('description', 'Class Notes');
      fd.append('file', file);
      if (course.branch) fd.append('branch', course.branch);
      if (course.semester) fd.append('semester', course.semester.toString());
      return apiUpload('/api/notes', fd);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      toast.success("Notes uploaded successfully");
      setSelectedCourse(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to upload notes");
      setSelectedCourse(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  });

  const handleUploadClick = (course: any) => {
    setSelectedCourse(course);
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedCourse) {
      if (e.target.files[0].size > 50 * 1024 * 1024) {
        toast.error("File is too large. Limit is 50MB.");
        return;
      }
      uploadMutation.mutate({ course: selectedCourse, file: e.target.files[0] });
    }
  };

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Classes</h1>
        <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
        <p className="mt-1 text-sm text-muted-foreground">Manage your assigned classes, attendance, and resources.</p>
      </div>

      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept=".pdf,.doc,.docx,.ppt,.pptx,.zip" 
        onChange={handleFileSelect} 
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.length === 0 ? <p className="text-sm text-muted-foreground">No classes assigned.</p> : courses.map((c: any, i: number) => (
          <AnimatedCard key={i} index={i} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{c.name}</h3>
            <p className="text-xs text-muted-foreground mb-3">{c.code} · Semester {c.semester}</p>

            <div className="mt-3 rounded-lg border border-border bg-muted/10 p-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center justify-between">
                <span>Uploaded Resources</span>
                <span className="bg-primary/10 text-primary px-1.5 rounded">{notes.filter((n: any) => n.subject === c.name).length}</span>
              </p>
              {notes.filter((n: any) => n.subject === c.name).length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic mb-1 py-1 px-2 border border-dashed border-border rounded">No notes uploaded yet.</p>
              ) : (
                <div className="space-y-1 mb-1 max-h-24 overflow-y-auto pr-1">
                  {notes.filter((n: any) => n.subject === c.name).map((n: any) => (
                    <div key={n.id} className="flex items-center justify-between bg-card rounded p-1.5 border border-border group hover:border-primary/50 transition-colors">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <FileText className="h-3 w-3 text-primary shrink-0" />
                        <span className="text-[10px] font-semibold text-foreground truncate">{n.title}</span>
                      </div>
                      <a 
                        href={(import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001') + '/' + n.file_path} 
                        download 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-[9px] font-bold text-muted-foreground hover:text-primary transition-colors ml-2 opacity-0 group-hover:opacity-100"
                      >
                        View
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                <span>Actions</span>
                <div className="h-[1px] flex-1 ml-2 bg-border" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => handleUploadClick(c)}
                  disabled={uploadMutation.isPending && selectedCourse?.id === c.id}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-border py-1.5 text-[11px] font-bold text-foreground transition-colors hover:bg-accent disabled:opacity-50"
                >
                  {uploadMutation.isPending && selectedCourse?.id === c.id ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Upload className="h-3 w-3 text-primary" />
                  )}
                  {uploadMutation.isPending && selectedCourse?.id === c.id ? 'Uploading...' : 'Notes'}
                </button>
                <button 
                  onClick={() => window.location.href = `/teacher/attendance?courseId=${c.id}`}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-primary/10 py-1.5 text-[11px] font-bold text-primary transition-colors hover:bg-primary/20"
                >
                  <CheckCircle className="h-3 w-3" />
                  Attendance
                </button>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </PageTransition>
  );
}
