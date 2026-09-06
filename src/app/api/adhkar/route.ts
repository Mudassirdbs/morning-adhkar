import { azkar } from "@/data/azkar";

export interface AdhkarApiItem {
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
  const data: AdhkarApiItem[] = azkar.map((item) => {
    const arabicText = [item.intro, item.text].filter(Boolean).join(" ").trim();
    const fazeelat = item.virtue
      ? item.source
        ? `${item.virtue} (${item.source})`
        : item.virtue
      : item.source || "";

    return {
      id: item.id,
      count: item.count,
      arabicText,
      fazeelat: fazeelat.trim(),
      ...(item.title ? { title: item.title } : {}),
    };
  });

  return Response.json(data, {
    headers: CORS_HEADERS,
  });
}
