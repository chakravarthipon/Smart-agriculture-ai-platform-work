"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Activity,
  Plus,
  Leaf,
  Calendar,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

interface Observation {
  id: string;
  predictedClass: string;
  diseaseName: string;
  confidence: number;
  notes: string;
  observedAt: string;
  createdAt: string;
}

interface MonitoringDetail {
  monitoring: {
    id: string;
    title: string;
    status: string;
    alertRules: Record<string, unknown>;
    createdAt: string;
  };
  cropName: string;
  cropVariety: string | null;
  observations: Observation[];
}

export default function MonitoringDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [detail, setDetail] = useState<MonitoringDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [detections, setDetections] = useState<Array<{ id: string; diseaseName: string }>>([]);
  const [showAddObs, setShowAddObs] = useState(false);
  const [selectedDetection, setSelectedDetection] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/v1/monitoring/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setDetail(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/v1/detections?limit=20")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setDetections(data.data.detections);
      })
      .catch(() => {});
  }, [params.id]);

  const addObservation = async () => {
    if (!selectedDetection) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/monitoring/${params.id}/observations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ detectionId: selectedDetection, notes }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh
        const detailRes = await fetch(`/api/v1/monitoring/${params.id}`);
        const detailData = await detailRes.json();
        if (detailData.success) setDetail(detailData.data);
        setShowAddObs(false);
        setSelectedDetection("");
        setNotes("");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-6 w-48" />
        <div className="skeleton h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary">Monitoring record not found</p>
        <Link href="/dashboard/monitoring" className="text-forest text-sm mt-2 inline-block">
          Back to monitoring
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/dashboard/monitoring"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft size={14} />
        Back to monitoring
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-text-primary">
            {detail.monitoring.title}
          </h1>
          <p className="text-sm text-text-secondary">
            {detail.cropName} &middot; {detail.observations.length} observations
          </p>
        </div>
        <Button onClick={() => setShowAddObs(true)} icon={<Plus size={16} />} size="sm">
          Add Observation
        </Button>
      </div>

      {/* Add observation */}
      {showAddObs && (
        <Card>
          <h3 className="text-sm font-semibold text-text-primary mb-3">Add Observation</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Select a Detection
              </label>
              <select
                value={selectedDetection}
                onChange={(e) => setSelectedDetection(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/20"
              >
                <option value="">Choose a detection...</option>
                {detections.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.diseaseName || d.id}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Notes</label>
              <textarea
                placeholder="Observation notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/20 h-20 resize-none"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addObservation} isLoading={saving} size="sm">
                Save Observation
              </Button>
              <Button variant="ghost" onClick={() => setShowAddObs(false)} size="sm">
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Timeline */}
      {detail.observations.length === 0 ? (
        <Card className="text-center py-12">
          <Activity size={28} className="text-text-secondary/30 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-text-primary mb-2">No Observations Yet</h3>
          <p className="text-sm text-text-secondary mb-5">
            Add observations by linking disease detections to this monitoring record.
          </p>
          <Button onClick={() => setShowAddObs(true)} icon={<Plus size={16} />}>
            Add First Observation
          </Button>
        </Card>
      ) : (
        <div className="space-y-0 relative">
          {/* Timeline line */}
          <div className="absolute left-5 top-4 bottom-4 w-px bg-border" />

          {detail.observations.map((obs, i) => {
            const isHealthy = obs.predictedClass?.toLowerCase().includes("healthy");
            return (
              <motion.div
                key={obs.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative pl-12 pb-6"
              >
                <div className={`absolute left-3.5 top-1.5 w-3 h-3 rounded-full border-2 border-surface z-10 ${
                  isHealthy ? "bg-success" : "bg-warning"
                }`} />
                <Card>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-sm font-medium text-text-primary">
                        {obs.diseaseName || obs.predictedClass}
                      </h4>
                      <p className="text-xs text-text-secondary flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(obs.observedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary">
                        {Math.round((obs.confidence || 0) * 100)}%
                      </span>
                      <Badge variant={isHealthy ? "success" : "warning"}>
                        {isHealthy ? "Healthy" : "Disease"}
                      </Badge>
                    </div>
                  </div>
                  {obs.notes && (
                    <p className="text-xs text-text-secondary mt-1">{obs.notes}</p>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}