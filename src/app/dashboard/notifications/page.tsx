"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  AlertTriangle,
  ScanLine,
  Activity,
  Filter,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typeFilter, setTypeFilter] = useState("");

  const fetchNotifications = async () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (typeFilter) params.set("type", typeFilter);

    const res = await fetch(`/api/v1/notifications?${params}`);
    const data = await res.json();
    if (data.success) {
      setNotifications(data.data.notifications);
      setUnreadCount(data.data.unreadCount);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [typeFilter]);

  const markAsRead = async (id: string) => {
    await fetch(`/api/v1/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount(Math.max(0, unreadCount - 1));
  };

  const markAllAsRead = async () => {
    await fetch("/api/v1/notifications/read-all", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
    });
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const deleteNotification = async (id: string) => {
    await fetch(`/api/v1/notifications/${id}`, { method: "DELETE" });
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "detection_alert":
        return <ScanLine size={16} className="text-warning" />;
      case "monitoring_alert":
        return <Activity size={16} className="text-error" />;
      default:
        return <Bell size={16} className="text-fresh" />;
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-text-primary">Notifications</h1>
          <p className="text-sm text-text-secondary">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : "All caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead} icon={<CheckCheck size={14} />}>
            Mark all read
          </Button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["", "detection_alert", "monitoring_alert"].map((type) => (
          <button
            key={type}
            onClick={() => setTypeFilter(type)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              typeFilter === type
                ? "bg-forest text-white border-forest"
                : "bg-surface text-text-secondary border-border hover:border-forest/30"
            }`}
          >
            {type === "" ? "All" : type === "detection_alert" ? "Detections" : "Monitoring"}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-2">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-lg p-4">
              <div className="skeleton h-4 w-48 mb-2" />
              <div className="skeleton h-3 w-64" />
            </div>
          ))
        ) : notifications.length === 0 ? (
          <Card className="text-center py-12">
            <Bell size={28} className="text-text-secondary/30 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-text-primary mb-2">No Notifications</h3>
            <p className="text-sm text-text-secondary">
              You&apos;ll receive alerts here when disease detections or monitoring events occur.
            </p>
          </Card>
        ) : (
          notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card
                className={`transition-colors ${!n.isRead ? "border-l-2 border-l-forest bg-mint/20" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-bg rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    {getTypeIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-medium text-text-primary">{n.title}</h4>
                      <span className="text-xs text-text-secondary flex-shrink-0">
                        {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-text-secondary mt-1">{n.message}</p>
                    <div className="flex items-center gap-2 mt-2">
                      {!n.isRead && (
                        <button
                          onClick={() => markAsRead(n.id)}
                          className="text-xs text-forest hover:text-forest-deep flex items-center gap-1"
                        >
                          <Check size={12} /> Mark read
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(n.id)}
                        className="text-xs text-text-secondary hover:text-error flex items-center gap-1"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}