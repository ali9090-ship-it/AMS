import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { RequireAuth } from "@/components/RequireAuth";

// Layouts
import DashboardLayout from "@/components/DashboardLayout";
import TeacherLayout from "@/components/TeacherLayout";
import AdminLayout from "@/components/AdminLayout";

// Auth
import LoginPage from "@/pages/LoginPage";

// Student pages
import DashboardPage from "@/pages/DashboardPage";
import ProfilePage from "@/pages/ProfilePage";
import AttendancePage from "@/pages/AttendancePage";
import CoursesPage from "@/pages/CoursesPage";
import ResultsPage from "@/pages/ResultsPage";
import NotesPage from "@/pages/NotesPage";
import DownloadsPage from "@/pages/DownloadsPage";
import NotificationsPage from "@/pages/NotificationsPage";
import StudentAdmissionsPage from "@/pages/student/StudentAdmissionsPage";
import StudentPlacementPage from "@/pages/student/StudentPlacementPage";
import StudentScholarshipsPage from "@/pages/student/StudentScholarshipsPage";
import StudentFeedbackPage from "@/pages/student/StudentFeedbackPage";

// Teacher pages
import TeacherDashboard from "@/pages/teacher/TeacherDashboard";
import TeacherClassesPage from "@/pages/teacher/TeacherClassesPage";
import TeacherAttendancePage from "@/pages/teacher/TeacherAttendancePage";
import TeacherMarksPage from "@/pages/teacher/TeacherMarksPage";
import TeacherStudentsPage from "@/pages/teacher/TeacherStudentsPage";
import TeacherPlacementPage from "@/pages/teacher/TeacherPlacementPage";
import TeacherFeedbackPage from "@/pages/teacher/TeacherFeedbackPage";

// Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsersPage from "@/pages/admin/AdminUsersPage";
import AdminAdmissionsPage from "@/pages/admin/AdminAdmissionsPage";
import AdminPlacementPage from "@/pages/admin/AdminPlacementPage";
import AdminScholarshipsPage from "@/pages/admin/AdminScholarshipsPage";
import AdminFeedbackPage from "@/pages/admin/AdminFeedbackPage";
import AdminSettingsPage from "@/pages/admin/AdminSettingsPage";
import AdminCoursesPage from "@/pages/admin/AdminCoursesPage";

import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Login */}
      <Route path="/login" element={user ? <Navigate to={user.role === "admin" ? "/admin" : user.role === "teacher" ? "/teacher" : "/"} replace /> : <LoginPage />} />

      {/* Student Portal */}
      <Route element={<RequireAuth allowedRoles={["student"]}><DashboardLayout /></RequireAuth>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/downloads" element={<DownloadsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/admissions" element={<StudentAdmissionsPage />} />
        <Route path="/placement" element={<StudentPlacementPage />} />
        <Route path="/scholarships" element={<StudentScholarshipsPage />} />
        <Route path="/feedback" element={<StudentFeedbackPage />} />
      </Route>

      {/* Teacher Portal */}
      <Route element={<RequireAuth allowedRoles={["teacher"]}><TeacherLayout /></RequireAuth>}>
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/classes" element={<TeacherClassesPage />} />
        <Route path="/teacher/attendance" element={<TeacherAttendancePage />} />
        <Route path="/teacher/marks" element={<TeacherMarksPage />} />
        <Route path="/teacher/students" element={<TeacherStudentsPage />} />
        <Route path="/teacher/placement" element={<TeacherPlacementPage />} />
        <Route path="/teacher/feedback" element={<TeacherFeedbackPage />} />
      </Route>

      {/* Admin Portal */}
      <Route element={<RequireAuth allowedRoles={["admin"]}><AdminLayout /></RequireAuth>}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/courses" element={<AdminCoursesPage />} />
        <Route path="/admin/admissions" element={<AdminAdmissionsPage />} />
        <Route path="/admin/placement" element={<AdminPlacementPage />} />
        <Route path="/admin/scholarships" element={<AdminScholarshipsPage />} />
        <Route path="/admin/feedback" element={<AdminFeedbackPage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
