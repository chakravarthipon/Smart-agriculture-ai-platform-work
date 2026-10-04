import { NextRequest } from "next/server";
import { DISEASE_DATABASE, getSupportedCrops } from "@/lib/disease-data";
import { successResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const crop = searchParams.get("crop");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const healthyOnly = searchParams.get("healthy") === "true";

  let results = [...DISEASE_DATABASE];

  if (crop) {
    results = results.filter((d) => d.cropName === crop);
  }
  if (category) {
    results = results.filter((d) => d.category === category);
  }
  if (healthyOnly) {
    results = results.filter((d) => d.isHealthy);
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(
      (d) =>
        d.diseaseName.toLowerCase().includes(q) ||
        d.cropName.toLowerCase().includes(q) ||
        d.overview?.toLowerCase().includes(q)
    );
  }

  const crops = getSupportedCrops();
  const categories = [...new Set(DISEASE_DATABASE.map((d) => d.category))].sort();

  return successResponse({
    diseases: results,
    crops,
    categories,
    total: results.length,
  });
}