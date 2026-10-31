import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
} from 'lucide-react';
import { SessionBlock } from '../data/roadmapData';
import { playTimerDoneChime, playTickSound } from '../utils/sound';
import { launchConfetti } from '../utils/confetti';

interface TimerViewProps {
  selectedSession: SessionBlock | null;
  onSessionComplete?: (sessionId: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TimerView: React.FC<TimerViewProps> = ({
  selectedSession,
  onSessionComplete,
  soundEnabled,
  onToggleSound,
}) => {
  const initialDuration = selectedSession ? selectedSession.durationMinutes * 60 : 25 * 60;
  const [totalSeconds, setTotalSeconds] = useState<number>(initialDuration);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialDuration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  useEffect(() => {
    if (selectedSession) {
      const dur = selectedSession.durationMinutes * 60;
      setTotalSeconds(dur);
      setSecondsRemaining(dur);
      setIsRunning(false);
      setIsFinished(false);
    }
  }, [selectedSession]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            setIsRunning(false);
            setIsFinished(true);
            playTimerDoneChime(soundEnabled);
            launchConfetti(window.innerWidth / 2, window.innerHeight / 2, 45);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, soundEnabled]);

  const handleStartPause = () => {
    playTickSound(soundEnabled);
    if (isFinished) {
      setSecondsRemaining(totalSeconds);
      setIsFinished(false);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    playTickSound(soundEnabled);
    setIsRunning(false);
    setIsFinished(false);
    setSecondsRemaining(totalSeconds);
  };

  const setPreset = (minutes: number) => {
    playTickSound(soundEnabled);
    const s = minutes * 60;
    setIsRunning(false);
    setIsFinished(false);
    setTotalSeconds(s);
    setSecondsRemaining(s);
  };

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0;
  const radius = 120;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-24">
      {/* Session Header Card if active session selected */}
      {selectedSession ? (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-stone-200/90 shadow-[0_8px_30px_rgba(28,25,23,0.04)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
              Active Focus Block: {selectedSession.blockNumber}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-stone-900">{selectedSession.title}</h3>
            <p className="text-xs text-stone-500 font-medium">{selectedSession.timeSlot} · {selectedSession.garrisonRef}</p>
          </div>
          {onSessionComplete && (
            <button
              onClick={() => onSessionComplete(selectedSession.id)}
              className="flex-shrink-0 px-4 py-2 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Mark Done</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-4 sm:p-5 border border-stone-200/80 shadow-2xs flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-xs text-stone-600 font-medium">
            <Clock className="w-4 h-4 text-stone-500" />
            <span>Standalone Focus Mode (or select any block in Sessions to link)</span>
          </div>
          <button
            onClick={onToggleSound}
            className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1.5 cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-amber-600" /> : <VolumeX className="w-3.5 h-3.5 text-stone-400" />}
            <span className="font-semibold">{soundEnabled ? 'Chimes ON' : 'Muted'}</span>
          </button>
        </div>
      )}

      {/* Main Timer Display */}
      <div
        className={`relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 sm:p-14 border border-stone-200/90 shadow-[0_12px_45px_rgba(28,25,23,0.05)] flex flex-col items-center justify-center transition-all duration-500 ${
          isRunning
            ? 'shadow-[0_16px_50px_rgba(217,119,6,0.12)] ring-2 ring-amber-200/60'
            : isFinished
            ? 'shadow-[0_16px_50px_rgba(13,148,136,0.15)] ring-2 ring-teal-300'
            : ''
        }`}
      >
        {/* Circular Countdown Ring */}
        <div className="relative w-64 h-64 sm:w-76 sm:h-76 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="#EFECE6"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="url(#warmTimerGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
              fill="transparent"
            />
            <defs>
              <linearGradient id="warmTimerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D97706" />
                <stop offset="50%" stopColor="#4F46E5" />
                <stop offset="100%" stopColor="#0D9488" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-1">
            <span className="text-5xl sm:text-6xl font-black text-stone-900 tracking-tight tabular-nums font-mono">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest pt-1">
              {isFinished
                ? 'Block Complete 🎉'
                : isRunning
                ? 'Deep Solving'
                : 'Ready to Solve'}
            </span>
            {isRunning && (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-900 bg-amber-50 px-3 py-1 rounded-full font-bold border border-amber-200/80 shadow-2xs mt-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                In the Flow
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 mt-10">
          <button
            onClick={handleStartPause}
            className={`flex items-center gap-2.5 px-9 py-4 rounded-2xl font-extrabold text-sm transition-all duration-200 cursor-pointer active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-200'
                : isFinished
                ? 'bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-200'
                : 'bg-stone-900 hover:bg-black text-white shadow-lg shadow-stone-300 animate-breathe'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </>
            ) : isFinished ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Restart</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Start Session</span>
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            title="Reset timer"
            className="p-4 rounded-2xl bg-[#EFECE6] hover:bg-[#E5E2DC] text-stone-700 transition-all active:scale-95 cursor-pointer border border-stone-200"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-10 pt-6 border-t border-stone-200/70 w-full flex flex-col items-center">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">
            Standard Presets
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            {[
              { label: '25m Pomodoro', min: 25 },
              { label: '45m Short Block', min: 45 },
              { label: '90m Revision Round', min: 90 },
              { label: '120m Standard 2h Block', min: 120 },
            ].map((p) => {
              const isCurrent = totalSeconds === p.min * 60;
              return (
                <button
                  key={p.min}
                  onClick={() => setPreset(p.min)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-stone-900 text-white shadow-xs'
                      : 'bg-[#F5F4EE] hover:bg-white text-stone-700 border border-stone-200/90 shadow-2xs'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
