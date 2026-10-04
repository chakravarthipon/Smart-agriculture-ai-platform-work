"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ScanLine,
  Heart,
  AlertTriangle,
  Wheat,
  Activity,
  ArrowUpRight,
  TrendingUp,
  Leaf,
  Upload,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

interface DashboardData {
  totalScans: number;
  healthyPlants: number;
  diseaseCases: number;
  totalCrops: number;
  activeMonitoring: number;
  recentScans: number;
  diseaseDistribution: Array<{ diseaseName: string; count: number }>;
  monthlyTrend: Array<{ month: string; total: number; healthy: number; diseased: number }>;
}

const COLORS = ["#174D36", "#3C9565", "#E7A33E", "#D9534F", "#7B68EE", "#2E8B57", "#68766D"];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recentDetections, setRecentDetections] = useState<Array<{
    id: string;
    cropName: string;
    diseaseName: string;
    confidence: number;
    createdAt: string;
    predictedClass: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/dashboard/summary").then((r) => r.json()),
      fetch("/api/v1/detections?limit=5").then((r) => r.json()),
    ])
      .then(([summary, detections]) => {
        if (summary.success) setData(summary.data);
        if (detections.success) setRecentDetections(detections.data.detections);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5">
              <div className="skeleton h-4 w-24 mb-3" />
              <div className="skeleton h-8 w-16 mb-2" />
              <div className="skeleton h-3 w-32" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const kpiCards = [
    {
      label: "Total Scans",
      value: data?.totalScans || 0,
      icon: ScanLine,
      color: "text-forest",
      bgColor: "bg-forest/10",
      change: data?.recentScans ? `${data.recentScans} this week` : null,
    },
    {
      label: "Healthy Plants",
      value: data?.healthyPlants || 0,
      icon: Heart,
      color: "text-success",
      bgColor: "bg-success/10",
      change: data?.totalScans
        ? `${Math.round(((data.healthyPlants || 0) / data.totalScans) * 100)}% of scans`
        : null,
    },
    {
      label: "Disease Cases",
      value: data?.diseaseCases || 0,
      icon: AlertTriangle,
      color: "text-warning",
      bgColor: "bg-warning/10",
      change: null,
    },
    {
      label: "My Crops",
      value: data?.totalCrops || 0,
      icon: Wheat,
      color: "text-fresh",
      bgColor: "bg-fresh/10",
      change: data?.activeMonitoring ? `${data.activeMonitoring} monitored` : null,
    },
  ];

  const hasData = data && data.totalScans > 0;

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary">Your crop health overview</p>
        </div>
        <Link
          href="/dashboard/detect"
          className="inline-flex items-center gap-2 bg-forest text-white px-4 py-2.5 rounded-lg hover:bg-forest-deep transition-colors text-sm font-medium"
        >
          <Upload size={16} />
          New Detection
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-text-secondary font-medium uppercase tracking-wide">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold text-text-primary mt-1">{kpi.value}</p>
                  {kpi.change && (
                    <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                      <TrendingUp size={10} />
                      {kpi.change}
                    </p>
                  )}
                </div>
                <div className={`w-10 h-10 rounded-lg ${kpi.bgColor} flex items-center justify-center`}>
                  <kpi.icon size={20} className={kpi.color} />
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {!hasData ? (
        /* Empty state */
        <Card className="text-center py-16">
          <div className="w-16 h-16 bg-mint rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Leaf size={32} className="text-forest" />
          </div>
          <h3 className="font-display text-lg font-semibold text-text-primary mb-2">
            Welcome to AgriVision AI
          </h3>
          <p className="text-sm text-text-secondary mb-6 max-w-md mx-auto">
            Start by analyzing your first plant leaf image. Upload a photo to detect potential diseases and begin building your crop health database.
          </p>
          <Link
            href="/dashboard/detect"
            className="inline-flex items-center gap-2 bg-forest text-white px-5 py-2.5 rounded-lg hover:bg-forest-deep transition-colors text-sm font-medium"
          >
            <ScanLine size={16} />
            Start Your First Detection
          </Link>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-5">
          {/* Detection Trend Chart */}
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-text-primary">Detection Trends</h3>
              <Badge variant="info">Last 6 months</Badge>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.monthlyTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E3EAE4" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#68766D" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#68766D" }} />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #E3EAE4",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="healthy"
                    stackId="1"
                    stroke="#2E8B57"
                    fill="#2E8B57"
                    fillOpacity={0.2}
                    name="Healthy"
                  />
                  <Area
                    type="monotone"
                    dataKey="diseased"
                    stackId="1"
                    stroke="#D9534F"
                    fill="#D9534F"
                    fillOpacity={0.2}
                    name="Diseased"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Disease Distribution */}
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-5">Disease Distribution</h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data?.diseaseDistribution?.slice(0, 6) || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="diseaseName"
                  >
                    {(data?.diseaseDistribution?.slice(0, 6) || []).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #E3EAE4",
                      borderRadius: "8px",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-3">
              {(data?.diseaseDistribution?.slice(0, 4) || []).map((d, i) => (
                <div key={d.diseaseName} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-text-secondary truncate max-w-[120px]">
                      {d.diseaseName || "Unknown"}
                    </span>
                  </div>
                  <span className="font-medium text-text-primary">{d.count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Recent Detections */}
      {recentDetections.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-text-primary">Recent Detections</h3>
            <Link
              href="/dashboard/history"
              className="text-xs text-forest hover:text-forest-deep flex items-center gap-1"
            >
              View all <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-medium text-text-secondary py-2.5 px-2">Crop</th>
                  <th className="text-left text-xs font-medium text-text-secondary py-2.5 px-2">Condition</th>
                  <th className="text-left text-xs font-medium text-text-secondary py-2.5 px-2">Confidence</th>
                  <th className="text-left text-xs font-medium text-text-secondary py-2.5 px-2">Date</th>
                  <th className="text-left text-xs font-medium text-text-secondary py-2.5 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentDetections.map((d) => {
                  const isHealthy = d.predictedClass?.toLowerCase().includes("healthy");
                  return (
                    <tr key={d.id} className="border-b border-border/50 hover:bg-mint/30 transition-colors">
                      <td className="py-3 px-2 text-sm text-text-primary">{d.cropName || "Unknown"}</td>
                      <td className="py-3 px-2 text-sm text-text-primary">{d.diseaseName || d.predictedClass}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-border rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${isHealthy ? "bg-success" : "bg-warning"}`}
                              style={{ width: `${Math.round(d.confidence * 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-text-secondary">
                            {Math.round(d.confidence * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-xs text-text-secondary">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant={isHealthy ? "success" : "warning"}>
                          {isHealthy ? "Healthy" : "Attention"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Quick actions when there is data */}
      {hasData && (
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/dashboard/detect">
            <Card hover className="text-center py-6">
              <ScanLine size={24} className="text-forest mx-auto mb-2" />
              <p className="text-sm font-medium text-text-primary">New Detection</p>
              <p className="text-xs text-text-secondary mt-1">Upload a leaf image</p>
            </Card>
          </Link>
          <Link href="/dashboard/crops">
            <Card hover className="text-center py-6">
              <Wheat size={24} className="text-fresh mx-auto mb-2" />
              <p className="text-sm font-medium text-text-primary">Manage Crops</p>
              <p className="text-xs text-text-secondary mt-1">View and add crops</p>
            </Card>
          </Link>
          <Link href="/dashboard/monitoring">
            <Card hover className="text-center py-6">
              <Activity size={24} className="text-warning mx-auto mb-2" />
              <p className="text-sm font-medium text-text-primary">Monitoring</p>
              <p className="text-xs text-text-secondary mt-1">Track plant health</p>
            </Card>
          </Link>
        </div>
      )}
    </div>
  );
}