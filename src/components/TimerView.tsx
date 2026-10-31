import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Clock,
  Sparkles,
  Volume2,
  VolumeX,
  CheckCircle2,
  Plus,
  Minus,
  Settings2,
} from 'lucide-react';
import { SessionBlock } from '../data/roadmapData';
import { playTickSound } from '../utils/sound';

interface TimerViewProps {
  selectedSession: SessionBlock | null;
  onSessionComplete?: (sessionId: string) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  // Global timer controls
  totalSeconds: number;
  secondsRemaining: number;
  isRunning: boolean;
  isFinished: boolean;
  onStartPause: () => void;
  onResetTimer: () => void;
  onSetDuration: (seconds: number) => void;
  onAdjustTime: (deltaSeconds: number) => void;
}

export const TimerView: React.FC<TimerViewProps> = ({
  selectedSession,
  onSessionComplete,
  soundEnabled,
  onToggleSound,
  totalSeconds,
  secondsRemaining,
  isRunning,
  isFinished,
  onStartPause,
  onResetTimer,
  onSetDuration,
  onAdjustTime,
}) => {
  const [customMinutesInput, setCustomMinutesInput] = useState<string>('25');
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const progressRatio = totalSeconds > 0 ? (totalSeconds - secondsRemaining) / totalSeconds : 0;
  const radius = 120;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(customMinutesInput, 10);
    if (!isNaN(mins) && mins > 0 && mins <= 480) {
      playTickSound(soundEnabled);
      onSetDuration(mins * 60);
      setShowCustomModal(false);
    }
  };

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
            <span>Active Study Focus Timer (Runs continuously across all tabs)</span>
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

        {/* Stepper Quick Time Adjusters (+1m, +5m, -1m, -5m) */}
        <div className="flex items-center gap-2 mt-6">
          <button
            type="button"
            onClick={() => {
              playTickSound(soundEnabled);
              onAdjustTime(-300);
            }}
            title="Subtract 5 minutes"
            disabled={secondsRemaining <= 300}
            className="px-2.5 py-1 rounded-xl bg-[#F5F4EE] hover:bg-[#EAE8E0] text-stone-700 text-xs font-bold disabled:opacity-40 cursor-pointer border border-stone-200"
          >
            -5m
          </button>
          <button
            type="button"
            onClick={() => {
              playTickSound(soundEnabled);
              onAdjustTime(-60);
            }}
            title="Subtract 1 minute"
            disabled={secondsRemaining <= 60}
            className="px-2.5 py-1 rounded-xl bg-[#F5F4EE] hover:bg-[#EAE8E0] text-stone-700 text-xs font-bold disabled:opacity-40 cursor-pointer border border-stone-200"
          >
            -1m
          </button>
          <button
            type="button"
            onClick={() => {
              playTickSound(soundEnabled);
              onAdjustTime(60);
            }}
            title="Add 1 minute"
            className="px-2.5 py-1 rounded-xl bg-[#F5F4EE] hover:bg-[#EAE8E0] text-stone-700 text-xs font-bold cursor-pointer border border-stone-200"
          >
            +1m
          </button>
          <button
            type="button"
            onClick={() => {
              playTickSound(soundEnabled);
              onAdjustTime(300);
            }}
            title="Add 5 minutes"
            className="px-2.5 py-1 rounded-xl bg-[#F5F4EE] hover:bg-[#EAE8E0] text-stone-700 text-xs font-bold cursor-pointer border border-stone-200"
          >
            +5m
          </button>
          <button
            type="button"
            onClick={() => {
              playTickSound(soundEnabled);
              onAdjustTime(600);
            }}
            title="Add 10 minutes"
            className="px-2.5 py-1 rounded-xl bg-[#F5F4EE] hover:bg-[#EAE8E0] text-stone-700 text-xs font-bold cursor-pointer border border-stone-200"
          >
            +10m
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 mt-8">
          <button
            onClick={onStartPause}
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
            onClick={onResetTimer}
            title="Reset timer to full duration"
            className="p-4 rounded-2xl bg-[#EFECE6] hover:bg-[#E5E2DC] text-stone-700 transition-all active:scale-95 cursor-pointer border border-stone-200"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets for Roadmap Study Blocks */}
        <div className="mt-8 pt-6 border-t border-stone-200/70 w-full flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-3">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
              Study Block Presets
            </span>
            <button
              onClick={() => setShowCustomModal(true)}
              className="text-xs font-bold text-stone-700 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Custom Minutes</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              { label: '15m Quick', min: 15 },
              { label: '25m Pomodoro', min: 25 },
              { label: '45m High-Low', min: 45 },
              { label: '90m Revision', min: 90 },
              { label: '100m Mock Solve', min: 100 },
              { label: '120m 2h Standard', min: 120 },
              { label: '180m Full Exam', min: 180 },
            ].map((p) => {
              const isCurrent = totalSeconds === p.min * 60;
              return (
                <button
                  key={p.min}
                  onClick={() => {
                    playTickSound(soundEnabled);
                    onSetDuration(p.min * 60);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
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

      {/* Custom Duration Popover */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <form
            onSubmit={handleCustomSubmit}
            className="relative bg-white rounded-3xl border border-stone-200 p-6 shadow-2xl max-w-xs w-full space-y-4"
          >
            <h4 className="text-sm font-bold text-stone-900">Set Custom Timer (Minutes)</h4>
            <div>
              <input
                type="number"
                min="1"
                max="480"
                value={customMinutesInput}
                onChange={(e) => setCustomMinutesInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-[#FAF9F5] border border-stone-300 rounded-xl font-mono text-center font-bold text-stone-900 text-lg outline-none focus:border-stone-500"
                autoFocus
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-extrabold text-white bg-stone-900 hover:bg-black shadow-xs cursor-pointer"
              >
                Set Time
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
