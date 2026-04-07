import { BookOpen, CalendarCheck, Award, Bell, FileText, Clock, MessageSquare, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PageTransition, AnimatedCard, StaggerContainer, AnimatedListItem } from "@/components/animations";
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedUpdate, setSelectedUpdate] = useState<any>(null);
  
  const { data: attendanceRaw } = useQuery({
    queryKey: ['attendance', 'my'],
    queryFn: () => apiFetch('/api/attendance/my'),
    enabled: !!user && user.role === 'student',
  });
  const attendanceData = attendanceRaw?.records || (Array.isArray(attendanceRaw) ? attendanceRaw : []);

  const { data: announcements = [] } = useQuery({
    queryKey: ['announcements'],
    queryFn: () => apiFetch('/api/announcements'),
  });

  const { data: recentNotes = [] } = useQuery({
    queryKey: ['notes'],
    queryFn: () => apiFetch('/api/notes'),
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['courses'],
    queryFn: () => apiFetch('/api/courses'),
    enabled: !!user,
  });

  const { data: exams = [] } = useQuery({
    queryKey: ['exams', 'schedules'],
    queryFn: () => apiFetch('/api/exams/schedules'),
    enabled: !!user && user.role === 'student',
  });
  
  const { data: resultsRaw } = useQuery({
    queryKey: ['results', 'my'],
    queryFn: () => apiFetch('/api/results/my'),
    enabled: !!user && user.role === 'student',
  });
  const results = resultsRaw?.records || (Array.isArray(resultsRaw) ? resultsRaw : []);
  const cgpa = resultsRaw?.cgpa || 0;

  // Calculate Overall Attendance
  const totalClasses = attendanceData.length;
  const presentClasses = attendanceData.filter((a: any) => a.status === 'Present').length;
  const attendancePercentage = totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;

  // Formatting notes
  const formattedNotes = recentNotes.slice(0,3).map((n: any) => ({
    title: n.title,
    subject: n.subject,
    uploadedBy: n.uploader_name ?? 'Teacher',
    date: new Date(n.created_at).toLocaleDateString(),
  }));

  const formattedAnnouncements = announcements.slice(0,5).map((a: any) => ({
    title: a.title,
    date: new Date(a.created_at).toLocaleDateString(),
    type: a.type,
    content: a.content,
  }));

  // Group attendance by month for the chart
  const monthlyAttendance = attendanceData.reduce((acc: any, curr: any) => {
    const month = new Date(curr.date).toLocaleString('default', { month: 'short' });
    if (!acc[month]) acc[month] = { total: 0, present: 0 };
    acc[month].total += 1;
    if (curr.status === 'Present') acc[month].present += 1;
    return acc;
  }, {});

  const chartData = Object.keys(monthlyAttendance).map(month => ({
    month,
    percentage: Math.round((monthlyAttendance[month].present / monthlyAttendance[month].total) * 100)
  }));

  const gpa = cgpa || 0;

  return (
    <PageTransition className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <div className="mt-1 h-1 w-12 rounded-full bg-primary" />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: BookOpen, label: "Subjects Enrolled", value: courses.length.toString() },
          { icon: CalendarCheck, label: "Overall Attendance", value: `${attendancePercentage}%` },
          { icon: Award, label: "Latest GPA", value: gpa > 0 ? gpa.toFixed(2) : 'N/A' },
        ].map((s, i) => (
          <AnimatedCard key={i} index={i} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <s.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Middle: Announcements + Exams */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AnimatedCard index={3} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
            <Bell className="h-4 w-4 text-primary" /> Recent Announcements
          </h2>
          <StaggerContainer className="space-y-3">
            {formattedAnnouncements.length === 0 ? <p className="text-sm text-muted-foreground">No recent announcements.</p> : formattedAnnouncements.map((a: any, i: number) => (
              <AnimatedListItem key={i}>
                <div 
                  onClick={() => setSelectedUpdate(a)}
                  className="flex items-start justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.date}</p>
                  </div>
                  <span className="shrink-0 rounded-md bg-accent px-2 py-0.5 text-xs font-medium text-accent-foreground">
                    {a.type}
                  </span>
                </div>
              </AnimatedListItem>
            ))}
          </StaggerContainer>
        </AnimatedCard>

        <AnimatedCard index={4} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Clock className="h-4 w-4 text-primary" /> Upcoming Exams
            </h2>
            <button 
              onClick={() => navigate('/admissions')}
              className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
            >
              View All →
            </button>
          </div>
          <StaggerContainer className="space-y-3">
            {exams.length === 0 ? <p className="text-sm text-muted-foreground">No upcoming exams scheduled.</p> : exams.slice(0,3).map((e: any, i: number) => (
              <AnimatedListItem key={i}>
                <div 
                  onClick={() => navigate('/admissions')}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 border-destructive/20 bg-destructive/5 cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{e.name}</p>
                    <p className="text-xs text-muted-foreground">{e.subject}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-destructive">{e.exam_date}</span>
                    <p className="text-[10px] text-muted-foreground">{e.start_time}</p>
                  </div>
                </div>
              </AnimatedListItem>
            ))}
          </StaggerContainer>
        </AnimatedCard>
      </div>

      {/* Bottom: Notes + Attendance Chart */}
      <div className="grid gap-4 lg:grid-cols-2">
        <AnimatedCard index={5} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <FileText className="h-4 w-4 text-primary" /> Recently Uploaded Notes
            </h2>
            <button 
              onClick={() => navigate('/notes')}
              className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline"
            >
              View All →
            </button>
          </div>
          <StaggerContainer className="space-y-3">
            {formattedNotes.length === 0 ? <p className="text-sm text-muted-foreground">No recent notes.</p> : formattedNotes.map((n: any, i: number) => (
              <AnimatedListItem key={i}>
                <div 
                  onClick={() => navigate('/notes')}
                  className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50 cursor-pointer"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.subject} · {n.uploadedBy}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{n.date}</span>
                </div>
              </AnimatedListItem>
            ))}
          </StaggerContainer>
        </AnimatedCard>

        <AnimatedCard index={6} className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-foreground">Attendance Overview</h2>
          <ResponsiveContainer width="100%" height={200}>
            {chartData.length > 0 ? (
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="percentage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
               <p className="text-sm text-muted-foreground mt-8 text-center">No attendance data to display.</p>
            )}
          </ResponsiveContainer>
        </AnimatedCard>
      </div>

      {/* Notification Modal */}
      {selectedUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card shadow-2xl animate-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-border p-5">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold">Institution Update</h2>
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
                <p className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{selectedUpdate.type}</p>
                <h3 className="text-xl font-bold text-foreground">{selectedUpdate.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">Posted on {selectedUpdate.date}</p>
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
