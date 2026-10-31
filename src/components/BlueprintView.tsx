import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
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
    <div className="space-y-8 pb-24">
      {/* Blueprint Header */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-[0_10px_35px_-5px_rgba(28,25,23,0.04)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-stone-900 text-white shadow-2xs">
                Part 1.3 · Paper Blueprint
              </span>
              <span className="text-xs font-semibold text-stone-600 bg-[#F4F3ED] px-3 py-1 rounded-full border border-stone-200">
                Past 3 Years Analysis (2022–2025)
              </span>
            </div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Exam Architecture & Safe 6-Question Strategy
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              Format: Full marks 210, 3 Hours. Section A + Section B (separate scripts). 4 questions in each section, answer any 3 (≈35 marks each).
              <strong className="text-stone-900 font-bold"> Safe 8-topic recipe:</strong> Master Budget (Q1) + Relevant/ABC/Std/Flex in Sec A; Job+Process (Q6), CVP (Q7), Var/Abs (Q8) in Sec B.
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-[#EFECE6] p-1.5 rounded-2xl text-xs font-semibold self-start sm:self-center">
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
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeSection === sec.id
                    ? 'bg-white text-stone-900 shadow-2xs font-extrabold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Blueprint Table with generous padding */}
        <div className="mt-5 overflow-x-auto rounded-2xl border border-stone-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F6F5EF] border-b border-stone-200 text-stone-700 font-extrabold">
                <th className="py-3.5 px-4.5 w-24">Slot</th>
                <th className="py-3.5 px-4.5">2022–2023</th>
                <th className="py-3.5 px-4.5">2023–2024</th>
                <th className="py-3.5 px-4.5">2024–2025 (Latest Paper)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/80 bg-white">
              {filteredSlots.map((row) => (
                <tr key={row.slot} className="hover:bg-[#FAF9F5] transition-colors">
                  <td className="py-3.5 px-4.5 font-bold text-stone-900 bg-[#FAF9F5] whitespace-nowrap">
                    {row.slot}
                  </td>
                  <td className="py-3.5 px-4.5 text-stone-700 leading-relaxed">{row.y22_23}</td>
                  <td className="py-3.5 px-4.5 text-stone-700 leading-relaxed">{row.y23_24}</td>
                  <td className="py-3.5 px-4.5 font-semibold text-stone-900 bg-[#FCFBF8] leading-relaxed">
                    {row.y24_25}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exam Hall Time Budget & Execution Calculator */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-[0_10px_35px_-5px_rgba(28,25,23,0.04)] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-stone-900 text-white shadow-2xs">
                Part 6 · Hall Strategy
              </span>
              <span className="text-xs font-semibold text-stone-600 bg-[#F4F3ED] px-3 py-1 rounded-full border border-stone-200">
                0.8 min/mark Discipline
              </span>
            </div>
            <h3 className="text-xl font-bold text-stone-900 pt-1">
              Time Budget & Phase Execution
            </h3>
          </div>

          {/* Interactive Mark to Minutes Calculator */}
          <div className="flex items-center gap-3 bg-[#F8F7F3] p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
            <Calculator className="w-4 h-4 text-stone-600 flex-shrink-0" />
            <div className="flex items-center gap-2.5 text-xs">
              <span className="text-stone-600 font-bold">Marks:</span>
              <input
                type="number"
                min="1"
                max="35"
                value={calcMarks}
                onChange={(e) => setCalcMarks(Number(e.target.value) || 0)}
                className="w-16 px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-center font-bold text-stone-900 outline-none"
              />
              <span className="text-stone-400 font-bold">=&gt;</span>
              <span className="font-extrabold text-stone-900 bg-white px-3 py-1.5 rounded-lg border border-stone-200 tabular-nums text-sm font-mono">
                {calculatedMinutes} min
              </span>
            </div>
          </div>
        </div>

        {/* Exam Hall Phases Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-[#FAF9F5] p-4.5 rounded-2xl border border-stone-200 space-y-1.5">
            <span className="font-extrabold text-stone-900 block text-[13px]">
              0–8 min: Read & Choose 3+3
            </span>
            <p className="text-stone-600 leading-relaxed">
              Scan all questions in both sections. Confirm compulsory question rules. Pick the 3+3 questions where the recipe immediately surfaces in your mind.
            </p>
          </div>
          <div className="bg-[#FAF9F5] p-4.5 rounded-2xl border border-stone-200 space-y-1.5">
            <span className="font-extrabold text-stone-900 block text-[13px]">
              Section Order & Separate Scripts
            </span>
            <p className="text-stone-600 leading-relaxed">
              Start with your STRONGEST question first to bank confidence and marks early. Section A and Section B MUST be written on separate scripts!
            </p>
          </div>
          <div className="bg-[#FAF9F5] p-4.5 rounded-2xl border border-stone-200 space-y-1.5">
            <span className="font-extrabold text-stone-900 block text-[13px]">
              Writing Format & Partial Marks
            </span>
            <p className="text-stone-600 leading-relaxed">
              Always follow: (1) Formula, (2) Substitution, (3) Answer + unit. If a figure is missing, state your assumption in 1 line and continue.
            </p>
          </div>
          <div className="bg-[#FAF9F5] p-4.5 rounded-2xl border border-stone-200 space-y-1.5">
            <span className="font-extrabold text-stone-900 block text-[13px]">
              2-Minute Stuck Rule & Last 10 min
            </span>
            <p className="text-stone-600 leading-relaxed">
              If stuck on any step for 2 minutes, leave blank space and jump to the next subpart. Return during the last 10 minutes to verify totals, units, and signs.
            </p>
          </div>
        </div>
      </div>

      {/* Top 12 Traps Scan */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
            Exam Hall Traps
          </span>
          <h3 className="text-xl font-bold text-stone-900 mt-2">
            Top 12 Most Expensive Traps in Past Papers
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOP_12_TRAPS.map((item) => (
            <div
              key={item.id}
              className="bg-white/90 backdrop-blur-md rounded-2xl border border-rose-200/80 p-5 shadow-2xs space-y-2.5 hover:border-rose-300 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-rose-50 text-rose-800 border border-rose-200">
                  Trap #{item.id}
                </span>
                <span className="text-xs font-bold text-stone-500">
                  {item.topic}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-rose-950 font-semibold leading-relaxed">
                ⚠️ {item.trap}
              </p>
              <div className="text-xs text-stone-800 bg-[#FAF9F5] p-3 rounded-xl border border-stone-200 font-medium leading-relaxed">
                ✅ <strong className="text-teal-800 font-bold">Fix:</strong> {item.fix}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cut Ladder If Falling Behind */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-amber-200 p-6 sm:p-7 shadow-[0_10px_35px_-5px_rgba(217,119,6,0.06)] space-y-4">
        <div className="flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="text-lg font-bold text-stone-900">
              Emergency "Cut Ladder" (If you fall 1.5h+ behind)
            </h3>
            <p className="text-xs text-stone-500">
              Cut in strict order from Step 1 down to Step 6. Never cut Step 7!
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {CUT_LADDER_DATA.map((step) => (
            <div
              key={step.step}
              className={`p-4 rounded-2xl border text-xs sm:text-sm transition-all space-y-1 ${
                !step.canCut
                  ? 'bg-rose-50/90 border-rose-300 text-rose-950 font-semibold shadow-2xs'
                  : 'bg-[#FAF9F5] border-stone-200 text-stone-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`font-bold px-2.5 py-0.5 rounded-md text-[11px] ${
                    !step.canCut
                      ? 'bg-rose-600 text-white font-extrabold'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {step.canCut ? `Cut Priority #${step.step}` : 'SACRED SHIELD'}
                </span>
                <span className="text-xs font-bold text-stone-500">
                  {step.canCut ? 'Skippable if time-poor' : 'NEVER CUT'}
                </span>
              </div>
              <div className="font-bold text-stone-900 text-sm">{step.action}</div>
              <div className="text-stone-600 text-xs leading-relaxed">{step.rationale}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
