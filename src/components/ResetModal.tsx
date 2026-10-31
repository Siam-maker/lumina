import React from 'react';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';

interface ResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

export const ResetModal: React.FC<ResetModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative bg-white/95 backdrop-blur-xl rounded-3xl border border-rose-200/80 max-w-md w-full p-6 sm:p-7 shadow-[0_20px_60px_rgba(244,63,94,0.18)] space-y-4 animate-in slide-in-from-bottom-6 duration-300 ease-out"
        style={{
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(244, 63, 94, 0.15)',
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 bg-slate-100/70 hover:bg-slate-200/70 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shadow-2xs">
          <AlertTriangle className="w-6 h-6 stroke-[2]" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-extrabold text-slate-800 tracking-tight">
            Reset All Study Progress?
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            This will clear your completed sessions, solved question ticks, mastered formula checkboxes, and custom error logs stored in this browser.
          </p>
        </div>

        <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-100 text-[11px] text-rose-800">
          ⚠️ Tip: If you want to keep a copy of your progress before resetting, use the <strong>Export (Backup)</strong> button in the top header first!
        </div>

        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition-all active:scale-95 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmReset();
              onClose();
            }}
            className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 shadow-md shadow-rose-200 transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Yes, Reset Progress</span>
          </button>
        </div>
      </div>
    </div>
  );
};
