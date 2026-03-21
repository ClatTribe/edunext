import { useEffect, useRef, useState } from "react";
import {
  Users,
  TrendingUp,
  HeartPulse,
  Play,
  Pause,
  StepBack,
  StepForward,
  X,
} from "lucide-react";

const ACCENT = "#f9a01b";

const audioLogs = [
  {
    id: 1,
    title: "Handling Family Expectations",
    description: "How to communicate progress and stay focused without feeling overwhelmed.",
    icon: Users,
    tags: ["Family", "Communication", "Mindset"],
    audio: "/D%20day.m4a",
  },
  {
    id: 2,
    title: "When Motivation Drops",
    description: "A practical reset routine for low-motivation weeks before major exams.",
    icon: TrendingUp,
    tags: ["Burnout", "Recovery", "Discipline"],
    audio: "/One%20week.m4a",
  },
  {
    id: 3,
    title: "Final Week Preparation",
    description: "Checklist to balance revision, mock tests, and rest before exam day.",
    icon: HeartPulse,
    tags: ["Anxiety", "Last Week", "Preparation"],
    audio: "/Parental%20expectation.m4a",
  },
];

export default function Component() {
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [durations, setDurations] = useState<Record<number, number>>({});
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentLog = currentIndex !== null ? audioLogs[currentIndex] : null;

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    const loadDurations = async () => {
      const newDurations: Record<number, number> = {};
      for (let i = 0; i < audioLogs.length; i++) {
        const audio = new Audio();
        audio.src = audioLogs[i].audio;
        await new Promise<void>((resolve) => {
          audio.addEventListener("loadedmetadata", () => {
            newDurations[i] = audio.duration;
            resolve();
          });
          audio.addEventListener("error", () => {
            newDurations[i] = 0;
            resolve();
          });
        });
      }
      setDurations(newDurations);
    };
    loadDurations();
  }, []);

  const playAudio = (index: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentIndex(index);
    setProgress(0);
    setCurrentTime(0);
    audio.src = audioLogs[index].audio;
    audio.load();
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentIndex === null) return playAudio(0);
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const next = () => currentIndex !== null && playAudio((currentIndex + 1) % audioLogs.length);
  const prev = () => currentIndex !== null && playAudio((currentIndex - 1 + audioLogs.length) % audioLogs.length);

  const closePlayer = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setCurrentIndex(null);
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handleTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurrentTime(audio.currentTime);
      }
    };
    const handleEnded = () => {
      const nextIdx = currentIndex !== null ? (currentIndex + 1) % audioLogs.length : 0;
      playAudio(nextIdx);
    };
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentIndex]);

  return (
    <div className="min-h-screen bg-slate-950 px-4 pb-32">
      <div className="max-w-4xl mx-auto pt-10">
        <div className="text-center mb-16">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mt-6">
            <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
              Student Voice Notes
            </span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto mt-4 text-sm">
            Listen to short prep diaries and mindset notes from students preparing for CUET.
          </p>
        </div>

        <div className="space-y-4">
          {audioLogs.map((log, index) => {
            const Icon = log.icon;
            const active = currentIndex === index;
            return (
              <div
                key={log.id}
                onClick={() => playAudio(index)}
                className={`cursor-pointer rounded-2xl border bg-slate-900/20 p-6 transition-all ${
                  active
                    ? "border-orange-500/50 bg-slate-900/50 shadow-xl shadow-orange-500/10"
                    : "border-slate-800/50 hover:border-slate-700 hover:bg-slate-900/40"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors"
                    style={{ backgroundColor: active ? ACCENT : `${ACCENT}20`, color: active ? "#000" : ACCENT }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`text-xl font-bold transition-colors ${active ? "text-orange-400" : "text-white"}`}>
                      {log.title}
                    </h3>
                  </div>
                  <span className="px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    {durations[index] ? formatTime(durations[index]) : "Loading..."}
                  </span>
                </div>
                <p className="text-slate-400 mb-4 leading-relaxed">{log.description}</p>
                <div className="flex flex-wrap gap-2">
                  {log.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 text-xs font-bold rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className={`fixed bottom-0 left-0 w-full bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 transition-transform ${
          currentLog ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="h-1" style={{ width: `${progress}%`, background: ACCENT }} />
        <div className="max-w-4xl mx-auto flex items-center gap-4 px-4 py-4">
          <button onClick={closePlayer} className="p-2 rounded-full hover:bg-slate-800 transition-all text-slate-400 hover:text-white" title="Close player">
            <X className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <p className="font-bold text-white">{currentLog?.title}</p>
            <p className="text-sm font-bold text-orange-400">
              {isPlaying ? "Now Playing" : "Paused"} • {formatTime(currentTime)} /{" "}
              {currentIndex !== null && durations[currentIndex] ? formatTime(durations[currentIndex]) : "0:00"}
            </p>
          </div>
          <button onClick={prev} className="p-3 rounded-full border border-slate-700 hover:border-slate-600 hover:bg-slate-800 transition-all text-slate-300 hover:text-white">
            <StepBack className="w-5 h-5" />
          </button>
          <button onClick={togglePlay} className="p-4 rounded-full text-black shadow-lg hover:shadow-xl transition-all hover:scale-105" style={{ backgroundColor: ACCENT }}>
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </button>
          <button onClick={next} className="p-3 rounded-full border border-slate-700 hover:border-slate-600 hover:bg-slate-800 transition-all text-slate-300 hover:text-white">
            <StepForward className="w-5 h-5" />
          </button>
        </div>
      </div>
      <audio ref={audioRef} preload="metadata" />
    </div>
  );
}
