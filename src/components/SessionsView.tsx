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
  Sparkles,
  Layers,
  ArrowRight,
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
  const [activeCardTab, setActiveCardTab] = useState<Record<string, 'playbook' | 'routine' | 'formulas' | 'traps'>>({});
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
    if (!activeCardTab[id]) {
      setActiveCardTab((prev) => ({ ...prev, [id]: 'playbook' }));
    }
  };

  const setCardTab = (sessionId: string, tab: 'playbook' | 'routine' | 'formulas' | 'traps', e: React.MouseEvent) => {
    e.stopPropagation();
    playTickSound(soundEnabled);
    setActiveCardTab((prev) => ({ ...prev, [sessionId]: tab }));
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
      launchConfetti(originX, originY, 24);

      if (dayCompletedCount + 1 === dayTotalCount) {
        setTimeout(() => {
          launchConfetti(window.innerWidth / 2, window.innerHeight / 3, 80);
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
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-stone-900 text-stone-100 shadow-2xs">
            Tier A · High Yield
          </span>
        );
      case 'B':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-900 border border-amber-200/80">
            Tier B · Important
          </span>
        );
      case 'C':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-stone-100 text-stone-600 border border-stone-200">
            Tier C · Quick Theory
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-24">
      {/* Day Selector Chips with warm off-white styling */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
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
              className={`flex-shrink-0 px-4 py-2.5 rounded-2xl border transition-all duration-200 text-left cursor-pointer ${
                isSelected
                  ? 'bg-white shadow-[0_8px_25px_-5px_rgba(28,25,23,0.08)] border-stone-400 ring-2 ring-stone-300/60 scale-[1.02]'
                  : 'bg-[#FDFCFA] hover:bg-white border-stone-200/80 text-stone-600 shadow-2xs'
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <span className={`text-xs font-extrabold ${isSelected ? 'text-stone-900' : 'text-stone-700'}`}>
                  {day.dayName}
                </span>
                {isDoneAll ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                ) : (
                  <span className="text-[11px] tabular-nums font-semibold text-stone-400">
                    {done}/{total}
                  </span>
                )}
              </div>
              <div className="text-xs text-stone-500 font-medium truncate max-w-[140px] mt-1">
                {day.dateString}
              </div>
            </button>
          );
        })}
      </div>

      {/* Day Overview Banner Card with Generous Breathing Room */}
      <div className="relative overflow-hidden bg-white/90 backdrop-blur-md rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-[0_10px_35px_-5px_rgba(28,25,23,0.04)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-stone-900 text-white shadow-2xs">
                {selectedDay.dayName} · {selectedDay.dateString}
              </span>
              <span className="text-xs font-semibold text-stone-600 bg-[#F4F3ED] px-3 py-1 rounded-full border border-stone-200">
                Target Study: {selectedDay.targetStudyHours}
              </span>
            </div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              {selectedDay.themeTitle}
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 flex items-start gap-2 pt-1 leading-relaxed max-w-2xl">
              <Target className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong className="text-stone-800 font-bold">Night Output Goal:</strong>{' '}
                {selectedDay.outputByNight}
              </span>
            </p>
          </div>

          {/* Progress Bar & Stat in Warm Box */}
          <div className="flex items-center gap-4 bg-[#F8F7F3] border border-stone-200/90 p-4 rounded-2xl min-w-[240px] shadow-2xs">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-bold text-stone-600">Day Completion</span>
                <span className="font-extrabold tabular-nums text-stone-900">{dayPercent}%</span>
              </div>
              <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-stone-800 to-amber-600 transition-all duration-500 rounded-full"
                  style={{ width: `${dayPercent}%` }}
                />
              </div>
            </div>
            <div className="text-right pl-2 border-l border-stone-200">
              <span className="text-sm font-extrabold text-stone-900 tabular-nums">
                {dayCompletedCount}/{dayTotalCount}
              </span>
              <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">done</div>
            </div>
          </div>
        </div>

        {/* Filter Controls with Spacious Sliding Look */}
        <div className="pt-4 border-t border-stone-200/60 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 bg-[#EFECE6] p-1.5 rounded-2xl text-xs font-semibold overflow-x-auto">
            {(
              [
                { id: 'all', label: 'All Sessions' },
                { id: 'incomplete', label: 'Remaining To-Do' },
                { id: 'weak', label: 'Weak Topics' },
                { id: 'tierA', label: 'Tier A Only' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                onClick={() => {
                  playTickSound(soundEnabled);
                  setFilterMode(filter.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  filterMode === filter.id
                    ? 'bg-white text-stone-900 shadow-2xs font-extrabold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="text-xs text-stone-500 font-medium">
            Displaying <strong className="text-stone-800 font-bold">{filteredSessions.length}</strong> of {dayTotalCount} study blocks
          </div>
        </div>
      </div>

      {/* Session Blocks List with Uncluttered, De-Congested Spacing */}
      <div className="space-y-5">
        {filteredSessions.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-12 text-center border border-stone-200 shadow-sm space-y-3">
            <div className="w-12 h-12 mx-auto text-stone-400">
              <CheckCircle2 className="w-12 h-12 stroke-[1.5]" />
            </div>
            <h3 className="text-base font-bold text-stone-800">No sessions match this filter</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              {filterMode === 'incomplete'
                ? 'All sessions for this day are finished! Fantastic progress.'
                : 'Try switching filters or selecting another day.'}
            </p>
            <button
              onClick={() => setFilterMode('all')}
              className="px-4 py-2 text-xs font-bold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
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
            const currentTab = activeCardTab[session.id] || 'playbook';

            return (
              <div
                key={session.id}
                style={{ animationDelay: `${index * 50}ms` }}
                className={`group relative bg-white/90 backdrop-blur-md rounded-3xl border transition-all duration-300 ${
                  isCompleted
                    ? 'border-teal-300/80 bg-teal-50/15 shadow-[0_4px_24px_-4px_rgba(13,148,136,0.06)]'
                    : isWeak
                    ? 'border-amber-300/80 bg-amber-50/20 shadow-[0_4px_24px_-4px_rgba(217,119,6,0.06)]'
                    : 'border-stone-200/90 shadow-[0_6px_25px_-5px_rgba(28,25,23,0.04)] hover:border-stone-300'
                } ${isPopping ? 'animate-check-pop ring-2 ring-teal-400' : ''}`}
              >
                {/* Header row / Main Summary with Relaxed Padding */}
                <div
                  onClick={() => toggleExpand(session.id)}
                  className="p-5 sm:p-6 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    {/* Animated Checkbox Button */}
                    <button
                      type="button"
                      onClick={(e) => handleSessionCheck(session, e)}
                      title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                      className={`relative w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 mt-0.5 sm:mt-0 cursor-pointer ${
                        isCompleted
                          ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-300/50'
                          : 'bg-[#FAF9F5] border-2 border-stone-300 hover:border-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      {isCompleted && (
                        <Check className="w-4 h-4 stroke-[3] transition-transform duration-200 scale-100" />
                      )}
                    </button>

                    {/* Content text */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-stone-800 bg-[#EFECE6] px-2.5 py-0.5 rounded-lg tabular-nums">
                          {session.timeSlot}
                        </span>
                        <span className="text-xs font-bold text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                          {session.blockNumber}
                        </span>
                        {getTierBadge(session.tier)}
                      </div>

                      <h3
                        className={`text-base sm:text-lg font-bold tracking-tight transition-colors ${
                          isCompleted ? 'text-stone-400 line-through' : 'text-stone-900'
                        }`}
                      >
                        {session.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                          <span className="truncate max-w-[340px]">{session.garrisonRef}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                          <span>{session.durationMinutes} minutes</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Star Weak Flag Button */}
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
                          ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-300/70 animate-star-wiggle'
                          : 'text-stone-300 hover:text-amber-600 hover:bg-amber-50'
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
                      title="Prime focus timer for this block"
                      className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-stone-800 bg-[#EFECE6] hover:bg-[#E5E2DC] border border-stone-200 transition-all active:scale-95 cursor-pointer shadow-2xs"
                    >
                      <Play className="w-3 h-3 fill-stone-800" />
                      <span>Timer</span>
                    </button>

                    {/* Chevron toggle button */}
                    <button
                      type="button"
                      className="p-1.5 text-stone-400 hover:text-stone-600 transition-transform duration-200 cursor-pointer"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isExpanded ? 'transform rotate-180 text-stone-800' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Practice Questions Preview Row with Comfortable Spacing */}
                {session.practiceQuestions.length > 0 && (
                  <div className="px-6 pb-4 pt-0 flex flex-wrap items-center gap-2 border-t border-stone-100/80 pt-3">
                    <span className="text-xs font-bold text-stone-400 mr-1 flex items-center gap-1">
                      <ListTodo className="w-3.5 h-3.5" /> Practice List:
                    </span>
                    {session.practiceQuestions.map((q: QuestionRef) => {
                      const isSolved = !!solvedQuestions[q.id];
                      return (
                        <div
                          key={q.id}
                          className="inline-flex items-center gap-1.5 bg-[#F9F8F4] border border-stone-200/90 rounded-xl px-2 py-1 shadow-2xs hover:border-stone-400 transition-all"
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              playTickSound(soundEnabled);
                              onToggleQuestion(q.id);
                            }}
                            className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-all active:scale-95 cursor-pointer flex items-center gap-1 ${
                              isSolved
                                ? 'bg-teal-600 text-white'
                                : 'bg-white text-stone-800 hover:bg-stone-100'
                            }`}
                          >
                            {isSolved && <Check className="w-3 h-3 stroke-[3]" />}
                            <span>{q.id}</span>
                            {q.isStar && <span className="text-amber-500 font-bold">★</span>}
                          </button>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectQuestion(q.id);
                            }}
                            title={`Inspect worked model answer for ${q.id} (${q.title})`}
                            className="text-[11px] font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-0.5 cursor-pointer"
                          >
                            <span>p.{q.pdfPage}</span>
                            <ExternalLink className="w-3 h-3 text-stone-400" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Expanded Card Drawer with Clean Sectioned Tabs */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-4 border-t border-stone-200/70 space-y-5 animate-in fade-in duration-200">
                    {/* Drawer Sub-tabs */}
                    <div className="flex items-center gap-1.5 bg-[#EFECE6] p-1 rounded-2xl overflow-x-auto text-xs font-semibold">
                      <button
                        onClick={(e) => setCardTab(session.id, 'playbook', e)}
                        className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                          currentTab === 'playbook'
                            ? 'bg-white text-stone-900 shadow-2xs font-bold'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        Playbook & Guide
                      </button>

                      {session.standardBlockShape && (
                        <button
                          onClick={(e) => setCardTab(session.id, 'routine', e)}
                          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                            currentTab === 'routine'
                              ? 'bg-white text-stone-900 shadow-2xs font-bold'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          2-Hour Block Architecture
                        </button>
                      )}

                      {session.formulas.length > 0 && (
                        <button
                          onClick={(e) => setCardTab(session.id, 'formulas', e)}
                          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                            currentTab === 'formulas'
                              ? 'bg-white text-stone-900 shadow-2xs font-bold'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          Formulas ({session.formulas.length})
                        </button>
                      )}

                      {session.commonTraps.length > 0 && (
                        <button
                          onClick={(e) => setCardTab(session.id, 'traps', e)}
                          className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                            currentTab === 'traps'
                              ? 'bg-white text-rose-800 shadow-2xs font-bold'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          Traps ({session.commonTraps.length})
                        </button>
                      )}
                    </div>

                    {/* Tab 1: Playbook */}
                    {currentTab === 'playbook' && (
                      <div className="bg-[#FAF9F5] rounded-2xl p-5 border border-stone-200/80 space-y-3">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-stone-600" />
                          <h4 className="text-sm font-bold text-stone-900">
                            Execution Recipe (Kotha theke porbo & ki korbo)
                          </h4>
                        </div>
                        <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                          {session.description}
                        </p>
                      </div>
                    )}

                    {/* Tab 2: 2-Hour Study Block Architecture */}
                    {currentTab === 'routine' && session.standardBlockShape && (
                      <div className="bg-[#FAF9F5] rounded-2xl p-5 border border-stone-200/80 space-y-3.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-stone-600" />
                            <h4 className="text-sm font-bold text-stone-900">
                              2-Hour Block Discipline (Recipe-First Loop)
                            </h4>
                          </div>
                          <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2.5 py-0.5 rounded-full">
                            120 min Total
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
                          <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
                            <span className="font-extrabold text-stone-900 block font-mono text-[11px]">
                              0–20 min
                            </span>
                            <span className="font-bold text-stone-800 block text-[12px]">Concept Skim</span>
                            <p className="text-stone-500 text-[11px] leading-relaxed">
                              Garrison exhibit & shortest worked answer. Understand input, step, output.
                            </p>
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
                            <span className="font-extrabold text-stone-900 block font-mono text-[11px]">
                              20–30 min
                            </span>
                            <span className="font-bold text-stone-800 block text-[12px]">Formula Write</span>
                            <p className="text-stone-500 text-[11px] leading-relaxed">
                              Handwrite formulas on paper with a 1-line mini example.
                            </p>
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
                            <span className="font-extrabold text-stone-900 block font-mono text-[11px]">
                              30–55 min
                            </span>
                            <span className="font-bold text-stone-800 block text-[12px]">Guided Solve</span>
                            <p className="text-stone-500 text-[11px] leading-relaxed">
                              Cover solution, solve problem yourself, match line by line.
                            </p>
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
                            <span className="font-extrabold text-stone-900 block font-mono text-[11px]">
                              55–105 min
                            </span>
                            <span className="font-bold text-stone-800 block text-[12px]">Blind Practice</span>
                            <p className="text-stone-500 text-[11px] leading-relaxed">
                              2 problems with timer (20-25m each). Absolutely zero peeking!
                            </p>
                          </div>

                          <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-2xs space-y-1">
                            <span className="font-extrabold text-stone-900 block font-mono text-[11px]">
                              105–120 min
                            </span>
                            <span className="font-bold text-stone-800 block text-[12px]">Check & Error Log</span>
                            <p className="text-stone-500 text-[11px] leading-relaxed">
                              1-line error log entry. Recite topic recipe in 5 lines verbally.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab 3: Formulas */}
                    {currentTab === 'formulas' && session.formulas.length > 0 && (
                      <div className="bg-[#FAF9F5] rounded-2xl p-5 border border-stone-200/80 space-y-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <h4 className="text-sm font-bold text-stone-900">
                            Key Formulas to Master for this Block
                          </h4>
                        </div>
                        <div className="space-y-2">
                          {session.formulas.map((f, i) => (
                            <div
                              key={i}
                              className="font-mono text-xs text-stone-900 bg-white p-3 rounded-xl border border-stone-200/90 shadow-2xs leading-relaxed"
                            >
                              {f}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tab 4: Common Traps */}
                    {currentTab === 'traps' && session.commonTraps.length > 0 && (
                      <div className="bg-rose-50/60 rounded-2xl p-5 border border-rose-200/70 space-y-2.5">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                          <h4 className="text-sm font-bold text-rose-950">
                            High-Risk Exam Traps to Avoid
                          </h4>
                        </div>
                        <ul className="space-y-2 text-xs sm:text-sm text-stone-800 leading-relaxed">
                          {session.commonTraps.map((trap, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="text-rose-500 font-bold">•</span>
                              <span>{trap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Mobile timer trigger */}
                    <div className="pt-2 flex sm:hidden">
                      <button
                        type="button"
                        onClick={() => {
                          playTickSound(soundEnabled);
                          onStartSessionTimer(session);
                        }}
                        className="w-full py-2.5 rounded-2xl text-xs font-bold text-white bg-stone-900 hover:bg-black shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Launch {session.durationMinutes}-Minute Timer</span>
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
