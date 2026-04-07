import { useState } from "react";
import { MessageSquare, Send, CheckCircle, Star, Loader2 } from "lucide-react";
import { PageTransition, AnimatedCard } from "@/components/animations";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { toast } from "sonner";

export default function StudentFeedbackPage() {
  const [courseId, setCourseId] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: courses = [], isLoading: loadingCourses } = useQuery({ 
    queryKey: ['my_courses'], 
    queryFn: () => apiFetch('/api/courses') 
  });

  const mutation = useMutation({
    mutationFn: (data: any) => apiFetch('/api/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Feedback submitted successfully");
      setTimeout(() => {
        setComment("");
        setSubmitted(false);
      }, 3000);
    },
    onError: (err: any) => toast.error(err.message)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !courseId) {
      toast.error("Please select a course and provide feedback");
      return;
    }
    mutation.mutate({ course_id: parseInt(courseId), rating, comment, is_anonymous: anonymous });
  };

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Course Feedback</h1>
        <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
        <p className="mt-2 text-sm text-muted-foreground">Help us improve by providing constructive feedback on your courses.</p>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-success/30 bg-success/5 p-12 text-center"
          >
            <div className="h-16 w-16 bg-success/20 rounded-full flex items-center justify-center mb-2">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <p className="text-xl font-bold text-foreground">Thank you!</p>
            <p className="text-sm text-muted-foreground max-w-xs">Your valuable feedback helps us maintain high academic standards.</p>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="rounded-2xl border border-border bg-card p-8 shadow-sm"
          >
            <h2 className="mb-6 flex items-center gap-2 text-base font-semibold text-foreground">
              <MessageSquare className="h-4 w-4 text-primary" /> Share your experience
            </h2>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Course</label>
                {loadingCourses ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                ) : (
                  <select
                    required
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none"
                  >
                    <option value="">Choose a subject...</option>
                    {courses.map((c: any) => (
                      <option key={c.id} value={c.id.toString()}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 transition-all hover:scale-110 ${star <= rating ? 'text-primary' : 'text-muted'}`}
                    >
                      <Star className={`h-6 w-6 ${star <= rating ? 'fill-primary' : ''}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Constructive Feedback</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="What went well? What could be improved? (e.g. pace of teaching, course content, lab facilities...)"
                  className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className={`flex h-5 w-5 items-center justify-center rounded border transition-all ${anonymous ? 'bg-primary border-primary' : 'border-input group-hover:border-primary'}`}>
                    {anonymous && <CheckCircle className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <input
                    type="checkbox"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="hidden"
                  />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-tighter">Submit Anonymously</span>
                </label>

                <motion.button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex items-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  SEND FEEDBACK
                </motion.button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </PageTransition>
  );
}
