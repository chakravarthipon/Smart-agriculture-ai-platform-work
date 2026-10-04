"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, BookOpen, Leaf, AlertTriangle, Shield, ChevronRight } from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Input from "@/components/ui/Input";

interface Disease {
  diseaseKey: string;
  diseaseName: string;
  cropName: string;
  category: string;
  severity: string;
  overview: string;
  isHealthy: boolean;
}

export default function DiseasesPage() {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [crops, setCrops] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedDisease, setSelectedDisease] = useState<Disease | null>(null);
  const [diseaseDetail, setDiseaseDetail] = useState<{
    overview?: string;
    symptoms?: string[];
    causes?: string[];
    conditions?: string[];
    prevention?: string[];
    management?: string[];
    suggestedActions?: string[];
  } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (cropFilter) params.set("crop", cropFilter);
    if (categoryFilter) params.set("category", categoryFilter);

    fetch(`/api/v1/diseases?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setDiseases(data.data.diseases);
          setCrops(data.data.crops);
          setCategories(data.data.categories);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, cropFilter, categoryFilter]);

  const handleSelectDisease = async (disease: Disease) => {
    setSelectedDisease(disease);
    const res = await fetch(`/api/v1/diseases/${disease.diseaseKey}`);
    const data = await res.json();
    if (data.success) {
      setDiseaseDetail(data.data.disease);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "error";
      case "moderate": return "warning";
      case "low": return "info";
      default: return "success";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold text-text-primary">Disease Library</h1>
        <p className="text-sm text-text-secondary">
          Browse crop diseases with symptoms, causes, and management guidance
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search diseases or crops..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
        <select
          value={cropFilter}
          onChange={(e) => setCropFilter(e.target.value)}
          className="px-3 py-2.5 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/20"
        >
          <option value="">All Crops</option>
          {crops.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2.5 text-sm bg-surface border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-forest/20"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Disease list */}
        <div className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto">
          {loading ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="bg-surface border border-border rounded-lg p-4">
                <div className="skeleton h-4 w-32 mb-2" />
                <div className="skeleton h-3 w-20" />
              </div>
            ))
          ) : diseases.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen size={24} className="text-text-secondary/30 mx-auto mb-2" />
              <p className="text-sm text-text-secondary">No diseases found</p>
            </div>
          ) : (
            diseases.map((d) => (
              <motion.button
                key={d.diseaseKey}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => handleSelectDisease(d)}
                className={`w-full text-left p-3 rounded-lg border transition-all ${
                  selectedDisease?.diseaseKey === d.diseaseKey
                    ? "border-forest bg-mint"
                    : "border-border bg-surface hover:border-forest/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {d.isHealthy ? (
                      <Leaf size={14} className="text-success" />
                    ) : (
                      <AlertTriangle size={14} className="text-warning" />
                    )}
                    <span className="text-sm font-medium text-text-primary">{d.diseaseName}</span>
                  </div>
                  <ChevronRight size={12} className="text-text-secondary" />
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-text-secondary">{d.cropName}</span>
                  <Badge variant={getSeverityColor(d.severity) as "error" | "warning" | "info" | "success"} size="sm">
                    {d.category}
                  </Badge>
                </div>
              </motion.button>
            ))
          )}
        </div>

        {/* Disease detail */}
        <div className="lg:col-span-2">
          {!selectedDisease ? (
            <Card className="text-center py-16">
              <BookOpen size={32} className="text-text-secondary/30 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-text-primary mb-2">Select a Disease</h3>
              <p className="text-sm text-text-secondary">
                Choose a disease from the list to view detailed information.
              </p>
            </Card>
          ) : (
            <Card>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-display text-lg font-bold text-text-primary">
                    {selectedDisease.diseaseName}
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-text-secondary">{selectedDisease.cropName}</span>
                    <Badge variant={getSeverityColor(selectedDisease.severity) as "error" | "warning" | "info" | "success"}>
                      {selectedDisease.category}
                    </Badge>
                    {!selectedDisease.isHealthy && (
                      <Badge variant={getSeverityColor(selectedDisease.severity) as "error" | "warning" | "info" | "success"}>
                        {selectedDisease.severity} severity
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {diseaseDetail ? (
                <div className="space-y-5">
                  {diseaseDetail.overview && (
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-2">Overview</h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {diseaseDetail.overview}
                      </p>
                    </div>
                  )}

                  {Array.isArray(diseaseDetail.symptoms) && diseaseDetail.symptoms.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-2">Symptoms</h3>
                      <ul className="space-y-1.5">
                        {(diseaseDetail.symptoms as string[]).map((s, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                            <span className="w-1.5 h-1.5 bg-warning rounded-full mt-1.5 flex-shrink-0" />
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(diseaseDetail.causes) && diseaseDetail.causes.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-2">Causes</h3>
                      <ul className="space-y-1.5">
                        {(diseaseDetail.causes as string[]).map((c, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                            <span className="w-1.5 h-1.5 bg-error rounded-full mt-1.5 flex-shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(diseaseDetail.prevention) && diseaseDetail.prevention.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-2">Prevention</h3>
                      <ul className="space-y-1.5">
                        {(diseaseDetail.prevention as string[]).map((p, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                            <Shield size={14} className="text-forest mt-0.5 flex-shrink-0" />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {Array.isArray(diseaseDetail.management) && diseaseDetail.management.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-text-primary mb-2">Management</h3>
                      <ul className="space-y-1.5">
                        {(diseaseDetail.management as string[]).map((m, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-text-secondary">
                            <Leaf size={14} className="text-fresh mt-0.5 flex-shrink-0" />
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-text-secondary">{selectedDisease.overview}</p>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}