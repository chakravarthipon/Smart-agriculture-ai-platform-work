"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Plus,
  Wheat,
  MapPin,
  Calendar,
  Search,
  Leaf,
  ArrowRight,
  AlertTriangle,
  X,
} from "lucide-react";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface Crop {
  id: string;
  name: string;
  variety: string | null;
  plantingDate: string | null;
  fieldName: string | null;
  location: string | null;
  status: string;
  createdAt: string;
}

export default function CropsPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [newCrop, setNewCrop] = useState({
    name: "",
    variety: "",
    plantingDate: "",
    fieldName: "",
    location: "",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  // Delete confirmation state
  const [deleteCrop, setDeleteCrop] = useState<Crop | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = () => {
    fetch("/api/v1/crops")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCrops(data.data.crops);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleAdd = async () => {
    if (!newCrop.name.trim()) return;

    setSaving(true);

    try {
      const res = await fetch("/api/v1/crops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCrop),
      });

      const data = await res.json();

      if (data.success) {
        setCrops([data.data, ...crops]);
        setShowAdd(false);
        setNewCrop({
          name: "",
          variety: "",
          plantingDate: "",
          fieldName: "",
          location: "",
          notes: "",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  // Open delete confirmation popup
  const handleDeleteClick = (crop: Crop) => {
    setDeleteCrop(crop);
  };

  // Cancel delete
  const handleCancelDelete = () => {
    if (deleting) return;
    setDeleteCrop(null);
  };

  // Confirm and delete crop
  const handleConfirmDelete = async () => {
    if (!deleteCrop) return;

    setDeleting(true);

    try {
      const res = await fetch(`/api/v1/crops/${deleteCrop.id}`, {
        method: "DELETE",
      });

      const data = await res.json().catch(() => null);

      if (res.ok && (!data || data.success !== false)) {
        setCrops((currentCrops) =>
          currentCrops.filter((crop) => crop.id !== deleteCrop.id)
        );

        setDeleteCrop(null);
      }
    } catch (error) {
      console.error("Failed to delete crop:", error);
    } finally {
      setDeleting(false);
    }
  };

  const filteredCrops = crops.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.fieldName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-text-primary">
            My Crops
          </h1>
          <p className="text-sm text-text-secondary">
            Manage your crops and track their health
          </p>
        </div>

        <Button
          onClick={() => setShowAdd(true)}
          icon={<Plus size={16} />}
        >
          Add Crop
        </Button>
      </div>

      {/* Add crop form */}
      {showAdd && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <h3 className="text-sm font-semibold text-text-primary mb-4">
              Add New Crop
            </h3>

            <div className="grid sm:grid-cols-2 gap-4">
              <Input
                label="Crop Name *"
                placeholder="e.g., Tomato"
                value={newCrop.name}
                onChange={(e) =>
                  setNewCrop({
                    ...newCrop,
                    name: e.target.value,
                  })
                }
              />

              <Input
                label="Variety"
                placeholder="e.g., Cherry Tomato"
                value={newCrop.variety}
                onChange={(e) =>
                  setNewCrop({
                    ...newCrop,
                    variety: e.target.value,
                  })
                }
              />

              <Input
                label="Planting Date"
                type="date"
                value={newCrop.plantingDate}
                onChange={(e) =>
                  setNewCrop({
                    ...newCrop,
                    plantingDate: e.target.value,
                  })
                }
              />

              <Input
                label="Field Name"
                placeholder="e.g., North Field"
                value={newCrop.fieldName}
                onChange={(e) =>
                  setNewCrop({
                    ...newCrop,
                    fieldName: e.target.value,
                  })
                }
              />

              <Input
                label="Location"
                placeholder="e.g., GPS or address"
                value={newCrop.location}
                onChange={(e) =>
                  setNewCrop({
                    ...newCrop,
                    location: e.target.value,
                  })
                }
              />

              <Input
                label="Notes"
                placeholder="Additional notes"
                value={newCrop.notes}
                onChange={(e) =>
                  setNewCrop({
                    ...newCrop,
                    notes: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex gap-3 mt-4">
              <Button
                onClick={handleAdd}
                isLoading={saving}
                size="sm"
              >
                Save Crop
              </Button>

              <Button
                variant="ghost"
                onClick={() => setShowAdd(false)}
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Search */}
      {crops.length > 0 && (
        <div className="max-w-sm">
          <Input
            placeholder="Search crops..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search size={16} />}
          />
        </div>
      )}

      {/* Crops grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <div className="skeleton h-5 w-32 mb-3" />
              <div className="skeleton h-4 w-48 mb-2" />
              <div className="skeleton h-3 w-24" />
            </div>
          ))}
        </div>
      ) : filteredCrops.length === 0 ? (
        <Card className="text-center py-12">
          <div className="w-14 h-14 bg-mint rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wheat size={28} className="text-forest" />
          </div>

          <h3 className="text-base font-semibold text-text-primary mb-2">
            {crops.length === 0 ? "No Crops Yet" : "No Crops Found"}
          </h3>

          <p className="text-sm text-text-secondary mb-5 max-w-sm mx-auto">
            {crops.length === 0
              ? "Add your first crop to start tracking its health and associating detections."
              : "Try a different search term."}
          </p>

          {crops.length === 0 && (
            <Button
              onClick={() => setShowAdd(true)}
              icon={<Plus size={16} />}
            >
              Add Your First Crop
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCrops.map((crop, i) => (
            <motion.div
              key={crop.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card hover>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-mint rounded-lg flex items-center justify-center">
                      <Leaf size={20} className="text-forest" />
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold text-text-primary">
                        {crop.name}
                      </h3>

                      {crop.variety && (
                        <p className="text-xs text-text-secondary">
                          {crop.variety}
                        </p>
                      )}
                    </div>
                  </div>

                  <Badge
                    variant={
                      crop.status === "healthy"
                        ? "success"
                        : "warning"
                    }
                  >
                    {crop.status}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  {crop.fieldName && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <MapPin size={12} />
                      <span>{crop.fieldName}</span>
                    </div>
                  )}

                  {crop.plantingDate && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Calendar size={12} />
                      <span>
                        Planted{" "}
                        {new Date(
                          crop.plantingDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-border">
                  <Link
                    href={`/dashboard/crops/${crop.id}`}
                    className="text-xs text-forest hover:text-forest-deep flex items-center gap-1"
                  >
                    View details <ArrowRight size={10} />
                  </Link>

                  <button
                    onClick={() => handleDeleteClick(crop)}
                    className="text-xs text-text-secondary hover:text-error ml-auto transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteCrop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCancelDelete}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6"
            >
              {/* Close button */}
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={deleting}
                className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-background transition-colors disabled:opacity-50"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Warning icon */}
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                <AlertTriangle
                  size={24}
                  className="text-error"
                />
              </div>

              <h2 className="text-lg font-semibold text-text-primary mb-2">
                Delete Crop?
              </h2>

              <p className="text-sm text-text-secondary leading-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-text-primary">
                  {deleteCrop.name}
                </span>
                ? This action cannot be undone.
              </p>

              {/* Actions */}
              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
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
                  className="!bg-error hover:!bg-error/90 !text-white"
                >
                  Delete Crop
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}