import { dailyDuas } from "@/data/dailyDuas";

export interface DailyDuaApiItem {
  id: number;
  title: string;
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
  const payload: DailyDuaApiItem[] = dailyDuas.map((item) => ({
    id: item.id,
    title: item.title || "",
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
