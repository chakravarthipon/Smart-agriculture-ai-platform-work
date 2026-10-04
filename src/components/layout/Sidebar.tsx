"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  ScanLine,
  Wheat,
  Activity,
  History,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
  Leaf,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/detect", label: "AI Disease Detection", icon: ScanLine },
  { href: "/dashboard/crops", label: "My Crops", icon: Wheat },
  { href: "/dashboard/monitoring", label: "Plant Monitoring", icon: Activity },
  { href: "/dashboard/history", label: "Detection History", icon: History },
  { href: "/dashboard/diseases", label: "Disease Library", icon: BookOpen },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface border border-border rounded-lg shadow-sm"
        aria-label="Toggle navigation"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 bg-black/20 z-40"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-surface border-r border-border z-40 transition-all duration-300 flex flex-col
          ${collapsed ? "w-[68px]" : "w-[260px]"}
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-border ${collapsed ? "justify-center" : "gap-3"}`}>
          <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center flex-shrink-0">
            <Leaf size={18} className="text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-text-primary truncate">AgriVision AI</h1>
              <p className="text-[10px] text-text-secondary truncate">Smart Agriculture</p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 overflow-y-auto">
          <ul className="space-y-0.5 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group relative
                      ${isActive
                        ? "bg-forest text-white shadow-sm"
                        : "text-text-secondary hover:text-text-primary hover:bg-mint"
                      }
                      ${collapsed ? "justify-center px-2" : ""}
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {isActive && !collapsed && (
                      <ChevronRight size={14} className="ml-auto opacity-60" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Collapse toggle (desktop) */}
        <div className="hidden lg:block border-t border-border p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center py-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-mint transition-colors"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }}>
              <ChevronRight size={16} className="rotate-180" />
            </motion.div>
          </button>
        </div>

        {/* User section */}
        <div className={`border-t border-border p-3 ${collapsed ? "flex justify-center" : ""}`}>
          <div className={`flex items-center gap-3 ${collapsed ? "" : ""}`}>
            <div className="w-8 h-8 bg-mint rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-forest">
                {/* Will be populated from auth context */}
                U
              </span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-text-primary truncate">User</p>
                <p className="text-[11px] text-text-secondary truncate">Farmer</p>
              </div>
            )}
            {!collapsed && (
              <button
                onClick={() => {
                  document.cookie = "auth_token=; path=/; max-age=0";
                  window.location.href = "/login";
                }}
                className="p-1.5 text-text-secondary hover:text-error rounded transition-colors"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}