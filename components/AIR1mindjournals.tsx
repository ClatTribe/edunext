"use client";

import { useEffect, useRef, useState } from "react";
import {
  Users,
  TrendingUp,
  HeartPulse,
  Flag,
  Play,
  Pause,
  StepBack,
  StepForward,
} from "lucide-react";

const ACCENT = "#823588";
const YELLOW = "#F4B400";

const audioLogs = [
  {
    id: 1,
    title: "Managing Parental Expectations",
    duration: "6:24",
    description:
      "That conversation where I explained why mock scores matter more than perfect attendance.",
    icon: Users,
    tags: ["Family Pressure", "Communication", "Boundaries"],
  },
  {
    id: 2,
    title: "The February Motivation Dip",
    duration: "5:48",
    description:
      "Woke up today and just stared at my books. The exact self-talk I used.",
    icon: TrendingUp,
    tags: ["Burnout", "Self-Motivation", "Recovery"],
  },
  {
    id: 3,
    title: "One Week Before D-Day",
    duration: "7:12",
    description:
      "Should I study more or rest? My exact checklist for the final 7 days.",
    icon: HeartPulse,
    tags: ["Anxiety", "Last Week", "Mental Prep"],
  },
  {
    id: 4,
    title: "From Home to Exam Hall",
    duration: "6:05",
    description:
      "Minute-by-minute: What I ate, when I left, and exam-day nerves.",
    icon: Flag,
    tags: ["Exam Day", "Routine", "Peak Performance"],
  },
];

export default function MindsetLogsPage() {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentLog = currentIndex !== null ? audioLogs[currentIndex] : null;

  const startPlayback = () => {
    setIsPlaying(true);
    clearInterval(intervalRef.current as NodeJS.Timeout);
    setProgress(0);

    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          next();
          return 0;
        }
        return p + 0.4;
      });
    }, 100);
  };

  const pausePlayback = () => {
    setIsPlaying(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const playAudio = (index: number) => {
    setCurrentIndex(index);
    startPlayback();
  };

  const togglePlay = () => {
    if (currentIndex === null) {
      playAudio(0);
      return;
    }
    isPlaying ? pausePlayback() : startPlayback();
  };

  const next = () => {
    if (currentIndex === null) return;
    playAudio((currentIndex + 1) % audioLogs.length);
  };

  const prev = () => {
    if (currentIndex === null) return;
    playAudio((currentIndex - 1 + audioLogs.length) % audioLogs.length);
  };

  useEffect(() => {
    return () => pausePlayback();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-yellow-50 px-4 pb-32">
      <div className="max-w-4xl mx-auto pt-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="inline-block px-5 py-2 rounded-full text-white text-sm font-semibold shadow"
            style={{ backgroundColor: ACCENT }}
          >
            AIR 1 MIND JOURNALS
          </span>

          <h1
            className="text-4xl md:text-5xl font-bold mt-6"
            style={{ color: ACCENT }}
          >
            Unfiltered Voice Notes
          </h1>
          <p className="text-gray-600 max-w-xl mx-auto mt-4">
            Raw audio clips from AIR 1’s private prep diary. The mindset behind
            the rank.
          </p>
        </div>

        {/* Audio Cards */}
        <div className="space-y-6">
          {audioLogs.map((log, index) => {
            const Icon = log.icon;
            const active = currentIndex === index;

            return (
              <div
                key={log.id}
                onClick={() => playAudio(index)}
                className={`cursor-pointer rounded-2xl border-2 bg-white p-6 transition-all ${
                  active
                    ? "border-yellow-400 shadow-xl"
                    : "border-purple-200 hover:border-purple-500 hover:shadow-lg"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white"
                    style={{
                      background: active ? YELLOW : ACCENT,
                    }}
                  >
                    <Icon />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-semibold">{log.title}</h3>
                  </div>

                  <span className="px-4 py-1 rounded-full text-sm font-bold bg-yellow-200">
                    {log.duration}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{log.description}</p>

                <div className="flex flex-wrap gap-2">
                  {log.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-semibold rounded-full"
                      style={{
                        backgroundColor: "#82358820",
                        color: ACCENT,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Player */}
      <div
        className={`fixed bottom-0 left-0 w-full bg-white border-t transition-transform ${
          currentLog ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div
          className="h-1"
          style={{
            width: `${progress}%`,
            background: `linear-gradient(90deg, ${YELLOW}, ${ACCENT})`,
          }}
        />

        <div className="max-w-4xl mx-auto flex items-center gap-4 px-4 py-4">
          <div className="flex-1">
            <p className="font-semibold">{currentLog?.title}</p>
            <p className="text-sm text-purple-700">
              {isPlaying ? "Now Playing" : "Paused"}
            </p>
          </div>

          <button onClick={prev} className="p-3 rounded-full border">
            <StepBack />
          </button>

          <button
            onClick={togglePlay}
            className="p-4 rounded-full text-black shadow"
            style={{ backgroundColor: YELLOW }}
          >
            {isPlaying ? <Pause /> : <Play />}
          </button>

          <button onClick={next} className="p-3 rounded-full border">
            <StepForward />
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white border-2 border-purple-200 rounded-2xl p-8 text-center">
      <div className="text-4xl font-bold text-purple-700">{value}</div>
      <div className="text-gray-500 mt-2">{label}</div>
    </div>
  );
}
