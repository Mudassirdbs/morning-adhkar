"use client";

import { useState } from "react";
import { dailyDuas } from "@/data/dailyDuas";
import { ZikrCard } from "@/components/ZikrCard";
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  ListRestart,
  LocateFixed,
} from "lucide-react";

export default function DailyDuasPage() {
  const [doneCount, setDoneCount] = useState(0);
  const [activeZikrIndex, setActiveZikrIndex] = useState<number | null>(null);
  const [isContinuousPlay, setIsContinuousPlay] = useState(false);

  const activeZikr = activeZikrIndex !== null ? dailyDuas[activeZikrIndex] : null;

  // Auto scroll to active zikr card
  const scrollToZikr = (id: number) => {
    const el = document.getElementById(`zikr-${id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const startPlayAll = () => {
    if (isContinuousPlay && activeZikrIndex !== null) {
      // Pause
      setIsContinuousPlay(false);
      return;
    }

    const startIndex = activeZikrIndex !== null ? activeZikrIndex : 0;
    setActiveZikrIndex(startIndex);
    setIsContinuousPlay(true);
    scrollToZikr(dailyDuas[startIndex].id);
  };

  const handleNextZikr = () => {
    if (activeZikrIndex === null) {
      setActiveZikrIndex(0);
      scrollToZikr(dailyDuas[0].id);
      return;
    }
    if (activeZikrIndex < dailyDuas.length - 1) {
      const nextIndex = activeZikrIndex + 1;
      setActiveZikrIndex(nextIndex);
      scrollToZikr(dailyDuas[nextIndex].id);
    } else {
      // Reached the end
      setIsContinuousPlay(false);
      setActiveZikrIndex(null);
    }
  };

  const handlePrevZikr = () => {
    if (activeZikrIndex !== null && activeZikrIndex > 0) {
      const prevIndex = activeZikrIndex - 1;
      setActiveZikrIndex(prevIndex);
      scrollToZikr(dailyDuas[prevIndex].id);
    }
  };

  const handleCardAudioEnded = (index: number) => {
    if (isContinuousPlay) {
      if (index < dailyDuas.length - 1) {
        setTimeout(() => {
          handleNextZikr();
        }, 500);
      } else {
        setIsContinuousPlay(false);
      }
    }
  };

  const resetAllProgress = () => {
    if (confirm("هل ترغب في إعادة ضبط جميع العدادات؟")) {
      setDoneCount(0);
      window.location.reload();
    }
  };

  return (
    <div id="adhkar-app-content" className="pb-28">
      <main className="mx-auto max-w-5xl xl:max-w-6xl px-4 pb-12 pt-6">
        <h1 className="sr-only">أدعية وأذكار يومية — Daily Islamic Duas</h1>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-card p-3.5 shadow-sm">
          <button
            type="button"
            onClick={startPlayAll}
            className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary/90 active:scale-95"
          >
            {isContinuousPlay ? (
              <>
                <Pause size={18} fill="currentColor" />
                <span>إيقاف التشغيل المتتالي</span>
              </>
            ) : (
              <>
                <Play size={18} fill="currentColor" />
                <span>بدء الاستماع المتتالي</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-secondary px-3.5 py-2 text-xs font-bold text-secondary-foreground sm:text-sm">
              المنجز: {doneCount} / {dailyDuas.length}
            </span>

            {doneCount > 0 && (
              <button
                type="button"
                onClick={resetAllProgress}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-secondary hover:text-foreground shadow-sm"
              >
                <ListRestart size={15} />
                <span>إعادة ضبط الكل</span>
              </button>
            )}
          </div>
        </div>

        {/* Duas Cards Section */}
        <section className="mt-6">
          {dailyDuas.map((zikr, index) => {
            const isThisActive = activeZikrIndex === index;
            return (
              <ZikrCard
                key={zikr.id}
                zikr={zikr}
                isActive={isThisActive}
                isPlayingGlobal={isThisActive && isContinuousPlay}
                onPlayRequest={() => {
                  setActiveZikrIndex(index);
                  setIsContinuousPlay(true);
                }}
                onAudioEnded={() => handleCardAudioEnded(index)}
                onProgress={(done) =>
                  setDoneCount((c) =>
                    Math.max(0, Math.min(dailyDuas.length, c + (done ? 1 : -1)))
                  )
                }
              />
            );
          })}
        </section>
      </main>

      {/* Floating Bottom Audio Player Bar */}
      {activeZikr && (
        <aside
          aria-label="المشغل الصوتي العام للأدعية"
          className="fixed bottom-3 left-3 right-3 z-40 mx-auto max-w-3xl xl:max-w-4xl rounded-2xl border-2 border-primary/30 bg-card/95 p-3 shadow-2xl backdrop-blur-md transition-all duration-300 sm:bottom-5"
        >
          <div className="flex items-center justify-between gap-3">
            {/* Dhikr Info */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <button
                type="button"
                onClick={() => scrollToZikr(activeZikr.id)}
                title="الانتقال إلى موضع الدعاء"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition hover:bg-primary hover:text-primary-foreground shadow-sm"
              >
                <LocateFixed size={18} />
              </button>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-bold text-accent">
                    الدعاء {activeZikrIndex! + 1} من {dailyDuas.length}
                  </span>
                  {isContinuousPlay && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-primary">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary animate-ping" />
                      <span>تشغيل متتالي</span>
                    </span>
                  )}
                </div>
                <p className="truncate text-xs font-semibold text-foreground mt-0.5">
                  {activeZikr.title ? `${activeZikr.title} — ` : ""}
                  {activeZikr.text}
                </p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={handlePrevZikr}
                disabled={activeZikrIndex === 0}
                title="الدعاء السابق"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition hover:bg-primary/20 disabled:opacity-40"
              >
                <SkipForward size={17} />
              </button>

              <button
                type="button"
                onClick={startPlayAll}
                title={isContinuousPlay ? "إيقاف مؤقت" : "متابعة التشغيل"}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:bg-primary/90 active:scale-95"
              >
                {isContinuousPlay ? (
                  <Pause size={20} fill="currentColor" />
                ) : (
                  <Play size={20} fill="currentColor" className="translate-x-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleNextZikr}
                disabled={activeZikrIndex === dailyDuas.length - 1}
                title="الدعاء التالي"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition hover:bg-primary/20 disabled:opacity-40"
              >
                <SkipBack size={17} />
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
