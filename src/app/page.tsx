"use client";

import { useState } from "react";
import { azkar } from "@/data/azkar";
import { ZikrCard } from "@/components/ZikrCard";
import {
  Play,
  Pause,
  ListRestart,
} from "lucide-react";

export default function HomePage() {
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
    scrollToZikr(azkar[startIndex].id);
  };

  const handleNextZikr = () => {
    if (activeZikrIndex === null) {
      setActiveZikrIndex(0);
      scrollToZikr(azkar[0].id);
      return;
    }
    if (activeZikrIndex < azkar.length - 1) {
      const nextIndex = activeZikrIndex + 1;
      setActiveZikrIndex(nextIndex);
      scrollToZikr(azkar[nextIndex].id);
    } else {
      // Reached the end
      setIsContinuousPlay(false);
      setActiveZikrIndex(null);
    }
  };

  const handleCardAudioEnded = (index: number) => {
    if (isContinuousPlay) {
      if (index < azkar.length - 1) {
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
        <h1 className="sr-only">أذكار الصباح</h1>

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
              المنجز: {doneCount} / {azkar.length}
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

        {/* Adhkar Cards Section */}
        <section className="mt-6">
          {azkar.map((zikr, index) => {
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
                    Math.max(0, Math.min(azkar.length, c + (done ? 1 : -1)))
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
