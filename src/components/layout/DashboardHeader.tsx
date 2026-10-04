"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Calendar } from "lucide-react";
import Link from "next/link";

interface DashboardHeaderProps {
  userName?: string;
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  const [currentDate, setCurrentDate] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setCurrentDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  useEffect(() => {
    fetch("/api/v1/notifications?unread=true&limit=1")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setUnreadCount(data.data.unreadCount || 0);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <div className="pl-10 lg:pl-0">
          <h2 className="text-base font-semibold text-text-primary">
            Welcome back{userName ? `, ${userName}` : ""}
          </h2>
          <div className="flex items-center gap-1.5 text-xs text-text-secondary">
            <Calendar size={12} />
            <span>{currentDate}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-bg rounded-lg px-3 py-2 border border-border">
          <Search size={14} className="text-text-secondary" />
          <input
            type="text"
            placeholder="Search detections, crops..."
            className="bg-transparent text-sm outline-none w-48 placeholder:text-text-secondary/50"
          />
        </div>

        {/* Notifications */}
        <Link
          href="/dashboard/notifications"
          className="relative p-2 text-text-secondary hover:text-text-primary hover:bg-mint rounded-lg transition-colors"
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-error text-white text-[10px] rounded-full flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}