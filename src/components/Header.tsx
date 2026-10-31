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
  Pause,
  Play,
  Edit2,
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
  // Exam countdown configuration
  examTargetDate: string;
  onOpenExamDateModal: () => void;
  // Global Study Focus Timer Status
  timerIsRunning: boolean;
  timerSecondsRemaining: number;
  timerTotalSeconds: number;
  onToggleTimer: () => void;
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
  examTargetDate,
  onOpenExamDateModal,
  timerIsRunning,
  timerSecondsRemaining,
  timerTotalSeconds,
  onToggleTimer,
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
      }, 350);
    }, 6500);
    return () => clearInterval(interval);
  }, []);

  // Exam Countdown (dynamic from examTargetDate)
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isPast: boolean;
  }>({ days: 4, hours: 12, minutes: 0, seconds: 0, isPast: false });

  useEffect(() => {
    const targetDate = new Date(examTargetDate).getTime();

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
  }, [examTargetDate]);

  const progressPercent = totalSessionsCount > 0 ? Math.round((completedSessionsCount / totalSessionsCount) * 100) : 0;
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const tabs = [
    { id: 'sessions', label: 'Study Sessions', icon: Calendar },
    { id: 'timer', label: 'Focus Timer', icon: Clock },
    { id: 'recall', label: 'Formula Recall', icon: BookOpen },
    { id: 'errors', label: 'Error Log', icon: Sparkles },
    { id: 'blueprint', label: 'Exam Blueprint', icon: Award },
    { id: 'questions', label: 'Question Bank', icon: BookOpen },
  ] as const;

  // Format global timer display (MM:SS)
  const timerMin = Math.floor(timerSecondsRemaining / 60);
  const timerSec = timerSecondsRemaining % 60;
  const hasActiveTimer = timerIsRunning || (timerSecondsRemaining > 0 && timerSecondsRemaining < timerTotalSeconds);

  return (
    <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-xl border-b border-stone-200/80 shadow-[0_4px_24px_-4px_rgba(28,25,23,0.03)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-3.5 border-b border-stone-200/60">
          <div className="flex items-center gap-4">
            {/* Circular Progress Ring with luxury warm gradient */}
            <div className="relative w-12 h-12 flex-shrink-0 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="#EBEAE5"
                  strokeWidth="3.5"
                  fill="transparent"
                />
                <circle
                  cx="24"
                  cy="24"
                  r={radius}
                  stroke="url(#warmProgressGradient)"
                  strokeWidth="3.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="warmProgressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4F46E5" />
                    <stop offset="100%" stopColor="#0D9488" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-[11px] font-extrabold text-stone-800 tabular-nums leading-none">
                  {progressPercent}%
                </span>
              </div>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-extrabold tracking-tight text-base sm:text-lg text-stone-900">
                  BUET <span className="font-light text-stone-400">·</span> IPE 105
                </span>
                <span className="px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-amber-50 text-amber-900 border border-amber-200/70 shadow-2xs">
                  4-Day Rescue Plan
                </span>
                <span className="hidden sm:inline-flex px-2.5 py-0.5 text-[11px] font-semibold rounded-full bg-stone-100 text-stone-700 border border-stone-200/80">
                  Target: 168+/210 (A+)
                </span>
              </div>

              {/* Rotating motivational quote with spacious line height */}
              <p
                className={`text-xs text-stone-500 font-medium tracking-normal mt-1 flex items-center gap-2 transition-opacity duration-300 ${
                  fadeQuote ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0"></span>
                <span className="italic leading-relaxed">"{MOTIVATIONAL_QUOTES[quoteIndex]}"</span>
              </p>
            </div>
          </div>

          {/* Exam Countdown, Live Focus Timer Pill & Actions */}
          <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center w-full sm:w-auto flex-wrap">
            {/* Live Focus Timer Pill if active */}
            {hasActiveTimer && (
              <div className="flex items-center gap-2 bg-stone-900 text-white px-3 py-1.5 rounded-2xl shadow-sm animate-in fade-in">
                <button
                  onClick={() => {
                    playTickSound(soundEnabled);
                    onToggleTimer();
                  }}
                  title={timerIsRunning ? 'Pause Study Timer' : 'Resume Study Timer'}
                  className="p-1 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors cursor-pointer"
                >
                  {timerIsRunning ? (
                    <Pause className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-teal-400 fill-teal-400" />
                  )}
                </button>

                <button
                  onClick={() => {
                    playTickSound(soundEnabled);
                    onTabChange('timer');
                  }}
                  title="Open Focus Timer View"
                  className="text-xs font-mono font-bold tabular-nums hover:underline cursor-pointer flex items-center gap-1.5"
                >
                  <span className="text-stone-300 text-[10px] uppercase font-sans">Block:</span>
                  <span>{String(timerMin).padStart(2, '0')}:{String(timerSec).padStart(2, '0')}</span>
                </button>
              </div>
            )}

            {/* Clickable Live Exam Countdown */}
            <div
              onClick={() => {
                playTickSound(soundEnabled);
                onOpenExamDateModal();
              }}
              title="Click to set or adjust Exam Date & Time"
              className="group flex items-center gap-2 bg-[#F5F4EE] hover:bg-[#EFECE6] border border-stone-200/90 hover:border-stone-400 px-3.5 py-1.5 rounded-2xl shadow-2xs transition-all cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-stone-500 group-hover:text-amber-700 flex-shrink-0 transition-colors" />
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-stone-500 font-medium text-[11px] group-hover:text-stone-700">Exam in:</span>
                <div className="flex items-baseline gap-1 font-bold tabular-nums text-stone-800">
                  <span className="bg-white px-2 py-0.5 rounded-lg border border-stone-200 text-stone-800 shadow-2xs font-mono text-[11px]">
                    {String(timeLeft.days).padStart(2, '0')}d
                  </span>
                  <span className="text-stone-400 font-mono">:</span>
                  <span className="bg-white px-2 py-0.5 rounded-lg border border-stone-200 text-stone-800 shadow-2xs font-mono text-[11px]">
                    {String(timeLeft.hours).padStart(2, '0')}h
                  </span>
                  <span className="text-stone-400 font-mono">:</span>
                  <span className="bg-white px-2 py-0.5 rounded-lg border border-stone-200 text-stone-800 shadow-2xs font-mono text-[11px]">
                    {String(timeLeft.minutes).padStart(2, '0')}m
                  </span>
                  <span className="text-stone-400 font-mono hidden xs:inline">:</span>
                  <span className="bg-white px-2 py-0.5 rounded-lg border border-stone-200 text-stone-800 shadow-2xs font-mono text-[11px] hidden xs:inline">
                    {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>
              </div>
              <Edit2 className="w-3 h-3 text-stone-400 group-hover:text-stone-700 ml-0.5" />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  playTickSound(soundEnabled);
                  onToggleSound();
                }}
                title={soundEnabled ? 'Mute study sounds' : 'Enable study sounds'}
                className={`p-2 rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer ${
                  soundEnabled
                    ? 'bg-stone-100 text-stone-800 hover:bg-stone-200 border border-stone-300/80 shadow-2xs'
                    : 'bg-stone-100 text-stone-400 hover:bg-stone-200 border border-stone-200'
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
                className="p-2 rounded-xl text-xs font-medium text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200/90 transition-all active:scale-95 shadow-2xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  playTickSound(soundEnabled);
                  onImportData();
                }}
                title="Restore progress from JSON"
                className="p-2 rounded-xl text-xs font-medium text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-50 border border-stone-200/90 transition-all active:scale-95 shadow-2xs cursor-pointer"
              >
                <Upload className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  playTickSound(soundEnabled);
                  onOpenResetModal();
                }}
                title="Reset progress"
                className="p-2 rounded-xl text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100/80 border border-rose-200/70 transition-all active:scale-95 shadow-2xs cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="py-2.5 overflow-x-auto scrollbar-none">
          <nav className="inline-flex p-1.5 bg-[#F0EFE9] rounded-2xl border border-stone-200/80 gap-1">
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
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-white text-stone-900 shadow-sm border border-stone-200/70 scale-[1.01]'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-white/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-stone-400'}`} />
                  <span>{tab.label}</span>
                  {tab.id === 'sessions' && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
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
