import { dailyDuas } from "@/data/dailyDuas";

export interface DailyDuaApiItem {
  id: number;
  count: number;
  arabicText: string;
  fazeelat: string;
  title?: string;
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
  const data: DailyDuaApiItem[] = dailyDuas.map((item) => {
    const fazeelat = item.virtue
      ? item.source
        ? `${item.virtue} (${item.source})`
        : item.virtue
      : item.source || "";

    return {
      id: item.id,
      count: item.count,
      arabicText: item.text.trim(),
      fazeelat: fazeelat.trim(),
      ...(item.title ? { title: item.title } : {}),
    };
  });

  return Response.json(data, {
    headers: CORS_HEADERS,
  });
}
