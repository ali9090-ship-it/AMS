import { useState } from "react";
import { Search, Eye, Download, FileText as FileIcon, Upload, AlertTriangle, X } from "lucide-react";
import { PageTransition, AnimatedCard } from "@/components/animations";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch, apiUpload } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

export default function NotesPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState("All");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ title: "", subject: "Machine Learning", category: "Notes", file: null as File | null, semester: 1 });
  const [agreed, setAgreed] = useState(false);

  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: () => apiFetch('/api/courses'), enabled: !!user });
  const { data: notesRaw = [] } = useQuery({ queryKey: ['notes'], queryFn: () => apiFetch('/api/notes'), enabled: !!user });

  const subjects = ["All", ...Array.from(new Set(courses.map((c: any) => c.name)))];

  const resources = notesRaw.map((n: any) => ({
    id: n.id,
    title: n.title,
    subject: n.subject || 'Unknown',
    uploadedBy: n.uploader_name || 'Teacher',
    date: new Date(n.created_at).toLocaleDateString(),
    type: n.file_type ? n.file_type.toUpperCase() : 'DOC',
    category: n.description || 'Notes',
    fileUrl: n.file_path ? (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001') + '/' + n.file_path : '#'
  }));

  const filtered = resources.filter((r: any) =>
    (subject === "All" || r.subject === subject) &&
    (search === "" || r.title.toLowerCase().includes(search.toLowerCase()))
  );

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiUpload('/api/notes', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      setShowUpload(false);
      setUploadForm({ title: "", subject: courses.length ? courses[0].name : "", category: "Notes", file: null, semester: 1 });
      setAgreed(false);
    }
  });

  const handleUpload = () => {
    if (!uploadForm.title.trim() || !uploadForm.file || !agreed) return;
    const formData = new FormData();
    formData.append('title', uploadForm.title);
    formData.append('subject', uploadForm.subject);
    formData.append('description', uploadForm.category);
    formData.append('file', uploadForm.file);
    
    if (courses.length > 0) {
      const c = courses.find((cx: any) => cx.name === uploadForm.subject);
      if (c) {
        formData.append('branch', c.branch);
        formData.append('semester', c.semester.toString());
      }
    }
    // Fallback or override with form semester if needed
    if (!formHasBranchAndSem(uploadForm)) {
       formData.append('semester', uploadForm.semester.toString());
    }
    
    uploadMutation.mutate(formData);
  };

  const formHasBranchAndSem = (f: any) => {
    return courses.some((cx: any) => cx.name === f.subject);
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Notes & Resources</h1>
          <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
        </div>
        {user?.role !== 'student' && (
          <motion.button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Upload className="h-4 w-4" />
            Upload Notes
          </motion.button>
        )}
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUpload && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative mx-4 w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button onClick={() => setShowUpload(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-bold text-foreground">Upload Notes / Resources</h2>
              <div className="mt-1 h-1 w-10 rounded-full bg-primary" />

              <div className="mt-5 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">Title</label>
                  <input
                    value={uploadForm.title}
                    onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Unit 4 - Regression Notes"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">Subject</label>
                    <select
                      value={uploadForm.subject}
                      onChange={e => setUploadForm(f => ({ ...f, subject: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {subjects.filter(s => s !== "All").map((s: any, i) => <option key={i}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">Category</label>
                    <select
                      value={uploadForm.category}
                      onChange={e => setUploadForm(f => ({ ...f, category: e.target.value }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                    >
                      {["Notes", "Slides", "Reference", "Assignment", "Practice"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-muted-foreground">Semester</label>
                    <input
                      type="number"
                      min={1}
                      max={8}
                      value={uploadForm.semester}
                      onChange={e => setUploadForm(f => ({ ...f, semester: parseInt(e.target.value) }))}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">File</label>
                  <input
                    type="file"
                    accept=".pdf,.docx,.pptx,.xlsx,.txt,.zip,.jpg,.png"
                    onChange={e => setUploadForm(f => ({ ...f, file: e.target.files?.[0] || null }))}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground file:mr-3 file:rounded file:border-0 file:bg-primary/10 file:px-2 file:py-1 file:text-xs file:font-medium file:text-primary"
                  />
                </div>

                <div className="rounded-lg border border-warning/40 bg-warning/10 p-3">
                  <div className="mb-2 flex items-start gap-2">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                    <p className="text-xs font-semibold text-foreground">Copyright & Terms of Use</p>
                  </div>
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    By uploading notes or resources, you confirm that you are the original author or have
                    proper authorization to share this material. You take full responsibility for any
                    copyright infringement.
                  </p>
                  <label className="mt-3 flex cursor-pointer items-start gap-2">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={e => setAgreed(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-border accent-primary"
                    />
                    <span className="text-xs font-medium text-foreground">
                      I agree to the terms & conditions and accept full responsibility for this upload.
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!uploadForm.title.trim() || !uploadForm.file || !agreed || uploadMutation.isPending}
                  className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploadMutation.isPending ? 'Uploading...' : 'Upload Resource'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={subject}
          onChange={e => setSubject(e.target.value)}
          className="rounded-lg border border-border bg-card px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {subjects.map((s: any, i) => <option key={i}>{s}</option>)}
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">No notes available.</p>
        ) : filtered.map((r: any, i: number) => (
          <AnimatedCard key={i} index={i} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="mb-3 flex items-start justify-between">
              <div className="flex items-center gap-2">
                <FileIcon className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">{r.title}</h3>
              </div>
              <span className="shrink-0 rounded bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-accent-foreground">{r.type}</span>
            </div>
            <p className="text-xs text-muted-foreground">{r.subject} · {r.uploadedBy}</p>
            <p className="text-xs text-muted-foreground">{r.date}</p>
            <div className="mt-3 flex items-center justify-between">
              <span className="rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{r.category}</span>
              <div className="flex gap-2">
                <a href={r.fileUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-primary">
                  <Eye className="h-4 w-4" />
                </a>
                <a href={r.fileUrl} download className="flex items-center justify-center rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-primary">
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>
    </PageTransition>
  );
}
