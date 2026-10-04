"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Leaf,
  MapPin,
  Calendar,
  FileText,
  ScanLine,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface Crop {
  id: string;
  name: string;
  variety: string | null;
  plantingDate: string | null;
  fieldName: string | null;
  location: string | null;
  notes: string | null;
  status: string;
  createdAt: string;
}

interface Detection {
  id: string;
  diseaseName: string;
  confidence: number;
  predictedClass: string;
  createdAt: string;
}

export default function CropDetailPage() {
  const params = useParams();
  const [crop, setCrop] = useState<Crop | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/v1/crops/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setCrop(data.data.crop);
          setDetections(data.data.detections);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="skeleton h-6 w-48" />
        <div className="skeleton h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary">Crop not found</p>
        <Link href="/dashboard/crops" className="text-forest text-sm mt-2 inline-block">
          Back to crops
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Link
        href="/dashboard/crops"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary"
      >
        <ArrowLeft size={14} />
        Back to crops
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-mint rounded-xl flex items-center justify-center">
            <Leaf size={24} className="text-forest" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-text-primary">{crop.name}</h1>
            {crop.variety && <p className="text-sm text-text-secondary">{crop.variety}</p>}
          </div>
        </div>
        <Badge variant={crop.status === "healthy" ? "success" : "warning"} size="md">
          {crop.status}
        </Badge>
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-text-primary mb-4">Crop Details</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          {crop.fieldName && (
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">Field</p>
                <p className="text-sm text-text-primary">{crop.fieldName}</p>
              </div>
            </div>
          )}
          {crop.location && (
            <div className="flex items-center gap-3">
              <MapPin size={16} className="text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">Location</p>
                <p className="text-sm text-text-primary">{crop.location}</p>
              </div>
            </div>
          )}
          {crop.plantingDate && (
            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-text-secondary" />
              <div>
                <p className="text-xs text-text-secondary">Planting Date</p>
                <p className="text-sm text-text-primary">
                  {new Date(crop.plantingDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
          {crop.notes && (
            <div className="flex items-start gap-3">
              <FileText size={16} className="text-text-secondary mt-0.5" />
              <div>
                <p className="text-xs text-text-secondary">Notes</p>
                <p className="text-sm text-text-primary">{crop.notes}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Detections */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-text-primary">Detection History</h3>
          <Link
            href="/dashboard/detect"
            className="text-xs text-forest hover:text-forest-deep flex items-center gap-1"
          >
            <ScanLine size={12} /> New Detection
          </Link>
        </div>
        {detections.length === 0 ? (
          <div className="text-center py-8">
            <ScanLine size={24} className="text-text-secondary/30 mx-auto mb-2" />
            <p className="text-sm text-text-secondary">No detections recorded for this crop yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {detections.map((d) => {
              const isHealthy = d.predictedClass?.toLowerCase().includes("healthy");
              return (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3 bg-bg rounded-lg"
                >
                  <div>
                    <p className="text-sm text-text-primary font-medium">
                      {d.diseaseName || d.predictedClass}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {new Date(d.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary">
                      {Math.round(d.confidence * 100)}%
                    </span>
                    <Badge variant={isHealthy ? "success" : "warning"}>
                      {isHealthy ? "Healthy" : "Disease"}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}