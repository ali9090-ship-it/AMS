import { Settings, Megaphone, Send, Loader2 } from "lucide-react";
import { PageTransition, AnimatedCard } from "@/components/animations";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettingsPage() {
  const [showAnnounce, setShowAnnounce] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", type: "General" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const announceMutation = useMutation({
    mutationFn: (data: any) => apiFetch('/api/announcements', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      toast({ title: "Broadcast Sent", description: "Your announcement is now live for all users." });
      setForm({ title: "", body: "", type: "General" });
      setShowAnnounce(false);
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: (err: any) => toast({ title: "Error", description: err.message, variant: "destructive" })
  });

  const handleAnnounce = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.body) return;
    announceMutation.mutate(form);
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Portal Settings</h1>
          <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
          <p className="mt-1 text-sm text-muted-foreground">Manage institution-wide configurations and communication.</p>
        </div>
        <button 
          onClick={() => setShowAnnounce(!showAnnounce)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/95 transition-all shadow-lg shadow-primary/20"
        >
          <Megaphone className="h-4 w-4" /> Post Announcement
        </button>
      </div>

      {showAnnounce && (
        <AnimatedCard className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-6 shadow-sm">
          <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" /> Broadcast New Announcement
          </h2>
          <form onSubmit={handleAnnounce} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Announcement Title</label>
                <input 
                  value={form.title}
                  onChange={e => setForm({...form, title: e.target.value})}
                  placeholder="e.g. Mid-Semester Exams Update"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Type / Category</label>
                <select 
                  value={form.type}
                  onChange={e => setForm({...form, type: e.target.value})}
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option>General</option>
                  <option>Notice</option>
                  <option>Exam</option>
                  <option>Event</option>
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Message Content</label>
              <textarea 
                value={form.body}
                onChange={e => setForm({...form, body: e.target.value})}
                placeholder="Type the announcement details here..."
                rows={4}
                className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button 
                type="button"
                onClick={() => setShowAnnounce(false)}
                className="px-6 py-2.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={announceMutation.isPending}
                className="flex items-center gap-2 rounded-xl bg-primary px-8 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/10 hover:bg-primary/95 disabled:opacity-50"
              >
                {announceMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Publish Announcement
              </button>
            </div>
          </form>
        </AnimatedCard>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { title: "Institution Info", desc: "College name, address, and official links." },
          { title: "Academic Calendar", desc: "Manage semester dates and holidays." },
          { title: "User Permissions", desc: "Configure global role-based access limits." },
          { title: "System Logs", desc: "View detailed audit trails of administrative actions." },
        ].map((s, i) => (
          <AnimatedCard key={i} index={i} className="group rounded-xl border border-border bg-card p-5 shadow-sm cursor-pointer hover:border-primary/30 transition-all">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <Settings className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-extrabold text-foreground group-hover:text-primary transition-colors">{s.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground font-medium">{s.desc}</p>
          </AnimatedCard>
        ))}
      </div>
    </PageTransition>
  );
}
