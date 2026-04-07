import { PageTransition, StaggerContainer, AnimatedListItem } from "@/components/animations";
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { Loader2, Bell, Info, AlertTriangle, Calendar, MessageSquare, X } from "lucide-react";
import { useState } from "react";

const typeIconMap: Record<string, any> = {
  General: Bell,
  Notice: Info,
  Exam: AlertTriangle,
  Event: Calendar,
};

export default function NotificationsPage() {
  const { data: announcements = [], isLoading } = useQuery({ 
    queryKey: ['announcements'], 
    queryFn: () => apiFetch('/api/announcements') 
  });
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} mins ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hours ago`;
    return date.toLocaleDateString();
  };

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
        <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
        <p className="mt-1 text-sm text-muted-foreground">Stay updated with college announcements.</p>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
            <p className="mt-4 text-sm text-muted-foreground font-medium">Fetching announcements...</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="py-20 text-center">
            <Bell className="mx-auto h-10 w-10 text-muted-foreground/20" />
            <p className="mt-4 text-sm text-muted-foreground">No notifications yet.</p>
          </div>
        ) : (
          <StaggerContainer>
            {announcements.map((a: any, i: number) => {
              const Icon = typeIconMap[a.type] || Bell;
              const isRecent = (new Date().getTime() - new Date(a.created_at).getTime()) < 86400000;
              
              return (
                <AnimatedListItem key={a.id}>
                  <div
                    onClick={() => setSelectedUpdate(a)}
                    className={`flex items-start gap-4 border-b border-border px-5 py-5 transition-colors cursor-pointer last:border-0 hover:bg-muted/30 ${
                      isRecent ? "bg-primary/5" : ""
                    }`}
                  >
                    <div className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      a.type === 'Exam' ? 'bg-destructive/10 text-destructive' :
                      a.type === 'Event' ? 'bg-info/10 text-info' :
                      a.type === 'Notice' ? 'bg-success/10 text-success' :
                      'bg-primary/10 text-primary'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm ${isRecent ? "font-bold text-foreground" : "font-semibold text-foreground"}`}>
                          {a.title}
                        </p>
                        <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">
                          {a.type}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed line-clamp-2">{a.content}</p>
                      <p className="mt-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        {getTimeAgo(a.created_at)} • Posted by {a.author_name}
                      </p>
                    </div>
                  </div>
                </AnimatedListItem>
              );
            })}
          </StaggerContainer>
        )}
      </div>

      {/* Notification Modal */}
      {selectedUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Announcement Details</h2>
              </div>
              <button 
                onClick={() => setSelectedUpdate(null)}
                className="rounded-full p-2 hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{selectedUpdate.type} · Posted by {selectedUpdate.author_name}</p>
                <h3 className="text-xl font-bold text-foreground">{selectedUpdate.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">Posted on {new Date(selectedUpdate.created_at).toLocaleDateString()}</p>
              </div>
              <div className="rounded-xl bg-muted/30 p-4 border border-border">
                <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{selectedUpdate.content}</p>
              </div>
              <div className="flex justify-end pt-2">
                <button 
                  onClick={() => setSelectedUpdate(null)}
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
