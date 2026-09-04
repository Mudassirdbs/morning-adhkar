"use client";

import { useState } from "react";
import { dailyDuas } from "@/data/dailyDuas";
import { ZikrCard } from "@/components/ZikrCard";
import {
  Play,
  Pause,
  ListRestart,
} from "lucide-react";

export default function DailyDuasPage() {
  const [doneCount, setDoneCount] = useState(0);
  const [activeZikrIndex, setActiveZikrIndex] = useState<number | null>(null);
  const [isContinuousPlay, setIsContinuousPlay] = useState(false);

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
    <div id="adhkar-app-content" className="pb-8">
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
    </div>
  );
}
