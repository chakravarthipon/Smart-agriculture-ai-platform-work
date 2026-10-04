"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Activity,
  Plus,
  Leaf,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface MonitoringRecord {
  monitoring: {
    id: string;
    title: string;
    status: string;
    createdAt: string;
  };
  cropName: string;
  cropVariety: string | null;
  observationCount: number;
}

interface Crop {
  id: string;
  name: string;
}

export default function MonitoringPage() {
  const [records, setRecords] = useState<MonitoringRecord[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState("");
  const [title, setTitle] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/monitoring").then((r) => r.json()),
      fetch("/api/v1/crops?limit=100").then((r) => r.json()),
    ])
      .then(([monData, cropData]) => {
        if (monData.success) setRecords(monData.data.monitoring);
        if (cropData.success) setCrops(cropData.data.crops);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!selectedCrop || !title.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/v1/monitoring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropId: selectedCrop, title: title.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        // Re-fetch
        const monRes = await fetch("/api/v1/monitoring");
        const monData = await monRes.json();
        if (monData.success) setRecords(monData.data.monitoring);
        setShowCreate(false);
        setTitle("");
        setSelectedCrop("");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-text-primary">Plant Monitoring</h1>
          <p className="text-sm text-text-secondary">Track crop health over time with continuous observations</p>
        </div>
        <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />}>
          New Monitor
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-4">Create Monitoring Record</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Crop *</label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/20"
                >
                  <option value="">Select a crop</option>
                  {crops.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Title *</label>
                <input
                  type="text"
                  placeholder="e.g., Weekly Tomato Check"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={handleCreate} isLoading={creating} size="sm">Create</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)} size="sm">Cancel</Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Records */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5">
              <div className="skeleton h-5 w-40 mb-2" />
              <div className="skeleton h-3 w-32" />
            </div>
          ))}
        </div>
      ) : records.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-14 h-14 bg-mint rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Activity size={28} className="text-forest" />
          </div>
          <h3 className="text-base font-semibold text-text-primary mb-2">No Monitoring Records</h3>
          <p className="text-sm text-text-secondary mb-5 max-w-sm mx-auto">
            Create a monitoring record to start tracking crop health observations over time.
          </p>
          {crops.length === 0 ? (
            <p className="text-sm text-warning flex items-center justify-center gap-2">
              <AlertCircle size={14} />
              Add a crop first before creating a monitor.
            </p>
          ) : (
            <Button onClick={() => setShowCreate(true)} icon={<Plus size={16} />}>
              Create Monitor
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map((r, i) => (
            <motion.div
              key={r.monitoring.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link href={`/dashboard/monitoring/${r.monitoring.id}`}>
                <Card hover>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-mint rounded-lg flex items-center justify-center">
                        <Leaf size={20} className="text-forest" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-text-primary">
                          {r.monitoring.title}
                        </h3>
                        <p className="text-xs text-text-secondary">
                          {r.cropName} &middot; {r.observationCount} observations &middot; Created{" "}
                          {new Date(r.monitoring.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={r.monitoring.status === "active" ? "success" : "default"}>
                        {r.monitoring.status}
                      </Badge>
                      <ChevronRight size={16} className="text-text-secondary" />
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}