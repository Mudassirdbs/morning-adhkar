import type { Metadata } from "next";
import { Amiri } from "next/font/google";
import { IframeResizer } from "@/components/IframeResizer";
import "./globals.css";

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

export const metadata: Metadata = {
  title: "أذكار الصباح مكتوبة كاملة ومسموعة مع العداد",
  description:
    "أذكار الصباح مكتوبة كاملة ومسموعة بصوت نقي من حصن المسلم مع مشغل صوتي تفاعلي وعداد إلكتروني لكل ذكر وبيان فضله.",
  openGraph: {
    title: "أذكار الصباح مكتوبة كاملة ومسموعة مع العداد",
    description: "استمع واقرأ أذكار الصباح كاملة بصوت عذب مع العداد ومتابعة الإنجاز.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "أذكار الصباح مكتوبة كاملة ومسموعة مع العداد",
    description: "استمع واقرأ أذكار الصباح كاملة بصوت عذب مع العداد ومتابعة الإنجاز.",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={amiri.variable}>
      <body className="min-h-screen bg-background font-arabic antialiased selection:bg-primary/20">
        <IframeResizer />
        {children}
      </body>
    </html>
  );
}

