import { TeacherSidebar } from "@/components/TeacherSidebar";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

export default function TeacherLayout() {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-background">
      <TeacherSidebar />
      <main className="lg:ml-64 min-h-screen p-6 pt-20 lg:pt-6">
        <AnimatePresence mode="wait">
          <Outlet key={location.pathname} />
        </AnimatePresence>
      </main>
    </div>
  );
}
