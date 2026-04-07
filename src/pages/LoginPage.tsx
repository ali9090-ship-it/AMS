import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { validateEmail } from "@/lib/auth";
import { LogIn } from "lucide-react";
import { motion } from "framer-motion";
import amsLogo from "@/assets/ams-logo.png";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    let hasError = false;

    const { valid, error: validationError } = validateEmail(email);
    if (!valid) {
      setEmailError(validationError || "Use your mhssce.ac.in college email.");
      hasError = true;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      hasError = true;
    }

    if (hasError) return;

    setLoading(true);
    try {
      await login(email, password);
      const authData = JSON.parse(localStorage.getItem('ams_auth') || '{}');
      if (authData.user?.role === "admin") navigate("/admin");
      else if (authData.user?.role === "teacher") navigate("/teacher");
      else navigate("/");
    } catch (err: any) {
      setPasswordError(err.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      {/* Animated background pattern */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 h-[800px] w-[800px] rounded-full bg-primary/[0.03] blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 h-[600px] w-[600px] rounded-full bg-primary/[0.04] blur-3xl" />
      </div>

      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <motion.img
          src={amsLogo}
          alt="AMS – MH Saboo Siddik College of Engineering"
          className="mb-6 h-28 w-28 object-contain drop-shadow-lg"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        />

        {/* Heading */}
        <motion.h1
          className="text-xl font-bold text-foreground sm:text-2xl"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          MHSSCE Academic Management System
        </motion.h1>
        <motion.p
          className="mb-8 mt-1 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          Sign in with your college email
        </motion.p>

        {/* Card */}
        <motion.div
          className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-lg backdrop-blur-sm"
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                College Email
              </label>
              <input
                type="email"
                placeholder="you@mhssce.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                required
              />
              {emailError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-xs text-destructive"
                >
                  {emailError}
                </motion.p>
              )}
            </motion.div>

            {/* Password */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                required
              />
              {passwordError && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-1 text-xs text-destructive"
                >
                  {passwordError}
                </motion.p>
              )}
            </motion.div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md disabled:opacity-60"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              {loading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              Sign in to AMS
            </motion.button>
          </form>

          <p className="mt-3 text-center text-xs text-muted-foreground">
            Need help?{" "}
            <a href="mailto:admin@mhssce.ac.in" className="text-primary hover:underline">
              Contact admin
            </a>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
