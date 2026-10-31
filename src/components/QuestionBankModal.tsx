import React, { useState } from 'react';
import {
  X,
  Search,
  BookOpen,
  Check,
  AlertTriangle,
  Sparkles,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { QUESTION_BANK, QuestionDetail } from '../data/questionBankData';
import { playSuccessChime, playTickSound } from '../utils/sound';
import { launchConfetti } from '../utils/confetti';

interface QuestionBankViewProps {
  solvedQuestions: Record<string, boolean>;
  onToggleQuestion: (questionId: string) => void;
  selectedQuestionId: string | null;
  onCloseModal?: () => void;
  soundEnabled: boolean;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  solvedQuestions,
  onToggleQuestion,
  selectedQuestionId,
  onCloseModal,
  soundEnabled,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeQuestion, setActiveQuestion] = useState<QuestionDetail | null>(
    selectedQuestionId ? QUESTION_BANK[selectedQuestionId] || null : null
  );

  const questionsList = Object.values(QUESTION_BANK);

  const filteredQuestions = questionsList.filter((q) => {
    const qStr = (q.id + ' ' + q.title + ' ' + q.topicName + ' ' + q.examTag).toLowerCase();
    return qStr.includes(searchQuery.toLowerCase());
  });

  const handleToggle = (qId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const wasSolved = !!solvedQuestions[qId];
    onToggleQuestion(qId);
    if (!wasSolved) {
      playSuccessChime(soundEnabled);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      launchConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 18);
    } else {
      playTickSound(soundEnabled);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Overview Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-indigo-100 p-6 shadow-[0_8px_30px_rgba(79,70,229,0.06)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                253-Page Topic Bank
              </span>
              <span className="text-xs font-semibold text-slate-500">
                208 Solved Entries · 13 Exam Papers
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Model Answer Reference & Worked Solutions
            </h2>
            <p className="text-xs text-slate-600 max-w-xl">
              Inspect repeated cases, exact computational equations, final numbers, and trap warnings from the official IPE 105 Topic-wise Question Bank.
            </p>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by question ID (e.g. Q42, Q126), topic, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-400 rounded-2xl text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Grid of Questions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredQuestions.map((q) => {
          const isSolved = !!solvedQuestions[q.id];
          return (
            <div
              key={q.id}
              onClick={() => {
                playTickSound(soundEnabled);
                setActiveQuestion(q);
              }}
              className={`bg-white/75 backdrop-blur-md rounded-2xl md:rounded-3xl border p-5 transition-all duration-300 flex flex-col justify-between gap-3 cursor-pointer hover:scale-[1.01] ${
                isSolved
                  ? 'border-teal-200/90 bg-teal-50/20 shadow-[0_4px_20px_rgba(20,184,166,0.06)]'
                  : 'border-indigo-500/12 shadow-[0_8px_30px_rgba(79,70,229,0.06)] hover:border-indigo-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {q.id}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      p.{q.pdfPage}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                      {q.marks} marks
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleToggle(q.id, e)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                      isSolved
                        ? 'bg-teal-500 text-white shadow-2xs'
                        : 'bg-white border-2 border-slate-300 hover:border-indigo-400'
                    }`}
                  >
                    {isSolved && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-800 leading-snug">
                  {q.title}
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {q.examTag} · {q.topicName}
                </p>

                <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                  {q.sourceText}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-indigo-600 flex items-center gap-1">
                  <span>View Worked Model Answer</span>
                  <ExternalLink className="w-3 h-3" />
                </span>
                {q.isRepeatedCase && (
                  <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[10px]">
                    ★ Repeated
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal / Dialog for Detailed Question View */}
      {activeQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl border border-indigo-100 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-4">
            <button
              onClick={() => setActiveQuestion(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1 pr-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white shadow-2xs">
                  {activeQuestion.id}
                </span>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  {activeQuestion.examTag}
                </span>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                  PDF Page {activeQuestion.pdfPage} · {activeQuestion.marks} Marks
                </span>
              </div>
              <h2 className="text-lg font-extrabold text-slate-800 pt-1">
                {activeQuestion.title}
              </h2>
              <div className="text-xs text-slate-500 font-medium">
                Topic {activeQuestion.topicNumber}: {activeQuestion.topicName}
              </div>
            </div>

            {/* Repeat History Badge */}
            {activeQuestion.repeatHistory && (
              <div className="bg-amber-50/90 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900 font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Repeat Pattern:</strong> {activeQuestion.repeatHistory}
                </span>
              </div>
            )}

            {/* Problem Statement Prompt */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Problem Statement (from exam paper):
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-mono">
                {activeQuestion.sourceText}
              </p>
            </div>

            {/* Requirements */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Required in Exam:
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700">
                {activeQuestion.requirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            {/* Model Key Formulas & Calculations */}
            <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100 space-y-2">
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wider block">
                Model Calculation Steps & Equations:
              </span>
              <div className="space-y-1">
                {activeQuestion.keyFormulas.map((f, i) => (
                  <div
                    key={i}
                    className="font-mono text-xs text-indigo-950 bg-white/80 p-2 rounded-xl border border-indigo-100"
                  >
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Numerical Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {activeQuestion.numericalHighlights.map((nh, i) => (
                <div key={i} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/70 text-center">
                  <span className="text-[10px] text-slate-500 font-semibold block">{nh.label}</span>
                  <span className="text-xs font-black text-indigo-700 tabular-nums block mt-0.5">
                    {nh.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Trap Warning */}
            {activeQuestion.trapWarning && (
              <div className="bg-rose-50/80 border border-rose-200 p-3 rounded-2xl text-xs text-rose-900 font-medium flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-950 font-bold">Exam Trap Alert:</strong> {activeQuestion.trapWarning}
                </div>
              </div>
            )}

            {/* Footer buttons */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onToggleQuestion(activeQuestion.id);
                  setActiveQuestion(null);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  solvedQuestions[activeQuestion.id]
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    : 'bg-teal-500 text-white hover:bg-teal-600 shadow-sm'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>
                  {solvedQuestions[activeQuestion.id] ? 'Mark Unsolved' : 'Mark as Solved'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveQuestion(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
