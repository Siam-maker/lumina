import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Download,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { ErrorLogItem } from '../data/roadmapData';
import { playSuccessChime, playTickSound } from '../utils/sound';

interface ErrorLogViewProps {
  errorLogs: ErrorLogItem[];
  onAddError: (error: Omit<ErrorLogItem, 'id' | 'timestamp'>) => void;
  onToggleResolved: (id: string) => void;
  onDeleteError: (id: string) => void;
  soundEnabled: boolean;
}

export const ErrorLogView: React.FC<ErrorLogViewProps> = ({
  errorLogs,
  onAddError,
  onToggleResolved,
  onDeleteError,
  soundEnabled,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [topic, setTopic] = useState('Job-Order Costing');
  const [problemRef, setProblemRef] = useState('');
  const [errorType, setErrorType] = useState<'Concept' | 'Formula' | 'Arithmetic' | 'Reading'>('Concept');
  const [whatWentWrong, setWhatWentWrong] = useState('');
  const [correctRecipe, setCorrectRecipe] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whatWentWrong.trim() || !correctRecipe.trim()) return;

    playSuccessChime(soundEnabled);
    onAddError({
      topic,
      problemRef: problemRef.trim() || 'General Problem',
      errorType,
      whatWentWrong: whatWentWrong.trim(),
      correctRecipe: correctRecipe.trim(),
      resolved: false,
    });

    setProblemRef('');
    setWhatWentWrong('');
    setCorrectRecipe('');
    setShowAddForm(false);
  };

  const filteredLogs = errorLogs.filter((log) => {
    if (typeFilter === 'all') return true;
    if (typeFilter === 'unresolved') return !log.resolved;
    return log.errorType === typeFilter;
  });

  const resolvedCount = errorLogs.filter((l) => l.resolved).length;
  const totalCount = errorLogs.length;

  const exportMarkdown = () => {
    playTickSound(soundEnabled);
    let md = '# BUET IPE 105 - My Error Log & Surgical Revision Sheet\n\n';
    md += 'Generated from IPE 105 4-Day Rescue Roadmap.\n\n';
    errorLogs.forEach((l, idx) => {
      md += `### ${idx + 1}. [${l.errorType}] ${l.topic} (${l.problemRef}) - ${l.resolved ? 'RESOLVED' : 'NEEDS RE-SOLVE'}\n`;
      md += `- **What went wrong:** ${l.whatWentWrong}\n`;
      md += `- **Correct recipe:** ${l.correctRecipe}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'IPE105-Error-Log.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Banner */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-[0_10px_35px_-5px_rgba(28,25,23,0.04)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-stone-900 text-white shadow-2xs">
                Part 1 & 6 · Core Weapon
              </span>
              <span className="text-xs font-semibold text-stone-600 bg-[#F4F3ED] px-3 py-1 rounded-full border border-stone-200">
                1-Line Mistake & Recipe Logger
              </span>
            </div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Personal Error Log & Re-solve Queue
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              "Nov 4-er revision-er 40% ei log theke." Every mistake is logged as: Topic / Error Type (Concept · Formula · Arithmetic · Reading) / Correct Recipe. Re-solve these in Day 4 R2!
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => {
                playTickSound(soundEnabled);
                setShowAddForm(!showAddForm);
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-stone-900 hover:bg-black text-white text-xs font-extrabold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Error</span>
            </button>

            <button
              onClick={exportMarkdown}
              title="Export as Markdown for printing"
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-stone-50 text-stone-700 border border-stone-300/80 text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Export MD</span>
            </button>
          </div>
        </div>

        {/* Stats & Filter Bar */}
        <div className="pt-4 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-[#EFECE6] p-1.5 rounded-2xl text-xs font-semibold overflow-x-auto">
            {[
              { id: 'all', label: `All (${totalCount})` },
              { id: 'unresolved', label: `Needs Re-solve (${totalCount - resolvedCount})` },
              { id: 'Concept', label: 'Concept' },
              { id: 'Formula', label: 'Formula' },
              { id: 'Arithmetic', label: 'Arithmetic' },
              { id: 'Reading', label: 'Reading' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  playTickSound(soundEnabled);
                  setTypeFilter(f.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  typeFilter === f.id
                    ? 'bg-white text-stone-900 font-extrabold shadow-2xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-bold text-stone-600">
            Re-solved for Day 4: <strong className="text-teal-700 font-extrabold">{resolvedCount}</strong> / {totalCount}
          </div>
        </div>
      </div>

      {/* Add Error Form Modal/Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/95 backdrop-blur-md rounded-3xl border border-stone-300 p-6 sm:p-7 shadow-lg space-y-5 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Log a Mistake to Surgically Repair on Nov 4</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs font-bold text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-stone-500 uppercase tracking-wider mb-1.5">
                Topic
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 outline-none focus:border-stone-500"
              >
                <option value="Job-Order Costing">Job-Order Costing (Topic 5)</option>
                <option value="CVP Analysis">CVP & Leverage (Topic 9)</option>
                <option value="Variable vs Absorption">Variable vs Absorption (Topic 8)</option>
                <option value="Process Costing">Process Costing (Topic 6)</option>
                <option value="Relevant Costs">Relevant Decisions (Topic 10)</option>
                <option value="Master Budget">Master & Cash Budget (Topic 11)</option>
                <option value="Activity-Based Costing">Activity-Based Costing (Topic 7)</option>
                <option value="Financial Ratios & ROI">Financial Ratios & ROI (Topic 14)</option>
                <option value="Standard Costs">Standard Costs & Variances (Topic 13)</option>
                <option value="Flexible Budgets">Flexible Budgets (Topic 12)</option>
                <option value="Capital Budgeting">Capital Budgeting (Topic 15)</option>
                <option value="Cost Language & COGM">Cost Concepts & COGM (Topics 2+4)</option>
                <option value="High-Low">High-Low & Regression (Topic 3)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-500 uppercase tracking-wider mb-1.5">
                Problem Ref (e.g. Q42 HDP)
              </label>
              <input
                type="text"
                value={problemRef}
                onChange={(e) => setProblemRef(e.target.value)}
                placeholder="e.g. Q126 PEM proposal 3"
                className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 outline-none focus:border-stone-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-stone-500 uppercase tracking-wider mb-1.5">
                Error Type
              </label>
              <select
                value={errorType}
                onChange={(e) => setErrorType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 outline-none focus:border-stone-500"
              >
                <option value="Concept">Concept (Didn't understand definition/flow)</option>
                <option value="Formula">Formula (Substituted wrong formula)</option>
                <option value="Arithmetic">Arithmetic (Calculator / sign slip)</option>
                <option value="Reading">Reading (Missed constraint in problem prompt)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-stone-500 uppercase tracking-wider mb-1.5">
              What went wrong? (1 sentence)
            </label>
            <input
              type="text"
              value={whatWentWrong}
              onChange={(e) => setWhatWentWrong(e.target.value)}
              placeholder="e.g. Used units sold instead of units produced when calculating fixed MOH rate."
              className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-stone-200 rounded-xl text-xs font-medium text-stone-800 outline-none focus:border-stone-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-stone-500 uppercase tracking-wider mb-1.5">
              Correct Recipe / Rule (1 sentence)
            </label>
            <input
              type="text"
              value={correctRecipe}
              onChange={(e) => setCorrectRecipe(e.target.value)}
              placeholder="e.g. Fixed MOH rate = Total Fixed MOH ÷ UNITS PRODUCED, always."
              className="w-full px-3.5 py-2.5 bg-[#FAF9F5] border border-stone-200 rounded-xl text-xs font-medium text-stone-800 outline-none focus:border-stone-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl text-xs font-extrabold text-white bg-stone-900 hover:bg-black shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              Save Error Entry
            </button>
          </div>
        </form>
      )}

      {/* Errors List */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-12 text-center border border-stone-200 shadow-sm space-y-2">
            <div className="w-12 h-12 mx-auto text-stone-300">
              <BookOpen className="w-12 h-12 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-stone-800">No errors found in this filter</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              Whenever you make a calculation slip or misread a problem during practice, tap "Log New Error"!
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const typeBadgeColors = {
              Concept: 'bg-stone-100 text-stone-800 border-stone-200',
              Formula: 'bg-rose-50 text-rose-800 border-rose-200',
              Arithmetic: 'bg-amber-50 text-amber-800 border-amber-200',
              Reading: 'bg-teal-50 text-teal-800 border-teal-200',
            }[log.errorType];

            return (
              <div
                key={log.id}
                className={`bg-white/90 backdrop-blur-md rounded-3xl border p-5 sm:p-6 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 ${
                  log.resolved
                    ? 'border-teal-300/80 bg-teal-50/15 opacity-85'
                    : 'border-stone-200/90 shadow-[0_4px_24px_-4px_rgba(28,25,23,0.04)] hover:border-stone-300'
                }`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      playTickSound(soundEnabled);
                      onToggleResolved(log.id);
                    }}
                    title={log.resolved ? 'Mark unresolved' : 'Mark re-solved on Day 4'}
                    className={`mt-1 w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                      log.resolved
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'border-2 border-stone-300 hover:border-teal-600 bg-white'
                    }`}
                  >
                    {log.resolved && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-lg border ${typeBadgeColors}`}>
                        {log.errorType}
                      </span>
                      <span className="text-sm font-bold text-stone-900">
                        {log.topic}
                      </span>
                      <span className="text-xs font-semibold text-stone-500 bg-[#EFECE6] px-2 py-0.5 rounded-md">
                        {log.problemRef}
                      </span>
                      {log.resolved && (
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
                          Day 4 Re-solved ✓
                        </span>
                      )}
                    </div>

                    <div className="text-xs sm:text-sm text-rose-800 font-medium leading-relaxed">
                      ❌ <span className="font-bold text-stone-700">Mistake:</span> {log.whatWentWrong}
                    </div>

                    <div className="text-xs sm:text-sm text-stone-900 font-semibold bg-[#FAF9F5] p-3 rounded-2xl border border-stone-200 leading-relaxed">
                      💡 <span className="text-amber-800 font-bold">Fix / Rule:</span> {log.correctRecipe}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      playTickSound(soundEnabled);
                      onDeleteError(log.id);
                    }}
                    title="Delete log entry"
                    className="p-2 text-stone-300 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
