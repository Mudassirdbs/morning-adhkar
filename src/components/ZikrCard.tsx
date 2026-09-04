"use client";

import { useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  RotateCcw,
  Copy,
  Check,
  Send,
  MessageCircle,
  Facebook,
  Twitter,
  Loader2,
  Repeat,
  Volume2,
  VolumeX,
  Sparkles,
} from "lucide-react";
import type { Zikr } from "@/data/azkar";

interface ZikrCardProps {
  zikr: Zikr;
  onProgress?: (done: boolean) => void;
  isActive?: boolean;
  isPlayingGlobal?: boolean;
  onPlayRequest?: () => void;
  onAudioEnded?: () => void;
}

export function ZikrCard({
  zikr,
  onProgress,
  isActive = false,
  isPlayingGlobal = false,
  onPlayRequest,
  onAudioEnded,
}: ZikrCardProps) {
  const [count, setCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isMuted, setIsMuted] = useState(false);
  const [autoRepeatWithCount, setAutoRepeatWithCount] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isTTS, setIsTTS] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);

  const done = count >= zikr.count;
  const fullText = [zikr.intro, zikr.text].filter(Boolean).join(" ");
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    setShareUrl(window.location.href);
  }, []);

  const shareText = shareUrl ? `${fullText}\n${shareUrl}` : fullText;

  // Sync external global playback state
  useEffect(() => {
    if (isActive && isPlayingGlobal) {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(() => playTTS());
      }
    } else if (!isActive && isPlaying) {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
      }
      setIsPlaying(false);
      window.speechSynthesis?.cancel();
    }
  }, [isActive, isPlayingGlobal]);

  // Clean up audio & speech on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const playTTS = () => {
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    if (!synth) return;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(fullText);
    utter.lang = "ar-SA";
    utter.rate = playbackRate * 0.9;
    utter.onstart = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setIsTTS(true);
    };
    utter.onend = () => {
      setIsPlaying(false);
      handleAudioFinished();
    };
    utter.onerror = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };
    synth.speak(utter);
  };

  const handleAudioFinished = () => {
    setIsPlaying(false);
    setCurrentTime(0);

    // If auto-repeat with count is enabled, increment counter
    if (autoRepeatWithCount) {
      setCount((prev) => {
        const next = Math.min(prev + 1, zikr.count);
        if (next >= zikr.count && prev < zikr.count) {
          onProgress?.(true);
        }
        // If not completed yet and autoRepeat is on, replay audio
        if (next < zikr.count) {
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(() => {});
              setIsPlaying(true);
            }
          }, 400);
        } else {
          onAudioEnded?.();
        }
        return next;
      });
    } else {
      onAudioEnded?.();
    }
  };

  const togglePlay = () => {
    if (onPlayRequest && !isActive) {
      onPlayRequest();
    }

    if (isTTS) {
      if (isPlaying) {
        window.speechSynthesis?.cancel();
        setIsPlaying(false);
      } else {
        playTTS();
      }
      return;
    }

    if (!audioRef.current && zikr.audio) {
      const audio = new Audio(zikr.audio);
      audio.playbackRate = playbackRate;
      audio.muted = isMuted;

      audio.onplay = () => {
        setIsPlaying(true);
        setIsLoading(false);
      };
      audio.onpause = () => setIsPlaying(false);
      audio.onwaiting = () => setIsLoading(true);
      audio.onplaying = () => setIsLoading(false);
      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
        setIsLoading(false);
      };
      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
      };
      audio.onended = () => {
        handleAudioFinished();
      };
      audio.onerror = () => {
        console.warn("Audio load error, falling back to TTS for:", zikr.id);
        playTTS();
      };

      audioRef.current = audio;
    }

    if (!audioRef.current) {
      playTTS();
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn("Audio play failed, falling back to TTS:", err);
          playTTS();
        });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = Number(e.target.value);
    setCurrentTime(targetTime);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
    }
  };

  const changeSpeed = () => {
    const speeds = [1, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    if (audioRef.current) {
      audioRef.current.muted = nextMute;
    }
  };

  const inc = () => {
    setCount((c) => {
      const next = Math.min(c + 1, zikr.count);
      if (next >= zikr.count && c < zikr.count) onProgress?.(true);
      return next;
    });
  };

  const reset = () => {
    if (done) onProgress?.(false);
    setCount(0);
  };

  const copy = async () => {
    try {
      const url = shareUrl || (typeof window !== "undefined" ? window.location.href : "");
      const textToCopy = url ? `${fullText}\n${url}` : fullText;
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const shareLinks = [
    {
      label: "مشاركة على إكس",
      Icon: Twitter,
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`,
    },
    {
      label: "مشاركة على فيسبوك",
      Icon: Facebook,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      label: "مشاركة على تيليجرام",
      Icon: Send,
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(fullText)}`,
    },
    {
      label: "مشاركة على واتساب",
      Icon: MessageCircle,
      href: `https://wa.me/?text=${encodeURIComponent(shareText)}`,
    },
  ];

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <article
      ref={cardRef}
      id={`zikr-${zikr.id}`}
      className={`relative mt-8 scroll-mt-24 transition-all duration-300 ${
        isActive || isPlaying ? "scale-[1.01]" : ""
      }`}
    >
      {/* Target count badge */}
      <div className="absolute -top-6 left-1/2 z-10 -translate-x-1/2">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-full border-4 text-lg font-bold shadow-md transition-all duration-300 ${
            done
              ? "border-accent bg-accent text-accent-foreground scale-105 shadow-accent/30"
              : "border-accent bg-primary text-primary-foreground"
          }`}
          title={`العدد المطلوب: ${zikr.count}`}
        >
          {done ? <Sparkles size={20} className="animate-pulse" /> : zikr.count}
        </span>
      </div>

      <div
        className={`rounded-2xl border-2 bg-card px-4 pb-6 pt-10 shadow-sm transition-all duration-300 sm:px-8 md:px-10 lg:px-12 ${
          done
            ? "border-accent/80 bg-accent/5 shadow-accent/10"
            : isActive || isPlaying
              ? "border-primary ring-4 ring-primary/20 shadow-lg"
              : "border-primary/40 hover:border-primary/80"
        }`}
      >
        {/* Active badge */}
        {(isActive || isPlaying) && (
          <div className="mb-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-primary">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
            <span>قيد الاستماع الآن</span>
          </div>
        )}

        {zikr.title && (
          <div className="mb-3 flex justify-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3.5 py-1 text-xs sm:text-sm font-bold text-primary shadow-xs">
              {zikr.title}
            </span>
          </div>
        )}

        {zikr.intro && (
          <p className="text-center text-lg font-semibold text-accent sm:text-xl">
            {zikr.intro}
          </p>
        )}

        <p className="mt-3 text-center text-xl leading-loose text-foreground sm:text-2xl font-arabic">
          {zikr.text}
        </p>

        {zikr.source && (
          <p className="mt-3 text-center text-sm font-medium text-muted-foreground">
            {zikr.source}
          </p>
        )}

        {/* Counter Section */}
        <div className="mt-5 flex items-center justify-center">
          <div className="flex items-stretch overflow-hidden rounded-xl border-2 border-primary bg-secondary shadow-sm">
            <button
              type="button"
              onClick={inc}
              className="bg-primary px-5 py-2.5 text-base font-bold text-primary-foreground transition-all hover:bg-primary/90 active:scale-95"
              aria-label="زيادة العداد"
            >
              العد +
            </button>
            <span className="min-w-16 px-4 py-2.5 text-center text-lg font-extrabold text-foreground flex items-center justify-center">
              {count}
            </span>
            <button
              type="button"
              onClick={reset}
              title="إعادة ضبط العداد"
              className="bg-secondary px-3 py-2.5 text-sm font-medium text-secondary-foreground transition-colors hover:bg-primary/10 border-r border-primary/20"
              aria-label="إعادة الضبط"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        {zikr.virtue && (
          <div className="mt-4 rounded-xl bg-primary/5 p-3 text-center text-sm leading-relaxed text-primary border border-primary/15">
            <span className="font-bold">الفضل: </span>
            {zikr.virtue}
          </div>
        )}

        {/* Audio Player Controller Box */}
        <div className="mt-6 rounded-2xl border border-primary/20 bg-secondary/60 p-4 transition-colors">
          <div className="flex flex-col gap-3">
            {/* Top row: Play/Pause button, Time & Audio Waveform */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  disabled={isLoading}
                  aria-label={isPlaying ? "إيقاف التلاوة" : "استماع للذكر"}
                  className={`flex h-12 w-12 items-center justify-center rounded-full text-primary-foreground shadow-md transition-all active:scale-95 ${
                    isPlaying
                      ? "bg-accent text-accent-foreground ring-4 ring-accent/30 shadow-accent/20"
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  {isLoading ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : isPlaying ? (
                    <Pause size={22} fill="currentColor" />
                  ) : (
                    <Play size={22} fill="currentColor" className="translate-x-0.5" />
                  )}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">
                      {isPlaying ? "تلاوة صوتية" : "استمع للذكر"}
                    </span>
                    {isPlaying && (
                      <span className="flex items-end gap-0.5 h-3">
                        <span className="w-1 bg-primary rounded-full animate-bounce [animation-delay:-0.3s] h-3" />
                        <span className="w-1 bg-primary rounded-full animate-bounce [animation-delay:-0.15s] h-2" />
                        <span className="w-1 bg-primary rounded-full animate-bounce h-3.5" />
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>
              </div>

              {/* Player Quick Actions (Speed & Mute & Auto-count) */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={changeSpeed}
                  title="سرعة التلاوة"
                  className="rounded-lg border border-border bg-card px-2.5 py-1 text-xs font-bold text-foreground transition hover:bg-primary hover:text-primary-foreground shadow-sm"
                >
                  {playbackRate}x
                </button>

                <button
                  type="button"
                  onClick={() => setAutoRepeatWithCount(!autoRepeatWithCount)}
                  title={
                    autoRepeatWithCount
                      ? "التكرار التلقائي مع زيادة العداد مفعل"
                      : "تفعيل التكرار مع زيادة العداد"
                  }
                  className={`flex h-8 items-center gap-1 rounded-lg border px-2 text-xs font-semibold transition ${
                    autoRepeatWithCount
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Repeat size={13} />
                  <span className="hidden sm:inline">عد آلي</span>
                </button>

                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={isMuted ? "إلغاء الكتم" : "كتم الصوت"}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:text-foreground shadow-sm"
                >
                  {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
              </div>
            </div>

            {/* Audio Progress Slider */}
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={currentTime}
                onChange={handleSeek}
                aria-label="شريط تقدم التلاوة"
                className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-primary/20 accent-primary transition-all"
                style={{
                  background: `linear-gradient(to left, var(--color-primary) ${progressPercent}%, rgba(var(--color-primary-rgb, 46, 125, 50), 0.15) ${progressPercent}%)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Share & Copy Section */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border/60 pt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">مشاركة:</span>
            <div className="flex items-center gap-2">
              {shareLinks.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-all hover:bg-primary hover:text-primary-foreground hover:scale-105"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={copy}
            aria-label="نسخ الذكر"
            className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-all hover:bg-primary hover:text-primary-foreground"
          >
            {copied ? (
              <>
                <Check size={14} className="text-accent" />
                <span>تم النسخ!</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span>نسخ الذكر</span>
              </>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
