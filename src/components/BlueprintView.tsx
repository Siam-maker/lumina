import React, { useState } from 'react';
import {
  Award,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Flame,
  CheckCircle2,
  HelpCircle,
  FileText,
  Calculator,
} from 'lucide-react';
import {
  EXAM_BLUEPRINT,
  TOP_12_TRAPS,
  CUT_LADDER_DATA,
} from '../data/roadmapData';
import { playTickSound } from '../utils/sound';

interface BlueprintViewProps {
  soundEnabled: boolean;
}

export const BlueprintView: React.FC<BlueprintViewProps> = ({ soundEnabled }) => {
  const [activeSection, setActiveSection] = useState<'all' | 'A' | 'B'>('all');
  const [calcMarks, setCalcMarks] = useState<number>(35);

  const filteredSlots = EXAM_BLUEPRINT.filter(
    (item) => activeSection === 'all' || item.section === activeSection
  );

  const calculatedMinutes = Math.round(calcMarks * 0.8);

  return (
    <div className="space-y-8 pb-20">
      {/* Blueprint Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-indigo-100 p-6 shadow-[0_8px_30px_rgba(79,70,229,0.06)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Part 1.3 · Paper Blueprint
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Past 3 Years Analysis (2022–2025)
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Exam Architecture & Safe 6-Question Strategy
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Format: Full marks 210, 3 Hours. Section A + Section B (separate scripts). 4 questions in each section, answer any 3 (≈35 marks each).
              <strong className="text-indigo-700"> Safe 8-topic recipe:</strong> Master Budget (Q1) + Relevant/ABC/Std/Flex in Sec A; Job+Process (Q6), CVP (Q7), Var/Abs (Q8) in Sec B.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-semibold self-start sm:self-center">
            {(
              [
                { id: 'all', label: 'All Slots' },
                { id: 'A', label: 'Section A' },
                { id: 'B', label: 'Section B' },
              ] as const
            ).map((sec) => (
              <button
                key={sec.id}
                onClick={() => {
                  playTickSound(soundEnabled);
                  setActiveSection(sec.id);
                }}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeSection === sec.id
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Blueprint Table */}
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-200/80">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-slate-600 font-bold">
                <th className="py-3 px-4 w-20">Slot</th>
                <th className="py-3 px-4">2022–2023</th>
                <th className="py-3 px-4">2023–2024</th>
                <th className="py-3 px-4">2024–2025 (Latest)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white/70">
              {filteredSlots.map((row) => (
                <tr key={row.slot} className="hover:bg-indigo-50/30 transition-colors">
                  <td className="py-3 px-4 font-bold text-indigo-700 bg-indigo-50/40 whitespace-nowrap">
                    {row.slot}
                  </td>
                  <td className="py-3 px-4 text-slate-700">{row.y22_23}</td>
                  <td className="py-3 px-4 text-slate-700">{row.y23_24}</td>
                  <td className="py-3 px-4 font-medium text-slate-800 bg-slate-50/30">
                    {row.y24_25}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exam Hall Time Budget & Execution Calculator */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-indigo-100 p-6 shadow-[0_8px_30px_rgba(79,70,229,0.06)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                Part 6 · Hall Strategy
              </span>
              <span className="text-xs font-semibold text-slate-500">
                0.8 min/mark Rule
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mt-1">
              Time Budget & Phase Execution
            </h3>
          </div>

          {/* Interactive Mark to Minutes Calculator */}
          <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-violet-50 p-3 rounded-2xl border border-indigo-100">
            <Calculator className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-semibold">Marks:</span>
              <input
                type="number"
                min="1"
                max="35"
                value={calcMarks}
                onChange={(e) => setCalcMarks(Number(e.target.value) || 0)}
                className="w-14 px-2 py-1 bg-white border border-indigo-200 rounded-lg text-center font-bold text-indigo-700 outline-none"
              />
              <span className="text-slate-500 font-medium">=&gt;</span>
              <span className="font-extrabold text-indigo-900 bg-white px-2 py-1 rounded-lg border border-indigo-200 tabular-nums">
                {calculatedMinutes} min
              </span>
            </div>
          </div>
        </div>

        {/* Exam Hall Phases Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60 space-y-1">
            <span className="font-bold text-indigo-600 block">0–8 min: Read & Choose 3+3</span>
            <p className="text-slate-600 leading-relaxed">
              Scan all questions in both sections. Confirm compulsory question rules. Pick the 3+3 questions where the recipe immediately surfaces in your mind.
            </p>
          </div>
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60 space-y-1">
            <span className="font-bold text-indigo-600 block">Section Order & Script Separation</span>
            <p className="text-slate-600 leading-relaxed">
              Start with your STRONGEST question first to build momentum. Remember: Section A and Section B MUST be written on separate scripts!
            </p>
          </div>
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60 space-y-1">
            <span className="font-bold text-indigo-600 block">Writing Format & Partial Marks</span>
            <p className="text-slate-600 leading-relaxed">
              Always follow: (1) Formula, (2) Substitution, (3) Answer + unit. If a figure is missing, state your assumption in 1 line and continue.
            </p>
          </div>
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60 space-y-1">
            <span className="font-bold text-indigo-600 block">2-Minute Stuck Rule & Last 10 min</span>
            <p className="text-slate-600 leading-relaxed">
              If stuck on any step for 2 minutes, leave blank space and jump to the next subpart. Return during the last 10 minutes to verify totals, units, and signs.
            </p>
          </div>
        </div>
      </div>

      {/* Top 12 Traps Scan */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Exam Hall Traps
            </span>
            <h3 className="text-lg font-bold text-slate-800 mt-1">
              Top 12 Most Expensive Traps in Past Papers
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {TOP_12_TRAPS.map((item) => (
            <div
              key={item.id}
              className="bg-white/75 backdrop-blur-md rounded-2xl border border-rose-100 p-4 shadow-2xs space-y-2 hover:border-rose-200 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  Trap #{item.id}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  {item.topic}
                </span>
              </div>
              <p className="text-xs text-rose-900 font-semibold leading-relaxed">
                ⚠️ {item.trap}
              </p>
              <div className="text-[11px] text-teal-800 bg-teal-50/80 p-2 rounded-xl border border-teal-200/60 font-medium">
                ✅ <strong className="text-teal-900 font-bold">Fix:</strong> {item.fix}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cut Ladder If Falling Behind */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-amber-200/80 p-6 shadow-[0_8px_30px_rgba(245,158,11,0.06)] space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="text-base font-bold text-slate-800">
              Emergency "Cut Ladder" (If you fall 1.5h+ behind)
            </h3>
            <p className="text-xs text-slate-500">
              Cut in strict order from Step 1 down to Step 6. Never cut Step 7!
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {CUT_LADDER_DATA.map((step) => (
            <div
              key={step.step}
              className={`p-3.5 rounded-2xl border text-xs transition-all ${
                !step.canCut
                  ? 'bg-rose-50/90 border-rose-300 text-rose-950 font-semibold'
                  : 'bg-white/90 border-amber-100 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span
                  className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                    !step.canCut
                      ? 'bg-rose-600 text-white'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {step.canCut ? `Cut Priority #${step.step}` : 'SACRED SHIELD'}
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  {step.canCut ? 'Skippable if time-poor' : 'NEVER CUT'}
                </span>
              </div>
              <div className="font-bold text-slate-800 text-[13px]">{step.action}</div>
              <div className="text-slate-600 text-[11px] mt-0.5">{step.rationale}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
