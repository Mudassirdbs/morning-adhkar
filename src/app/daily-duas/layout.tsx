import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "أدعية وأذكار يومية مكتوبة ومسموعة — Daily Islamic Duas",
  description:
    "أدعية وأذكار يومية مأثورة من حصن المسلم مكتوبة بالتشكيل الكامل ومسموعة بصوت نقي مع عداد تفاعلي ومشغل صوتي متتالي.",
  openGraph: {
    title: "أدعية وأذكار يومية مكتوبة ومسموعة — Daily Islamic Duas",
    description:
      "استمع واقرأ الأدعية والأذكار اليومية من حصن المسلم مع عداد إلكتروني ومتابعة الإنجاز وتشغيل صوتي متتالي.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "أدعية وأذكار يومية مكتوبة ومسموعة — Daily Islamic Duas",
    description:
      "استمع واقرأ الأدعية والأذكار اليومية من حصن المسلم مع عداد إلكتروني ومتابعة الإنجاز وتشغيل صوتي متتالي.",
  },
};

export default function DailyDuasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
