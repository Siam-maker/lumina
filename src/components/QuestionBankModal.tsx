import React, { useState } from 'react';
import {
  X,
  Search,
  Check,
  AlertTriangle,
  Sparkles,
  ExternalLink,
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
      launchConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 20);
    } else {
      playTickSound(soundEnabled);
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Overview Banner */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-[0_10px_35px_-5px_rgba(28,25,23,0.04)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-stone-900 text-white shadow-2xs">
                253-Page Topic Bank
              </span>
              <span className="text-xs font-semibold text-stone-600 bg-[#F4F3ED] px-3 py-1 rounded-full border border-stone-200">
                208 Solved Entries · 13 Exam Papers
              </span>
            </div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Model Answer Reference & Worked Solutions
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              Inspect repeated cases, exact computational equations, final numbers, and trap warnings from the official IPE 105 Topic-wise Question Bank.
            </p>
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID (e.g. Q42, Q126), topic, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#F9F8F4] hover:bg-white focus:bg-white border border-stone-200 focus:border-stone-400 rounded-2xl text-xs font-medium text-stone-900 placeholder-stone-400 outline-none transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Grid of Questions with spacious padding */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredQuestions.map((q) => {
          const isSolved = !!solvedQuestions[q.id];
          return (
            <div
              key={q.id}
              onClick={() => {
                playTickSound(soundEnabled);
                setActiveQuestion(q);
              }}
              className={`bg-white/90 backdrop-blur-md rounded-3xl border p-6 transition-all duration-300 flex flex-col justify-between gap-4 cursor-pointer hover:scale-[1.01] ${
                isSolved
                  ? 'border-teal-300/80 bg-teal-50/15 shadow-[0_4px_24px_-4px_rgba(13,148,136,0.06)]'
                  : 'border-stone-200/90 shadow-[0_6px_25px_-5px_rgba(28,25,23,0.04)] hover:border-stone-300'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-stone-900 text-white">
                      {q.id}
                    </span>
                    <span className="text-xs font-bold text-stone-500 bg-[#EFECE6] px-2 py-0.5 rounded-md">
                      p.{q.pdfPage}
                    </span>
                    <span className="text-xs font-semibold text-stone-600 bg-white px-2 py-0.5 rounded-md border border-stone-200">
                      {q.marks} marks
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleToggle(q.id, e)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                      isSolved
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'bg-white border-2 border-stone-300 hover:border-stone-500'
                    }`}
                  >
                    {isSolved && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                </div>

                <h3 className="text-base font-bold text-stone-900 leading-snug">
                  {q.title}
                </h3>
                <p className="text-xs text-stone-400 font-medium">
                  {q.examTag} · {q.topicName}
                </p>

                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed pt-1">
                  {q.sourceText}
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold">
                <span className="text-stone-700 hover:text-stone-900 flex items-center gap-1.5">
                  <span>Worked Model Answer</span>
                  <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
                </span>
                {q.isRepeatedCase && (
                  <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 text-[10px] font-extrabold">
                    ★ Repeated
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Dialog for Detailed Worked Question */}
      {activeQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative bg-[#FCFBF8] rounded-3xl border border-stone-200 max-w-2xl w-full max-h-[90vh] overflow-y-auto p-7 sm:p-8 shadow-2xl space-y-5">
            <button
              onClick={() => setActiveQuestion(null)}
              className="absolute top-6 right-6 p-2 rounded-xl text-stone-400 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1.5 pr-10">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black px-3 py-1 rounded-lg bg-stone-900 text-white">
                  {activeQuestion.id}
                </span>
                <span className="text-xs font-bold text-stone-800 bg-[#EFECE6] px-3 py-1 rounded-full border border-stone-200">
                  {activeQuestion.examTag}
                </span>
                <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                  PDF Page {activeQuestion.pdfPage} · {activeQuestion.marks} Marks
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-stone-900 pt-1 tracking-tight">
                {activeQuestion.title}
              </h2>
              <div className="text-xs text-stone-500 font-medium">
                Topic {activeQuestion.topicNumber}: {activeQuestion.topicName}
              </div>
            </div>

            {/* Repeat History Badge */}
            {activeQuestion.repeatHistory && (
              <div className="bg-amber-50/90 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-900 font-medium flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Repeat Pattern:</strong> {activeQuestion.repeatHistory}
                </span>
              </div>
            )}

            {/* Problem Statement Prompt */}
            <div className="bg-white p-4.5 rounded-2xl border border-stone-200 space-y-2 shadow-2xs">
              <span className="text-xs font-extrabold text-stone-400 uppercase tracking-widest block">
                Problem Statement (from exam paper):
              </span>
              <p className="text-xs text-stone-800 leading-relaxed font-mono">
                {activeQuestion.sourceText}
              </p>
            </div>

            {/* Requirements */}
            <div className="space-y-1.5">
              <span className="text-xs font-extrabold text-stone-400 uppercase tracking-widest block">
                Required in Exam:
              </span>
              <ul className="list-disc list-inside space-y-1 text-xs text-stone-700 leading-relaxed">
                {activeQuestion.requirements.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            {/* Model Key Formulas & Calculations */}
            <div className="bg-[#F5F4EE] p-5 rounded-2xl border border-stone-200 space-y-3">
              <span className="text-xs font-extrabold text-stone-700 uppercase tracking-widest block">
                Model Calculation Steps & Equations:
              </span>
              <div className="space-y-2">
                {activeQuestion.keyFormulas.map((f, i) => (
                  <div
                    key={i}
                    className="font-mono text-xs text-stone-900 bg-white p-2.5 rounded-xl border border-stone-200 leading-relaxed shadow-2xs"
                  >
                    {f}
                  </div>
                ))}
              </div>
            </div>

            {/* Numerical Highlights Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {activeQuestion.numericalHighlights.map((nh, i) => (
                <div key={i} className="bg-white p-3 rounded-2xl border border-stone-200 text-center shadow-2xs">
                  <span className="text-[10px] text-stone-500 font-bold block">{nh.label}</span>
                  <span className="text-sm font-black text-stone-900 tabular-nums block mt-0.5">
                    {nh.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Interactive Math Sandbox / Self-Testing Checker */}
            <div className="bg-[#FAF9F5] p-4.5 rounded-2xl border border-stone-200 space-y-2.5">
              <span className="text-xs font-extrabold text-stone-800 uppercase tracking-wider block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Test Your Final Answer (Self-Check):</span>
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter your calculated number (e.g. 78.16, 265000)..."
                  id="sandbox-input"
                  className="flex-1 px-3.5 py-2 bg-white border border-stone-300 rounded-xl text-xs font-mono text-stone-900 outline-none focus:border-stone-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const inputEl = document.getElementById('sandbox-input') as HTMLInputElement;
                    const val = inputEl?.value.replace(/,/g, '').trim();
                    if (!val) return;
                    const isMatch = activeQuestion.numericalHighlights.some((nh) =>
                      nh.value.replace(/,/g, '').toLowerCase().includes(val.toLowerCase())
                    );
                    const feedbackEl = document.getElementById('sandbox-feedback');
                    if (feedbackEl) {
                      if (isMatch) {
                        playSuccessChime(soundEnabled);
                        launchConfetti(window.innerWidth / 2, window.innerHeight / 2, 25);
                        feedbackEl.innerHTML = '<span class="text-teal-700 font-bold">✅ Correct! Match found with model answer figures.</span>';
                      } else {
                        playTickSound(soundEnabled);
                        feedbackEl.innerHTML = '<span class="text-rose-700 font-semibold">❌ Not quite matching the key targets. Check intermediate decimal rounding or formulas above.</span>';
                      }
                    }
                  }}
                  className="px-4 py-2 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
                >
                  Verify Math
                </button>
              </div>
              <div id="sandbox-feedback" className="text-xs pt-0.5"></div>
            </div>

            {/* Trap Warning */}
            {activeQuestion.trapWarning && (
              <div className="bg-rose-50/80 border border-rose-200 p-4 rounded-2xl text-xs text-rose-950 font-medium flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-rose-950 font-extrabold">Exam Trap Alert:</strong> {activeQuestion.trapWarning}
                </div>
              </div>
            )}

            {/* Footer buttons */}
            <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onToggleQuestion(activeQuestion.id);
                  setActiveQuestion(null);
                }}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
                  solvedQuestions[activeQuestion.id]
                    ? 'bg-stone-200 text-stone-800 hover:bg-stone-300'
                    : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
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
                className="px-5 py-2.5 rounded-2xl text-xs font-bold text-stone-600 hover:bg-stone-200/80 cursor-pointer"
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
