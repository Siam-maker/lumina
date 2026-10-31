import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Clock,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  Upload,
  BookOpen,
  Sparkles,
  Award,
} from 'lucide-react';
import { MOTIVATIONAL_QUOTES } from '../data/roadmapData';
import { playTickSound } from '../utils/sound';

interface HeaderProps {
  activeTab: 'sessions' | 'timer' | 'recall' | 'errors' | 'blueprint' | 'questions';
  onTabChange: (tab: 'sessions' | 'timer' | 'recall' | 'errors' | 'blueprint' | 'questions') => void;
  completedSessionsCount: number;
  totalSessionsCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenResetModal: () => void;
  onExportData: () => void;
  onImportData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  completedSessionsCount,
  totalSessionsCount,
  soundEnabled,
  onToggleSound,
  onOpenResetModal,
  onExportData,
  onImportData,
}) => {
  // Rotating motivational line
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [fadeQuote, setFadeQuote] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFadeQuote(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % MOTIVATIONAL_QUOTES.length);
        setFadeQuote(true);
      }, 300);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Exam Countdown (Target: 5 Nov 2026, 09:00 AM)
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 4, hours: 12, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const targetDate = new Date('2026-11-05T09:00:00+06:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds, isPast: false });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const progressPercent = totalSessionsCount > 0 ? Math.round((completedSessionsCount / totalSessionsCount) * 100) : 0;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const tabs = [
    { id: 'sessions', label: 'Sessions', icon: Calendar },
    { id: 'timer', label: 'Timer', icon: Clock },
    { id: 'recall', label: 'Formula Recall', icon: BookOpen },
    { id: 'errors', label: 'Error Log', icon: Sparkles },
    { id: 'blueprint', label: 'Exam Blueprint', icon: Award },
    { id: 'questions', label: 'Question Bank', icon: BookOpen },
  ] as const;

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-indigo-100/80 shadow-[0_4px_20px_rgba(99,102,241,0.04)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-3 border-b border-slate-100/80">
          <div className="flex items-center gap-3">
            {/* Circular Progress Ring */}
            <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="#E0E7FF"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="url(#progressGradient)"
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366F1" />
                    <stop offset="100%" stopColor="#14B8A6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-[11px] font-bold text-slate-800 tabular-nums leading-none">
                  {progressPercent}%
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-base sm:text-lg bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 bg-clip-text text-transparent">
                  BUET · IPE 105
                </span>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 border border-indigo-200/60 shadow-xs">
                  4-Day Rescue Plan
                </span>
                <span className="hidden md:inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full bg-teal-50 text-teal-700 border border-teal-200/60">
                  Target: 168+/210 (A+)
                </span>
              </div>

              {/* Rotating motivational quote */}
              <p
                className={`text-xs text-slate-500 font-medium tracking-tight mt-0.5 flex items-center gap-1.5 transition-opacity duration-300 ${
                  fadeQuote ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                <span className="italic">"{MOTIVATIONAL_QUOTES[quoteIndex]}"</span>
              </p>
            </div>
          </div>

          {/* Exam Countdown & Quick Controls */}
          <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center w-full sm:w-auto">
            {/* Live Countdown Clock */}
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-50/80 via-white to-violet-50/80 border border-indigo-100 px-3 py-1.5 rounded-2xl shadow-xs">
              <Clock className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-500 font-medium text-[11px]">Exam in:</span>
                <div className="flex items-baseline gap-0.5 font-bold tabular-nums text-slate-800">
                  <span className="bg-white px-1.5 py-0.5 rounded-md border border-indigo-100 text-indigo-700 shadow-2xs">
                    {String(timeLeft.days).padStart(2, '0')}d
                  </span>
                  <span className="text-slate-400">:</span>
                  <span className="bg-white px-1.5 py-0.5 rounded-md border border-indigo-100 text-indigo-700 shadow-2xs">
                    {String(timeLeft.hours).padStart(2, '0')}h
                  </span>
                  <span className="text-slate-400">:</span>
                  <span className="bg-white px-1.5 py-0.5 rounded-md border border-indigo-100 text-indigo-700 shadow-2xs">
                    {String(timeLeft.minutes).padStart(2, '0')}m
                  </span>
                  <span className="text-slate-400 hidden xs:inline">:</span>
                  <span className="bg-white px-1.5 py-0.5 rounded-md border border-indigo-100 text-indigo-700 shadow-2xs hidden xs:inline">
                    {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  playTickSound(soundEnabled);
                  onToggleSound();
                }}
                title={soundEnabled ? 'Mute study sounds' : 'Enable study sounds'}
                className={`p-2 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                  soundEnabled
                    ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200/60'
                    : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-200/60'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  playTickSound(soundEnabled);
                  onExportData();
                }}
                title="Backup progress (JSON)"
                className="p-2 rounded-xl text-xs font-medium text-slate-600 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200/60 hover:border-indigo-200/60 transition-all active:scale-95 shadow-2xs"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  playTickSound(soundEnabled);
                  onImportData();
                }}
                title="Restore progress from JSON"
                className="p-2 rounded-xl text-xs font-medium text-slate-600 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200/60 hover:border-indigo-200/60 transition-all active:scale-95 shadow-2xs"
              >
                <Upload className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  playTickSound(soundEnabled);
                  onOpenResetModal();
                }}
                title="Reset progress"
                className="p-2 rounded-xl text-xs font-medium text-rose-500 hover:text-rose-600 bg-rose-50/50 hover:bg-rose-100/70 border border-rose-200/60 transition-all active:scale-95 shadow-2xs"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Switcher - iOS Segmented Control Style with Sliding Pill */}
        <div className="py-2.5 overflow-x-auto scrollbar-none">
          <nav className="inline-flex p-1 bg-slate-100/80 rounded-2xl border border-indigo-100/50 relative">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playTickSound(soundEnabled);
                    onTabChange(tab.id);
                  }}
                  className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-sm shadow-indigo-100/80 scale-[1.02]'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.id === 'sessions' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200/40">
                      {completedSessionsCount}/{totalSessionsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
