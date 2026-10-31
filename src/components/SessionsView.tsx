import React, { useState } from 'react';
import {
  Check,
  ChevronDown,
  Star,
  Clock,
  BookOpen,
  AlertTriangle,
  Play,
  CheckCircle2,
  ListTodo,
  ExternalLink,
  Target,
} from 'lucide-react';
import {
  DAYS_DATA,
  SESSIONS_DATA,
  SessionBlock,
  TopicTier,
  QuestionRef,
} from '../data/roadmapData';
import { launchConfetti } from '../utils/confetti';
import { playSuccessChime, playTickSound } from '../utils/sound';

interface SessionsViewProps {
  completedSessions: Record<string, boolean>;
  weakSessions: Record<string, boolean>;
  solvedQuestions: Record<string, boolean>;
  onToggleSession: (sessionId: string) => void;
  onToggleWeak: (sessionId: string) => void;
  onToggleQuestion: (questionId: string) => void;
  onSelectQuestion: (questionId: string) => void;
  onStartSessionTimer: (session: SessionBlock) => void;
  soundEnabled: boolean;
}

export const SessionsView: React.FC<SessionsViewProps> = ({
  completedSessions,
  weakSessions,
  solvedQuestions,
  onToggleSession,
  onToggleWeak,
  onToggleQuestion,
  onSelectQuestion,
  onStartSessionTimer,
  soundEnabled,
}) => {
  const [selectedDayId, setSelectedDayId] = useState<string>('day-0');
  const [filterMode, setFilterMode] = useState<'all' | 'incomplete' | 'weak' | 'tierA'>('all');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [justCheckedId, setJustCheckedId] = useState<string | null>(null);

  const selectedDay = DAYS_DATA.find((d) => d.id === selectedDayId) || DAYS_DATA[0];

  // Filter sessions for the current day
  const daySessions = SESSIONS_DATA.filter((s) => s.dayId === selectedDayId);
  const filteredSessions = daySessions.filter((session) => {
    const isCompleted = !!completedSessions[session.id];
    const isWeak = !!weakSessions[session.id];
    if (filterMode === 'incomplete') return !isCompleted;
    if (filterMode === 'weak') return isWeak;
    if (filterMode === 'tierA') return session.tier === 'A';
    return true;
  });

  const dayTotalCount = daySessions.length;
  const dayCompletedCount = daySessions.filter((s) => !!completedSessions[s.id]).length;
  const dayPercent = dayTotalCount > 0 ? Math.round((dayCompletedCount / dayTotalCount) * 100) : 0;

  const toggleExpand = (id: string) => {
    playTickSound(soundEnabled);
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSessionCheck = (session: SessionBlock, e: React.MouseEvent) => {
    e.stopPropagation();
    const wasCompleted = !!completedSessions[session.id];
    onToggleSession(session.id);

    if (!wasCompleted) {
      playSuccessChime(soundEnabled);
      setJustCheckedId(session.id);
      setTimeout(() => setJustCheckedId(null), 600);

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const originX = rect.left + rect.width / 2;
      const originY = rect.top + rect.height / 2;
      launchConfetti(originX, originY, 22);

      // Check if whole day completed
      if (dayCompletedCount + 1 === dayTotalCount) {
        setTimeout(() => {
          launchConfetti(window.innerWidth / 2, window.innerHeight / 3, 75);
        }, 300);
      }
    } else {
      playTickSound(soundEnabled);
    }
  };

  const getTierBadge = (tier: TopicTier) => {
    switch (tier) {
      case 'A':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-xs shadow-indigo-200">
            Tier A · Must
          </span>
        );
      case 'B':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            Tier B · Important
          </span>
        );
      case 'C':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Tier C · Quick Theory
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Day Selector Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {DAYS_DATA.map((day) => {
          const isSelected = day.id === selectedDayId;
          const daySessionsList = SESSIONS_DATA.filter((s) => s.dayId === day.id);
          const done = daySessionsList.filter((s) => !!completedSessions[s.id]).length;
          const total = daySessionsList.length;
          const isDoneAll = total > 0 && done === total;

          return (
            <button
              key={day.id}
              onClick={() => {
                playTickSound(soundEnabled);
                setSelectedDayId(day.id);
              }}
              className={`flex-shrink-0 px-3.5 py-2 rounded-2xl border transition-all duration-200 text-left cursor-pointer ${
                isSelected
                  ? `bg-white shadow-[0_8px_20px_rgba(99,102,241,0.12)] border-indigo-400 ring-2 ring-indigo-300/40 scale-[1.02]`
                  : `bg-white/70 hover:bg-white border-slate-200/80 text-slate-600 shadow-2xs`
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`text-xs font-bold ${
                    isSelected ? 'text-indigo-900' : 'text-slate-700'
                  }`}
                >
                  {day.dayName}
                </span>
                {isDoneAll ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
                ) : (
                  <span className="text-[10px] tabular-nums font-semibold text-slate-400">
                    {done}/{total}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 font-medium truncate max-w-[130px] mt-0.5">
                {day.dateString}
              </div>
            </button>
          );
        })}
      </div>

      {/* Day Overview Banner Card */}
      <div className="relative overflow-hidden bg-white/80 backdrop-blur-md rounded-3xl border border-indigo-100 p-5 shadow-[0_8px_30px_rgba(79,70,229,0.06)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${selectedDay.colorTheme.badgeBg}`}>
                {selectedDay.dayName} · {selectedDay.dateString}
              </span>
              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Target: {selectedDay.targetStudyHours}
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              {selectedDay.themeTitle}
            </h2>
            <p className="text-xs text-slate-600 flex items-center gap-1.5 pt-0.5">
              <Target className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span>
                <strong className="text-slate-700">Night Output Target:</strong> {selectedDay.outputByNight}
              </span>
            </p>
          </div>

          {/* Progress Bar & Stat */}
          <div className="flex items-center gap-3 bg-slate-50/80 border border-slate-200/60 p-3 rounded-2xl min-w-[210px]">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-600">Day Progress</span>
                <span className="font-bold tabular-nums text-indigo-600">{dayPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${selectedDay.colorTheme.accentGrad} transition-all duration-500 rounded-full`}
                  style={{ width: `${dayPercent}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-700 tabular-nums">
                {dayCompletedCount}/{dayTotalCount}
              </span>
              <div className="text-[10px] text-slate-400">done</div>
            </div>
          </div>
        </div>

        {/* Filter Chips inside banner */}
        <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100/70 p-1 rounded-2xl text-xs font-semibold">
            {(
              [
                { id: 'all', label: 'All Sessions' },
                { id: 'incomplete', label: 'Remaining' },
                { id: 'weak', label: 'Weak Starred' },
                { id: 'tierA', label: 'Tier A Only' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => {
                  playTickSound(soundEnabled);
                  setFilterMode(filter.id);
                }}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  filterMode === filter.id
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-700">{filteredSessions.length}</strong> of {dayTotalCount} blocks
          </div>
        </div>
      </div>

      {/* Session Blocks List */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-md rounded-3xl p-10 text-center border border-indigo-100/80 shadow-sm">
            <div className="w-12 h-12 mx-auto mb-3 text-indigo-300">
              <CheckCircle2 className="w-12 h-12 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-slate-700">No sessions match this filter</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {filterMode === 'incomplete'
                ? 'All sessions for this day are finished! Fantastic job.'
                : 'Try switching filters or selecting another day.'}
            </p>
            <button
              onClick={() => setFilterMode('all')}
              className="mt-4 px-4 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors cursor-pointer"
            >
              Show all sessions
            </button>
          </div>
        ) : (
          filteredSessions.map((session, index) => {
            const isCompleted = !!completedSessions[session.id];
            const isWeak = !!weakSessions[session.id];
            const isExpanded = !!expandedCards[session.id];
            const isPopping = justCheckedId === session.id;

            return (
              <div
                key={session.id}
                style={{ animationDelay: `${index * 60}ms` }}
                className={`group relative bg-white/75 backdrop-blur-md rounded-2xl md:rounded-3xl border transition-all duration-300 ${
                  isCompleted
                    ? 'border-teal-200/80 bg-teal-50/20 shadow-[0_4px_20px_rgba(20,184,166,0.06)]'
                    : isWeak
                    ? 'border-amber-200/90 bg-amber-50/20 shadow-[0_4px_20px_rgba(245,158,11,0.06)]'
                    : 'border-indigo-500/12 shadow-[0_8px_30px_rgba(79,70,229,0.06)] hover:border-indigo-300/60'
                } ${isPopping ? 'animate-check-pop ring-2 ring-teal-300' : ''}`}
              >
                {/* Header row / Main Summary */}
                <div
                  onClick={() => toggleExpand(session.id)}
                  className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    {/* Animated Checkbox */}
                    <button
                      type="button"
                      onClick={(e) => handleSessionCheck(session, e)}
                      title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                      className={`relative w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 mt-0.5 sm:mt-0 cursor-pointer ${
                        isCompleted
                          ? 'bg-teal-500 text-white shadow-sm shadow-teal-200 ring-2 ring-teal-300/50'
                          : 'bg-white border-2 border-slate-300 hover:border-indigo-400 hover:bg-indigo-50/30'
                      }`}
                    >
                      {isCompleted && (
                        <Check className="w-4 h-4 stroke-[3] transition-transform duration-200 scale-100" />
                      )}
                    </button>

                    {/* Content text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-800 bg-slate-100/90 px-2 py-0.5 rounded-lg tabular-nums">
                          {session.timeSlot}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {session.blockNumber}
                        </span>
                        {getTierBadge(session.tier)}
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-bold transition-colors ${
                          isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'
                        }`}
                      >
                        {session.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <BookOpen className="w-3 h-3 text-indigo-400" />
                          <span className="truncate max-w-[280px]">{session.garrisonRef}</span>
                        </span>
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{session.durationMinutes} min</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions on right */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    {/* Weak Topic Flag Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTickSound(soundEnabled);
                        onToggleWeak(session.id);
                      }}
                      title={isWeak ? 'Remove weak mark' : 'Flag as weak topic'}
                      className={`p-2 rounded-xl transition-all cursor-pointer active:scale-90 ${
                        isWeak
                          ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-300/70 animate-star-wiggle'
                          : 'text-slate-300 hover:text-amber-500 hover:bg-amber-50'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${isWeak ? 'fill-amber-500 text-amber-500' : ''}`} />
                    </button>

                    {/* Timer trigger button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playTickSound(soundEnabled);
                        onStartSessionTimer(session);
                      }}
                      title="Start timer for this block"
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/60 transition-all active:scale-95 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-indigo-600" />
                      <span>Timer</span>
                    </button>

                    {/* Chevron toggle */}
                    <button
                      type="button"
                      className="p-1.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isExpanded ? 'transform rotate-180 text-indigo-600' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Practice Question Chips preview under header */}
                {session.practiceQuestions.length > 0 && (
                  <div className="px-5 pb-3.5 pt-0 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                      <ListTodo className="w-3 h-3" /> Problems:
                    </span>
                    {session.practiceQuestions.map((q: QuestionRef) => {
                      const isSolved = !!solvedQuestions[q.id];
                      return (
                        <div
                          key={q.id}
                          className="inline-flex items-center gap-1 bg-white/90 border border-slate-200/90 rounded-lg p-0.5 shadow-2xs hover:border-indigo-300 transition-all"
                        >
                          {/* Toggle question solved */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playTickSound(soundEnabled);
                              onToggleQuestion(q.id);
                            }}
                            className={`px-2 py-0.5 rounded-md text-[11px] font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
                              isSolved
                                ? 'bg-teal-500 text-white'
                                : 'bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                            }`}
                          >
                            {isSolved && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            <span>{q.id}</span>
                            {q.isStar && <span className="text-amber-300 text-[10px]">★</span>}
                          </button>

                          {/* Inspect solution */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectQuestion(q.id);
                            }}
                            title={`Inspect ${q.id} (${q.title}, p${q.pdfPage})`}
                            className="px-1 text-[10px] text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-0.5"
                          >
                            <span>p.{q.pdfPage}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Expanded Card Details */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-slate-100 text-xs space-y-4">
                    {/* Instructions / Ki korbe */}
                    <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/60">
                      <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1 text-[13px]">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Execution Playbook (Kotha theke & ki bhabe)</span>
                      </h4>
                      <p className="text-slate-600 leading-relaxed">{session.description}</p>
                    </div>

                    {/* Standard 2-Hour Study Block Breakdown if applicable */}
                    {session.standardBlockShape && (
                      <div className="bg-indigo-50/50 rounded-2xl p-3.5 border border-indigo-100">
                        <h4 className="font-bold text-indigo-900 mb-2 flex items-center justify-between">
                          <span>Standard 2-Hour Study Block Architecture:</span>
                          <span className="text-[10px] px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">
                            Formula for Mastery
                          </span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px]">
                          <div className="bg-white/80 p-2 rounded-xl border border-indigo-100/70">
                            <span className="font-bold text-indigo-600 block">0–20 min</span>
                            <span className="text-slate-600">Concept skim: summary & input-output recipe.</span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-xl border border-indigo-100/70">
                            <span className="font-bold text-indigo-600 block">20–30 min</span>
                            <span className="text-slate-600">Formula sheet: handwritten with 1-line example.</span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-xl border border-indigo-100/70">
                            <span className="font-bold text-indigo-600 block">30–55 min</span>
                            <span className="text-slate-600">Guided problem: cover answer, step line match.</span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-xl border border-indigo-100/70">
                            <span className="font-bold text-indigo-600 block">55–105 min</span>
                            <span className="text-slate-600">Blind problems: 2 problems under timer (no peek!).</span>
                          </div>
                          <div className="bg-white/80 p-2 rounded-xl border border-indigo-100/70">
                            <span className="font-bold text-indigo-600 block">105–120 min</span>
                            <span className="text-slate-600">Check & Error Log: 1-line log + oral recall.</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Formulas To Memorize */}
                    {session.formulas.length > 0 && (
                      <div className="bg-white/90 rounded-2xl p-3.5 border border-slate-200/80 shadow-2xs">
                        <h4 className="font-bold text-slate-800 mb-1.5 flex items-center gap-1.5 text-[12px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                          <span>Formulas to Commit to Muscle Memory:</span>
                        </h4>
                        <div className="space-y-1">
                          {session.formulas.map((f, i) => (
                            <div
                              key={i}
                              className="font-mono text-[11px] bg-slate-50 px-2.5 py-1 rounded-lg text-slate-800 border border-slate-100"
                            >
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Common Traps */}
                    {session.commonTraps.length > 0 && (
                      <div className="bg-rose-50/60 rounded-2xl p-3.5 border border-rose-200/60">
                        <h4 className="font-bold text-rose-800 mb-1.5 flex items-center gap-1.5 text-[12px]">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          <span>Exam Traps in this Topic (Watch Out!):</span>
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-slate-700">
                          {session.commonTraps.map((trap, i) => (
                            <li key={i} className="leading-relaxed">
                              {trap}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Mobile timer launcher inside expanded */}
                    <div className="pt-2 flex items-center justify-end sm:hidden">
                      <button
                        type="button"
                        onClick={() => {
                          playTickSound(soundEnabled);
                          onStartSessionTimer(session);
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-500 shadow-sm active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Launch Timer for {session.durationMinutes} min</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
