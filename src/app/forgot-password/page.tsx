"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Leaf, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate submission (no real email service configured)
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary mb-8"
        >
          <ArrowLeft size={14} />
          Back to sign in
        </Link>

        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center">
            <Leaf size={18} className="text-white" />
          </div>
          <span className="font-semibold text-text-primary">AgriVision AI</span>
        </div>

        {!submitted ? (
          <>
            <h1 className="font-display text-2xl font-bold text-text-primary mb-2">
              Forgot your password?
            </h1>
            <p className="text-sm text-text-secondary mb-8">
              Enter your email address and we&apos;ll send you instructions to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={16} />}
                required
              />
              <Button type="submit" isLoading={loading} className="w-full" size="lg">
                Send Reset Instructions
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-success" />
            </div>
            <h1 className="font-display text-2xl font-bold text-text-primary mb-2">Check your email</h1>
            <p className="text-sm text-text-secondary mb-6">
              If an account exists for <strong>{email}</strong>, you&apos;ll receive password reset instructions.
              Please note that email delivery requires a configured email service.
            </p>
            <Link
              href="/login"
              className="text-sm text-forest font-medium hover:text-forest-deep"
            >
              Return to sign in
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
}