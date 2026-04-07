export type UserRole = "student" | "teacher" | "admin";

export interface AMSUser {
  email: string;
  role: UserRole;
  name: string;
  // Parsed info
  rollNo?: string;
  branch?: string;
  phone?: string;
  avatar_url?: string;
}

const DOMAIN = "@mhssce.ac.in";

export const STUDENT_REGEX = /^[a-z]+\.[a-z0-9]+\.(cs|ce|it|cse|aiml|extc|mech|civil)@mhssce\.ac\.in$/;
export const TEACHER_REGEX = /^[a-z]+\.(cs|ce|it|cse|aiml|extc|mech|civil)@mhssce\.ac\.in$/;
export const ADMIN_REGEX = /^admin(@mhssce\.ac\.in|(\.[a-z]+)@mhssce\.ac\.in)$/;

export function validateEmail(email: string): { valid: boolean; error?: string } {
  const lower = email.toLowerCase().trim();
  if (!lower.endsWith(DOMAIN)) {
    return { valid: false, error: "Invalid email format. Use your college email." };
  }
  if (ADMIN_REGEX.test(lower) || STUDENT_REGEX.test(lower) || TEACHER_REGEX.test(lower)) {
    return { valid: true };
  }
  return {
    valid: false,
    error: "Invalid email format. Use your college email.",
  };
}

export function detectRole(email: string): UserRole {
  const lower = email.toLowerCase().trim();
  if (ADMIN_REGEX.test(lower)) return "admin";
  if (STUDENT_REGEX.test(lower)) return "student";
  return "teacher";
}

export function parseUser(email: string): AMSUser {
  const lower = email.toLowerCase().trim();
  const role = detectRole(lower);

  if (role === "admin") {
    return { email: lower, role, name: "Super Admin" };
  }
  if (role === "student") {
    // lowercase.123456.cs@mhssce.ac.in
    const parts = lower.split('@')[0].split('.');
    return { email: lower, role, name: capitalize(parts[0]), rollNo: parts[1], branch: parts[2].toUpperCase() };
  }
  // teacher: name.branch@mhssce.ac.in
  const parts = lower.split('@')[0].split('.');
  return { email: lower, role, name: capitalize(parts[0]), branch: parts[1].toUpperCase() };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
