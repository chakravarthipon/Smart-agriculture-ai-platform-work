import { NextRequest } from "next/server";
import { getDiseaseByKey, DISEASE_DATABASE } from "@/lib/disease-data";
import { successResponse, notFoundResponse } from "@/lib/api-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const disease = getDiseaseByKey(id);

  if (!disease) return notFoundResponse("Disease not found");

  const relatedDiseases = DISEASE_DATABASE.filter(
    (d) => d.cropName === disease.cropName && d.diseaseKey !== disease.diseaseKey
  ).slice(0, 5);

  return successResponse({ disease, relatedDiseases });
}