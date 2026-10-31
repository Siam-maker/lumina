import React, { useState } from 'react';
import { Calendar, Clock, X, Check, RotateCcw } from 'lucide-react';
import { playTickSound, playSuccessChime } from '../utils/sound';

interface ExamDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentExamDate: string; // ISO string or parsable date
  onSaveExamDate: (newDateStr: string) => void;
  soundEnabled: boolean;
}

export const ExamDateModal: React.FC<ExamDateModalProps> = ({
  isOpen,
  onClose,
  currentExamDate,
  onSaveExamDate,
  soundEnabled,
}) => {
  // Format to YYYY-MM-DDTHH:mm for datetime-local input
  const getFormattedDate = (dStr: string) => {
    try {
      const d = new Date(dStr);
      if (isNaN(d.getTime())) return '2026-11-05T09:00';
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    } catch {
      return '2026-11-05T09:00';
    }
  };

  const [dateInput, setDateInput] = useState<string>(getFormattedDate(currentExamDate));

  if (!isOpen) return null;

  const handlePreset = (preset: 'official' | '4days' | 'tomorrow' | '48hours') => {
    playTickSound(soundEnabled);
    const now = new Date();
    let target = new Date();

    if (preset === 'official') {
      target = new Date('2026-11-05T09:00:00+06:00');
    } else if (preset === '4days') {
      target.setDate(now.getDate() + 4);
      target.setHours(9, 0, 0, 0);
    } else if (preset === 'tomorrow') {
      target.setDate(now.getDate() + 1);
      target.setHours(9, 0, 0, 0);
    } else if (preset === '48hours') {
      target.setTime(now.getTime() + 48 * 60 * 60 * 1000);
    }

    const pad = (n: number) => String(n).padStart(2, '0');
    const formatted = `${target.getFullYear()}-${pad(target.getMonth() + 1)}-${pad(target.getDate())}T${pad(target.getHours())}:${pad(target.getMinutes())}`;
    setDateInput(formatted);
  };

  const handleSave = () => {
    if (!dateInput) return;
    playSuccessChime(soundEnabled);
    onSaveExamDate(new Date(dateInput).toISOString());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative bg-[#FCFBF8] backdrop-blur-xl rounded-3xl border border-stone-200 max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in slide-in-from-bottom-6 duration-300">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-2xs">
            <Calendar className="w-5 h-5 stroke-[2]" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-stone-900 tracking-tight">
              Set Exam Target Date & Time
            </h3>
            <p className="text-xs text-stone-500 font-medium">
              Countdown timer will synchronize with this target.
            </p>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
            Quick Shortcuts
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handlePreset('official')}
              className="px-3 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-left text-xs font-bold text-stone-800 shadow-2xs cursor-pointer"
            >
              <div>Official 5 Nov 2026</div>
              <span className="text-[10px] text-stone-400 font-normal">09:00 AM (Roadmap)</span>
            </button>

            <button
              type="button"
              onClick={() => handlePreset('4days')}
              className="px-3 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-left text-xs font-bold text-stone-800 shadow-2xs cursor-pointer"
            >
              <div>4 Days from Now</div>
              <span className="text-[10px] text-stone-400 font-normal">09:00 AM Target</span>
            </button>

            <button
              type="button"
              onClick={() => handlePreset('48hours')}
              className="px-3 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-left text-xs font-bold text-stone-800 shadow-2xs cursor-pointer"
            >
              <div>48-Hour Crash Sprint</div>
              <span className="text-[10px] text-stone-400 font-normal">Emergency Mode</span>
            </button>

            <button
              type="button"
              onClick={() => handlePreset('tomorrow')}
              className="px-3 py-2 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-left text-xs font-bold text-stone-800 shadow-2xs cursor-pointer"
            >
              <div>Tomorrow Morning</div>
              <span className="text-[10px] text-stone-400 font-normal">Final Day Review</span>
            </button>
          </div>
        </div>

        {/* Custom Datetime Input */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
            Custom Target Date & Time
          </label>
          <div className="flex items-center gap-2">
            <input
              type="datetime-local"
              value={dateInput}
              onChange={(e) => setDateInput(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-mono font-bold text-stone-900 outline-none focus:border-stone-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-3 border-t border-stone-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-extrabold text-white bg-stone-900 hover:bg-black transition-all active:scale-95 cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply Exam Time</span>
          </button>
        </div>
      </div>
    </div>
  );
};
