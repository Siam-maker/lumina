import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  Bell,
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
  // Initial duration in seconds (default 25 minutes or session duration)
  const initialDuration = selectedSession ? selectedSession.durationMinutes * 60 : 25 * 60;
  const [totalSeconds, setTotalSeconds] = useState<number>(initialDuration);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialDuration);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Update timer if selectedSession changes
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

  // Calculations for circular SVG ring
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0;
  const radius = 120;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20">
      {/* Session Header Card if active session selected */}
      {selectedSession ? (
        <div className="bg-white/80 backdrop-blur-md rounded-3xl p-5 border border-indigo-100 shadow-[0_8px_30px_rgba(79,70,229,0.06)] flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Active Session: {selectedSession.blockNumber}
            </span>
            <h3 className="text-base font-bold text-slate-800">{selectedSession.title}</h3>
            <p className="text-xs text-slate-500 font-medium">{selectedSession.timeSlot} · {selectedSession.garrisonRef}</p>
          </div>
          {onSessionComplete && (
            <button
              onClick={() => onSessionComplete(selectedSession.id)}
              className="flex-shrink-0 px-3.5 py-2 rounded-2xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>Mark Done</span>
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-md rounded-3xl p-4 border border-indigo-100/60 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
            <Clock className="w-4 h-4 text-indigo-500" />
            <span>Standalone Focus Mode (or launch directly from any session block)</span>
          </div>
          <button
            onClick={onToggleSound}
            className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-500" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span>{soundEnabled ? 'Chimes ON' : 'Muted'}</span>
          </button>
        </div>
      )}

      {/* Main Timer Display */}
      <div
        className={`relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-indigo-500/12 shadow-[0_12px_40px_rgba(79,70,229,0.08)] flex flex-col items-center justify-center transition-all duration-500 ${
          isRunning
            ? 'shadow-[0_12px_50px_rgba(99,102,241,0.18)] ring-2 ring-indigo-200/50'
            : isFinished
            ? 'shadow-[0_12px_50px_rgba(20,184,166,0.25)] ring-2 ring-teal-300'
            : ''
        }`}
      >
        {/* Circular Countdown Ring */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background ring */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="#EEF2FF"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Depleting progress ring */}
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="url(#timerGradient)"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
              fill="transparent"
            />
            <defs>
              <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#14B8A6" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Digital Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl sm:text-5xl font-black text-slate-800 tracking-tight tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">
              {isFinished
                ? 'Time Complete 🎉'
                : isRunning
                ? 'Focusing Deeply'
                : 'Ready to Start'}
            </span>
            {isRunning && (
              <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-2 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping"></span>
                In the Zone
              </span>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={handleStartPause}
            className={`flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-sm text-white shadow-md transition-all duration-200 cursor-pointer active:scale-95 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200'
                : isFinished
                ? 'bg-teal-500 hover:bg-teal-600 shadow-teal-200'
                : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-indigo-200 animate-breathe'
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
            className="p-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="mt-8 pt-6 border-t border-slate-100/90 w-full flex flex-col items-center">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
            Routine Presets
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: '25m Pomodoro', min: 25 },
              { label: '45m Short Block', min: 45 },
              { label: '90m Recall / Review', min: 90 },
              { label: '120m Standard 2h Block', min: 120 },
            ].map((p) => {
              const isCurrent = totalSeconds === p.min * 60;
              return (
                <button
                  key={p.min}
                  onClick={() => setPreset(p.min)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-indigo-100 text-indigo-700 font-bold border border-indigo-300'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
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
