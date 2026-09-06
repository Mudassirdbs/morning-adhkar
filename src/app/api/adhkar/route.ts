import { azkar } from "@/data/azkar";

export interface AdhkarApiItem {
  id: number;
  count: number;
  intro: string;
  text: string;
  source: string;
  virtue: string;
  audio: string | null;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Cache-Control": "s-maxage=86400, stale-while-revalidate",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function GET() {
  const payload: AdhkarApiItem[] = azkar.map((item) => ({
    id: item.id,
    count: item.count,
    intro: item.intro || "",
    text: item.text,
    source: item.source || "",
    virtue: item.virtue || "",
    audio: item.audio || null,
  }));

  return Response.json(payload, {
    headers: CORS_HEADERS,
  });
}
