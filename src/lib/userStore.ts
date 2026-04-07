import { type UserRole } from "@/lib/auth";

export interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  branch: string;
  status: "Active" | "Inactive";
  createdAt: string;
}

const STORAGE_KEY = "ams_registered_users";

// Default seed users so there's always something to log in with
const SEED_USERS: RegisteredUser[] = [
  { id: "seed-1", name: "Anas Ansari", email: "anas.22it001.cse@mhssce.ac.in", password: "student123", role: "student", branch: "CSE", status: "Active", createdAt: "2026-01-15" },
  { id: "seed-2", name: "Priya Sharma", email: "priya.22it002.cse@mhssce.ac.in", password: "student123", role: "student", branch: "CSE", status: "Active", createdAt: "2026-01-15" },
  { id: "seed-3", name: "Rahul Verma", email: "rahul.22it003.cse@mhssce.ac.in", password: "student123", role: "student", branch: "CSE", status: "Active", createdAt: "2026-01-15" },
  { id: "seed-4", name: "Sneha Joshi", email: "sneha.22it004.cse@mhssce.ac.in", password: "student123", role: "student", branch: "CSE", status: "Active", createdAt: "2026-01-15" },
  { id: "seed-5", name: "Rohit Patil", email: "rohit.22it005.cse@mhssce.ac.in", password: "student123", role: "student", branch: "CSE", status: "Inactive", createdAt: "2026-01-15" },
  { id: "seed-6", name: "Prof. Rajesh Kumar", email: "rajesh.cse@mhssce.ac.in", password: "teacher123", role: "teacher", branch: "CSE", status: "Active", createdAt: "2026-01-10" },
  { id: "seed-7", name: "Prof. Meera Mehta", email: "meera.cse@mhssce.ac.in", password: "teacher123", role: "teacher", branch: "CSE", status: "Active", createdAt: "2026-01-10" },
  { id: "seed-8", name: "Super Admin", email: "admin@mhssce.ac.in", password: "admin123", role: "admin", branch: "ALL", status: "Active", createdAt: "2026-01-01" },
  { id: "seed-9", name: "Admin Sharma", email: "admin.sharma@mhssce.ac.in", password: "admin123", role: "admin", branch: "ALL", status: "Active", createdAt: "2026-01-01" },
];

function loadUsers(): RegisteredUser[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  // First load — seed default users
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_USERS));
  return [...SEED_USERS];
}

function saveUsers(users: RegisteredUser[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export function getRegisteredUsers(): RegisteredUser[] {
  return loadUsers();
}

export function addRegisteredUser(user: Omit<RegisteredUser, "id" | "createdAt">): RegisteredUser {
  const users = loadUsers();
  const exists = users.find((u) => u.email.toLowerCase() === user.email.toLowerCase());
  if (exists) throw new Error("A user with this email already exists.");

  const newUser: RegisteredUser = {
    ...user,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString().split("T")[0],
  };
  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function updateRegisteredUser(id: string, updates: Partial<RegisteredUser>) {
  const users = loadUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error("User not found.");
  users[idx] = { ...users[idx], ...updates };
  saveUsers(users);
  return users[idx];
}

export function deleteRegisteredUser(id: string) {
  const users = loadUsers().filter((u) => u.id !== id);
  saveUsers(users);
}

export function authenticateUser(email: string, password: string): RegisteredUser | null {
  const users = loadUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim() && u.password === password
  );
  if (!user) return null;
  if (user.status === "Inactive") return null;
  return user;
}
