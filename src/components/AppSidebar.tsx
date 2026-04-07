import { NavLink } from "@/components/NavLink";
import amsLogo from "@/assets/ams-logo.png";
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  BookOpen,
  Award,
  FileText,
  Download,
  Bell,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  GraduationCap,
  Briefcase,
  MessageSquare,
} from "lucide-react";
import { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "My Profile", url: "/profile", icon: User },
  { title: "Attendance", url: "/attendance", icon: CalendarCheck },
  { title: "Courses", url: "/courses", icon: BookOpen },
  { title: "Results", url: "/results", icon: Award },
  { title: "Notes & Resources", url: "/notes", icon: FileText },
  { title: "Downloads", url: "/downloads", icon: Download },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Admissions & Exams", url: "/admissions", icon: GraduationCap },
  { title: "Training & Placement", url: "/placement", icon: Briefcase },
  { title: "Scholarships", url: "/scholarships", icon: Award },
  { title: "Feedback", url: "/feedback", icon: MessageSquare },
];

export function AppSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { dark, toggle } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 rounded-lg bg-card p-2 shadow-md lg:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/20 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar transition-transform lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-5">
          <img src={amsLogo} alt="AMS" className="h-9 w-9 object-contain" />
          <div>
            <span className="text-sm font-bold text-foreground">Student</span>
            <span className="text-sm font-bold text-primary"> Portal</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation
          </p>
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.title}>
                <NavLink
                  to={item.url}
                  end={item.url === "/"}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  activeClassName="bg-sidebar-accent text-primary font-semibold"
                  onClick={() => setMobileOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <button
            onClick={toggle}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span>{dark ? "Light Mode" : "Dark Mode"}</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
          <div className="mt-3 rounded-lg bg-muted px-3 py-2.5">
            <p className="text-sm font-semibold text-foreground">{user?.name ?? "Student"}</p>
            <p className="text-xs text-muted-foreground">{user?.branch ?? "AIML"} Student</p>
          </div>
        </div>
      </aside>
    </>
  );
}
