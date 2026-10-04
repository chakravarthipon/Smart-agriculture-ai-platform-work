"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, mobile: mobile || undefined }),
      });

      const data = await res.json();

      if (data.success) {
        document.cookie = `auth_token=${data.data.token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
        router.push("/dashboard");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-forest relative items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-forest-deep to-forest" />
        <div className="relative text-center px-12">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Leaf size={32} className="text-white" />
          </div>
          <h2 className="font-display text-3xl font-bold text-white mb-4">
            Join AgriVision AI
          </h2>
          <p className="text-white/70 text-sm leading-relaxed max-w-sm mx-auto">
            Start monitoring your crops with AI-powered disease detection. Protect your harvest with intelligent agricultural technology.
          </p>
        </div>
      </div>

      {/* Right panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center">
              <Leaf size={18} className="text-white" />
            </div>
            <span className="font-semibold text-text-primary">AgriVision AI</span>
          </div>

          <h1 className="font-display text-2xl font-bold text-text-primary mb-2">
            Create your account
          </h1>
          <p className="text-sm text-text-secondary mb-8">
            Get started with intelligent crop health monitoring.
          </p>

          {error && (
            <div className="bg-error/10 border border-error/20 text-error text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              placeholder="John Farmer"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              icon={<User size={16} />}
              required
            />
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={16} />}
              required
            />
            <Input
              label="Mobile Number (Optional)"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              icon={<Phone size={16} />}
            />
            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-text-secondary hover:text-text-primary"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              required
            />
            <Input
              label="Confirm Password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={16} />}
              required
            />

            <label className="flex items-start gap-2 text-sm">
              <input type="checkbox" className="rounded border-border mt-0.5" required />
              <span className="text-text-secondary">
                I agree to the{" "}
                <a href="#" className="text-forest hover:underline">Terms of Service</a>{" "}
                and{" "}
                <a href="#" className="text-forest hover:underline">Privacy Policy</a>
              </span>
            </label>

            <Button
              type="submit"
              isLoading={loading}
              className="w-full"
              size="lg"
            >
              Create Account
              <ArrowRight size={16} />
            </Button>
          </form>

          <p className="text-sm text-text-secondary text-center mt-8">
            Already have an account?{" "}
            <Link href="/login" className="text-forest font-medium hover:text-forest-deep">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}