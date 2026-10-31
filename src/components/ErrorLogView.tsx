import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Download,
  Filter,
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
    <div className="space-y-6 pb-20">
      {/* Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-indigo-100 p-6 shadow-[0_8px_30px_rgba(79,70,229,0.06)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                Part 1 & 6 · Core Weapon
              </span>
              <span className="text-xs font-semibold text-slate-500">
                1-Line Mistake & Recipe Logger
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Personal Error Log & Re-solve Queue
            </h2>
            <p className="text-xs text-slate-600 max-w-xl">
              "Nov 4-er revision-er 40% ei log theke." Every mistake is logged as: Topic / Error Type (Concept · Formula · Arithmetic · Reading) / Correct Recipe. Re-solve these in Day 4 R2!
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                playTickSound(soundEnabled);
                setShowAddForm(!showAddForm);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold shadow-sm shadow-indigo-200 transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Error</span>
            </button>

            <button
              onClick={exportMarkdown}
              title="Export as Markdown for printing"
              className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export MD</span>
            </button>
          </div>
        </div>

        {/* Stats & Filter Bar */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 bg-slate-100/70 p-1 rounded-2xl text-xs font-medium overflow-x-auto">
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
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  typeFilter === f.id
                    ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="text-xs font-semibold text-slate-600">
            Re-solved for Day 4: <strong className="text-teal-600">{resolvedCount}</strong> / {totalCount}
          </div>
        </div>
      </div>

      {/* Add Error Form Modal/Drawer */}
      {showAddForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white/90 backdrop-blur-md rounded-3xl border border-indigo-200 p-5 shadow-lg space-y-4 animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Log a Mistake to Repair on Nov 4</span>
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Topic
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-400"
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
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Problem Ref (e.g. Q42 HDP)
              </label>
              <input
                type="text"
                value={problemRef}
                onChange={(e) => setProblemRef(e.target.value)}
                placeholder="e.g. Q126 PEM proposal 3"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                Error Type
              </label>
              <select
                value={errorType}
                onChange={(e) => setErrorType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-400"
              >
                <option value="Concept">Concept (Didn't understand definition/flow)</option>
                <option value="Formula">Formula (Substituted wrong formula)</option>
                <option value="Arithmetic">Arithmetic (Calculator / sign slip)</option>
                <option value="Reading">Reading (Missed constraint in problem prompt)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              What went wrong? (1 sentence)
            </label>
            <input
              type="text"
              value={whatWentWrong}
              onChange={(e) => setWhatWentWrong(e.target.value)}
              placeholder="e.g. Used units sold instead of units produced when calculating fixed MOH rate."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-400"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
              Correct Recipe / Rule (1 sentence)
            </label>
            <input
              type="text"
              value={correctRecipe}
              onChange={(e) => setCorrectRecipe(e.target.value)}
              placeholder="e.g. Fixed MOH rate = Total Fixed MOH ÷ UNITS PRODUCED, always."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:border-indigo-400"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              Save Error Entry
            </button>
          </div>
        </form>
      )}

      {/* Errors List */}
      <div className="space-y-3">
        {filteredLogs.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-10 text-center border border-indigo-100/70">
            <div className="w-12 h-12 mx-auto mb-3 text-slate-300">
              <BookOpen className="w-12 h-12 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">No errors found in this filter</h3>
            <p className="text-xs text-slate-500 mt-1">
              Whenever you make a calculation slip or misread a problem during practice, tap "Log New Error"!
            </p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const typeBadgeColors = {
              Concept: 'bg-indigo-50 text-indigo-700 border-indigo-200',
              Formula: 'bg-rose-50 text-rose-700 border-rose-200',
              Arithmetic: 'bg-amber-50 text-amber-700 border-amber-200',
              Reading: 'bg-teal-50 text-teal-700 border-teal-200',
            }[log.errorType];

            return (
              <div
                key={log.id}
                className={`bg-white/75 backdrop-blur-md rounded-2xl md:rounded-3xl border p-4.5 transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  log.resolved
                    ? 'border-teal-200 bg-teal-50/15 opacity-80'
                    : 'border-indigo-500/12 shadow-[0_4px_20px_rgba(79,70,229,0.05)] hover:border-indigo-300'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => {
                      playTickSound(soundEnabled);
                      onToggleResolved(log.id);
                    }}
                    title={log.resolved ? 'Mark unresolved' : 'Mark re-solved on Day 4'}
                    className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                      log.resolved
                        ? 'bg-teal-500 text-white shadow-2xs'
                        : 'border-2 border-slate-300 hover:border-teal-500 bg-white'
                    }`}
                  >
                    {log.resolved && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${typeBadgeColors}`}>
                        {log.errorType}
                      </span>
                      <span className="text-xs font-bold text-slate-800">
                        {log.topic}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                        {log.problemRef}
                      </span>
                      {log.resolved && (
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                          Day 4 Re-solved ✓
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-rose-700 font-medium">
                      ❌ <span className="font-semibold text-slate-600">Mistake:</span> {log.whatWentWrong}
                    </div>

                    <div className="text-xs text-indigo-900 font-semibold bg-indigo-50/60 p-2 rounded-xl border border-indigo-100/60">
                      💡 <span className="text-indigo-700 font-bold">Fix / Rule:</span> {log.correctRecipe}
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
                    className="p-1.5 text-slate-300 hover:text-rose-500 transition-colors cursor-pointer"
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
