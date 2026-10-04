"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  History,
  Download,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ScanLine,
  AlertTriangle,
  X,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Link from "next/link";

interface Detection {
  id: string;
  cropName: string;
  diseaseName: string;
  predictedClass: string;
  confidence: number;
  status: string;
  imagePath: string;
  modelVersion: string;
  createdAt: string;
}

export default function HistoryPage() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Delete confirmation modal state
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDetections = useCallback(async () => {
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
      });

      if (search) {
        params.set("search", search);
      }

      const res = await fetch(`/api/v1/detections?${params}`);
      const data = await res.json();

      if (data.success) {
        setDetections(data.data.detections);
        setTotalPages(data.data.pagination.totalPages);
        setTotal(data.data.pagination.total);
      }
    } catch (error) {
      console.error("Failed to fetch detections:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchDetections();
  }, [fetchDetections]);

  /**
   * Opens the confirmation modal.
   * No deletion happens at this stage.
   */
  const handleDeleteClick = (id: string) => {
    setDeleteId(id);
  };

  /**
   * Actually deletes the detection after
   * the user confirms in the modal.
   */
  const handleConfirmDelete = async () => {
    if (!deleteId) return;

    setDeleting(true);

    try {
      const res = await fetch(
        `/api/v1/detections?id=${deleteId}`,
        {
          method: "DELETE",
        }
      );

      const data = await res.json();

      if (data.success) {
        setDeleteId(null);
        await fetchDetections();
      } else {
        console.error(
          "Failed to delete detection:",
          data.error
        );
      }
    } catch (error) {
      console.error(
        "Failed to delete detection:",
        error
      );
    } finally {
      setDeleting(false);
    }
  };

  /**
   * Closes the confirmation modal.
   */
  const handleCancelDelete = () => {
    if (deleting) return;
    setDeleteId(null);
  };

  const handleExport = () => {
    const headers = [
      "ID",
      "Crop",
      "Condition",
      "Confidence",
      "Status",
      "Date",
    ];

    const rows = detections.map((d) => [
      d.id,
      d.cropName || "Unknown",
      d.diseaseName || d.predictedClass,
      `${Math.round(d.confidence * 100)}%`,
      d.status,
      new Date(d.createdAt).toISOString(),
    ]);

    const csv = [headers, ...rows]
      .map((r) => r.join(","))
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `detections-export-${Date.now()}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-text-primary">
              Detection History
            </h1>

            <p className="text-sm text-text-secondary">
              {total} total detections
            </p>
          </div>

          {detections.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              icon={<Download size={14} />}
            >
              Export CSV
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search by crop or disease..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              icon={<Search size={16} />}
            />
          </div>
        </div>

        {/* Table */}
        <Card padding={false}>
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4"
                >
                  <div className="skeleton h-10 w-10 rounded-lg" />

                  <div className="flex-1 space-y-1.5">
                    <div className="skeleton h-4 w-32" />
                    <div className="skeleton h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : detections.length === 0 ? (
            <div className="text-center py-16">
              <History
                size={32}
                className="text-text-secondary/30 mx-auto mb-3"
              />

              <h3 className="text-base font-semibold text-text-primary mb-2">
                No Detections Yet
              </h3>

              <p className="text-sm text-text-secondary mb-5">
                Upload your first leaf image to start building
                your detection history.
              </p>

              <Link
                href="/dashboard/detect"
                className="inline-flex items-center gap-2 bg-forest text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-forest-deep"
              >
                <ScanLine size={16} />
                Start Detection
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-text-secondary py-3 px-4">
                      Image
                    </th>

                    <th className="text-left text-xs font-medium text-text-secondary py-3 px-4">
                      Crop
                    </th>

                    <th className="text-left text-xs font-medium text-text-secondary py-3 px-4">
                      Condition
                    </th>

                    <th className="text-left text-xs font-medium text-text-secondary py-3 px-4">
                      Confidence
                    </th>

                    <th className="text-left text-xs font-medium text-text-secondary py-3 px-4">
                      Date
                    </th>

                    <th className="text-left text-xs font-medium text-text-secondary py-3 px-4">
                      Status
                    </th>

                    <th className="text-left text-xs font-medium text-text-secondary py-3 px-4">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {detections.map((d) => {
                    const isHealthy =
                      d.predictedClass
                        ?.toLowerCase()
                        .includes("healthy");

                    return (
                      <motion.tr
                        key={d.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b border-border/50 hover:bg-mint/20 transition-colors"
                      >
                        {/* Image */}
                        <td className="py-3 px-4">
                          <div className="w-10 h-10 bg-mint rounded-lg overflow-hidden flex items-center justify-center">
                            <ScanLine
                              size={16}
                              className="text-forest/50"
                            />
                          </div>
                        </td>

                        {/* Crop */}
                        <td className="py-3 px-4 text-sm text-text-primary">
                          {d.cropName || "Unknown"}
                        </td>

                        {/* Condition */}
                        <td className="py-3 px-4 text-sm text-text-primary">
                          {d.diseaseName ||
                            d.predictedClass}
                        </td>

                        {/* Confidence */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-14 bg-border rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${isHealthy
                                    ? "bg-success"
                                    : "bg-warning"
                                  }`}
                                style={{
                                  width: `${Math.round(
                                    d.confidence * 100
                                  )}%`,
                                }}
                              />
                            </div>

                            <span className="text-xs text-text-secondary">
                              {Math.round(
                                d.confidence * 100
                              )}
                              %
                            </span>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-4 text-xs text-text-secondary">
                          {new Date(
                            d.createdAt
                          ).toLocaleDateString()}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              isHealthy
                                ? "success"
                                : "warning"
                            }
                          >
                            {d.status}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() =>
                                handleDeleteClick(d.id)
                              }
                              className="p-1.5 text-text-secondary hover:text-error rounded transition-colors"
                              title="Delete"
                              type="button"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <p className="text-xs text-text-secondary">
                Page {page} of {totalPages}
              </p>

              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setPage(Math.max(1, page - 1))
                  }
                  disabled={page === 1}
                  className="p-1.5 rounded hover:bg-mint disabled:opacity-30 transition-colors"
                  type="button"
                >
                  <ChevronLeft size={16} />
                </button>

                <button
                  onClick={() =>
                    setPage(
                      Math.min(
                        totalPages,
                        page + 1
                      )
                    )
                  }
                  disabled={page === totalPages}
                  className="p-1.5 rounded hover:bg-mint disabled:opacity-30 transition-colors"
                  type="button"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteId && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelDelete}
            />

            {/* Modal */}
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 10,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 10,
              }}
              transition={{
                duration: 0.2,
              }}
              className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-xl p-6"
            >
              {/* Close button */}
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={deleting}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg transition-colors disabled:opacity-40"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Warning icon */}
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-error/10 mb-4">
                <AlertTriangle
                  size={24}
                  className="text-error"
                />
              </div>

              {/* Content */}
              <div className="pr-6">
                <h2 className="text-lg font-semibold text-text-primary">
                  Delete Detection?
                </h2>

                <p className="text-sm text-text-secondary mt-2 leading-relaxed">
                  Are you sure you want to delete this
                  detection record? This action cannot be
                  undone.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelDelete}
                  disabled={deleting}
                >
                  Cancel
                </Button>

                <Button
                  size="sm"
                  onClick={handleConfirmDelete}
                  isLoading={deleting}
                  className="bg-error hover:bg-error/90 text-white"
                  icon={
                    !deleting ? (
                      <Trash2 size={14} />
                    ) : undefined
                  }
                >
                  {deleting
                    ? "Deleting..."
                    : "Delete Detection"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}