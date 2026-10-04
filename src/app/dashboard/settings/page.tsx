"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Bell, Shield, Save, Lock, Eye, EyeOff } from "lucide-react";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  mobile: string | null;
}

interface Preferences {
  language: string;
  theme: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  detectionAlerts: boolean;
  monitoringAlerts: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetch("/api/v1/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setProfile(data.data.user);
          setPreferences(data.data.preferences || {
            language: "en",
            theme: "light",
            emailNotifications: true,
            pushNotifications: true,
            detectionAlerts: true,
            monitoringAlerts: true,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: "profile",
          fullName: profile.fullName,
          mobile: profile.mobile,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Profile updated successfully");
        setProfile(data.data);
      } else {
        setMessage(data.error || "Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  const savePreferences = async () => {
    if (!preferences) return;
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "preferences", ...preferences }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Preferences updated successfully");
      }
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/v1/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "password", currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Password updated successfully");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setMessage(data.error || "Failed to change password");
      }
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "preferences", label: "Preferences", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
  ];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-8 w-32" />
        <div className="skeleton h-60 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-display text-xl font-bold text-text-primary">Settings</h1>
        <p className="text-sm text-text-secondary">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setMessage("");
            }}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-forest text-forest"
                : "border-transparent text-text-secondary hover:text-text-primary"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`text-sm rounded-lg px-4 py-3 ${
            message.includes("success")
              ? "bg-success/10 text-success border border-success/20"
              : "bg-error/10 text-error border border-error/20"
          }`}
        >
          {message}
        </motion.div>
      )}

      {/* Profile */}
      {activeTab === "profile" && profile && (
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Profile Information</h3>
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
            />
            <Input
              label="Email"
              value={profile.email}
              disabled
              helperText="Email cannot be changed"
            />
            <Input
              label="Mobile Number"
              value={profile.mobile || ""}
              onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
              placeholder="Optional"
            />
          </div>
          <div className="mt-5">
            <Button onClick={saveProfile} isLoading={saving} icon={<Save size={16} />}>
              Save Changes
            </Button>
          </div>
        </Card>
      )}

      {/* Preferences */}
      {activeTab === "preferences" && preferences && (
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Notification Settings</h3>
          <div className="space-y-4">
            {[
              { key: "emailNotifications", label: "Email Notifications" },
              { key: "pushNotifications", label: "Push Notifications" },
              { key: "detectionAlerts", label: "Detection Alerts" },
              { key: "monitoringAlerts", label: "Monitoring Alerts" },
            ].map((item) => (
              <label key={item.key} className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-text-primary">{item.label}</span>
                <button
                  type="button"
                  onClick={() =>
                    setPreferences({
                      ...preferences,
                      [item.key]: !preferences[item.key as keyof Preferences],
                    })
                  }
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    preferences[item.key as keyof Preferences] ? "bg-forest" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      preferences[item.key as keyof Preferences] ? "translate-x-5" : ""
                    }`}
                  />
                </button>
              </label>
            ))}
          </div>
          <div className="mt-5">
            <Button onClick={savePreferences} isLoading={saving} icon={<Save size={16} />}>
              Save Preferences
            </Button>
          </div>
        </Card>
      )}

      {/* Security */}
      {activeTab === "security" && (
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-4">Change Password</h3>
          <div className="space-y-4">
            <Input
              label="Current Password"
              type={showPassword ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              icon={<Lock size={16} />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-text-secondary">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              icon={<Lock size={16} />}
              helperText="At least 8 characters"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={<Lock size={16} />}
            />
          </div>
          <div className="mt-5">
            <Button onClick={changePassword} isLoading={saving} icon={<Shield size={16} />}>
              Update Password
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}