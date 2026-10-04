"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  ScanLine,
  Image as ImageIcon,
  FileCheck,
  AlertCircle,
  Leaf,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";

interface DiseaseInfo {
  isHealthy: boolean;
  overview: string;
  symptoms: string[];
  prevention: string[];
  management: string[];
  severity: string;
  category: string;
}

interface DetectionResult {
  detection_id: string;
  crop: string;
  disease_name: string;
  confidence: number;
  status: string;
  disease_info: DiseaseInfo | null;
  recommendations: string[];
  top_predictions: Array<{
    class: string;
    disease_name: string;
    confidence: number;
  }>;
  image_url: string;
  created_at: string;
}

export default function DetectPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((file: File) => {
    setError("");

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Only JPEG and PNG images are supported");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setResult(null);

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);

      const file = e.dataTransfer.files[0];

      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);

      const res = await fetch("/api/v1/detections/predict", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setResult(data.data);
      } else {
        setError(data.error || "Analysis failed");
      }
    } catch {
      setError(
        "An error occurred during analysis. Please try again."
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl font-bold text-text-primary">
          AI Disease Detection
        </h1>

        <p className="text-sm text-text-secondary">
          Upload a clear photo of a plant leaf to identify potential
          diseases using AI analysis.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            {/* Upload area */}
            <Card padding={false}>
              <div
                className={`p-8 transition-colors ${dragOver ? "dropzone-active" : ""
                  }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                {!previewUrl ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-mint rounded-2xl flex items-center justify-center mx-auto mb-5">
                      <Upload
                        size={28}
                        className="text-forest"
                      />
                    </div>

                    <h3 className="text-base font-semibold text-text-primary mb-2">
                      Upload a Leaf Image
                    </h3>

                    <p className="text-sm text-text-secondary mb-6">
                      Drag and drop your image here, or click to
                      browse
                    </p>

                    {/* Browse Files only */}
                    <div className="flex items-center justify-center">
                      <Button
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        icon={<ImageIcon size={16} />}
                      >
                        Browse Files
                      </Button>
                    </div>

                    <p className="text-xs text-text-secondary mt-4">
                      Supported formats: JPEG, PNG &middot;
                      Maximum size: 10MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Image preview */}
                    <div className="relative">
                      <div className="bg-bg rounded-xl p-3">
                        <div className="relative aspect-video max-h-[400px] rounded-lg overflow-hidden bg-mint flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={previewUrl}
                            alt="Selected leaf"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleReset}
                        className="absolute top-5 right-5 p-2 bg-surface/90 border border-border rounded-lg hover:bg-surface transition-colors"
                        title="Remove image"
                        type="button"
                      >
                        <X
                          size={16}
                          className="text-text-secondary"
                        />
                      </button>
                    </div>

                    {/* File info */}
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-3">
                        <FileCheck
                          size={16}
                          className="text-forest"
                        />

                        <div>
                          <p className="text-sm text-text-primary font-medium">
                            {selectedFile?.name}
                          </p>

                          <p className="text-xs text-text-secondary">
                            {selectedFile
                              ? `${(
                                selectedFile.size /
                                1024 /
                                1024
                              ).toFixed(1)} MB`
                              : ""}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        icon={<RefreshCw size={14} />}
                      >
                        Replace
                      </Button>
                    </div>

                    {/* Analyze button */}
                    <div className="flex items-center justify-center pt-2">
                      <Button
                        onClick={handleAnalyze}
                        isLoading={analyzing}
                        size="lg"
                        className="min-w-[200px]"
                        icon={<ScanLine size={18} />}
                      >
                        {analyzing
                          ? "Analyzing Image..."
                          : "Analyze Image"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    handleFile(file);
                  }
                }}
              />
            </Card>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 bg-error/10 border border-error/20 text-error text-sm rounded-lg px-4 py-3"
              >
                <AlertCircle size={16} />
                {error}
              </motion.div>
            )}

            {/* Tips */}
            <Card>
              <h3 className="text-sm font-semibold text-text-primary mb-3">
                Tips for Best Results
              </h3>

              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Use a clear, well-lit photo of a single leaf",
                  "Center the leaf in the frame",
                  "Avoid blurry or dark images",
                  "Include the entire leaf surface",
                ].map((tip) => (
                  <div
                    key={tip}
                    className="flex items-start gap-2"
                  >
                    <Leaf
                      size={14}
                      className="text-forest mt-0.5 flex-shrink-0"
                    />

                    <span className="text-xs text-text-secondary">
                      {tip}
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        ) : (
          /* Results */
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="grid lg:grid-cols-2 gap-5">
              {/* Image */}
              <Card>
                <div className="aspect-video rounded-lg overflow-hidden bg-mint flex items-center justify-center">
                  {previewUrl && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={previewUrl}
                      alt="Analyzed leaf"
                      className="max-w-full max-h-full object-contain"
                    />
                  )}
                </div>
              </Card>

              {/* Result summary */}
              <Card>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${result.disease_info?.isHealthy
                          ? "bg-success/10"
                          : "bg-warning/10"
                        }`}
                    >
                      {result.disease_info?.isHealthy ? (
                        <Leaf
                          size={20}
                          className="text-success"
                        />
                      ) : (
                        <AlertCircle
                          size={20}
                          className="text-warning"
                        />
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-text-secondary">
                        Detection Result
                      </p>

                      <h2 className="text-lg font-semibold text-text-primary">
                        {result.disease_name}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-secondary">
                        Crop
                      </span>

                      <span className="text-sm font-medium text-text-primary">
                        {result.crop}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-secondary">
                        Confidence
                      </span>

                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-border rounded-full h-2">
                          <div
                            className="bg-forest h-2 rounded-full transition-all"
                            style={{
                              width: `${Math.round(
                                result.confidence * 100
                              )}%`,
                            }}
                          />
                        </div>

                        <span className="text-sm font-semibold text-forest">
                          {Math.round(
                            result.confidence * 100
                          )}
                          %
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-secondary">
                        Category
                      </span>

                      <Badge variant="info">
                        {result.disease_info?.category ||
                          "Unknown"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-secondary">
                        Severity
                      </span>

                      <Badge
                        variant={
                          result.disease_info?.severity ===
                            "high"
                            ? "error"
                            : result.disease_info?.severity ===
                              "moderate"
                              ? "warning"
                              : result.disease_info?.severity ===
                                "low"
                                ? "info"
                                : "success"
                        }
                      >
                        {result.disease_info?.severity || "none"}
                      </Badge>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-text-secondary">
                        Detection ID
                      </span>

                      <span className="text-xs text-text-secondary font-mono">
                        {result.detection_id?.slice(0, 8)}...
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Disease information */}
            {result.disease_info?.overview && (
              <Card>
                <h3 className="text-base font-semibold text-text-primary mb-4">
                  Disease Information
                </h3>

                <p className="text-sm text-text-secondary leading-relaxed mb-5">
                  {result.disease_info.overview}
                </p>

                {result.disease_info.symptoms &&
                  result.disease_info.symptoms.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-text-primary mb-2">
                        Symptoms
                      </h4>

                      <ul className="space-y-1.5">
                        {result.disease_info.symptoms.map(
                          (s: string, i: number) => (
                            <li
                              key={i}
                              className="flex items-start gap-2 text-sm text-text-secondary"
                            >
                              <span className="w-1.5 h-1.5 bg-warning rounded-full mt-1.5 flex-shrink-0" />
                              {s}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}
              </Card>
            )}

            {/* Recommendations */}
            {result.recommendations &&
              result.recommendations.length > 0 && (
                <Card>
                  <h3 className="text-base font-semibold text-text-primary mb-4">
                    Recommended Actions
                  </h3>

                  <div className="space-y-3">
                    {result.recommendations.map(
                      (rec: string, i: number) => (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 bg-mint/50 rounded-lg"
                        >
                          <span className="w-5 h-5 bg-forest text-white text-xs rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>

                          <span className="text-sm text-text-primary">
                            {rec}
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                    <p className="text-xs text-text-secondary">
                      <strong>Note:</strong> This AI analysis is
                      decision-support information, not a definitive
                      laboratory diagnosis. We recommend consulting
                      an agricultural expert for confirmation of
                      disease identification and treatment guidance.
                    </p>
                  </div>
                </Card>
              )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleReset}
                icon={<ScanLine size={16} />}
              >
                Analyze Another Image
              </Button>

              <Button
                variant="outline"
                onClick={() =>
                  router.push("/dashboard/history")
                }
                icon={<ArrowRight size={16} />}
              >
                View Detection History
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}