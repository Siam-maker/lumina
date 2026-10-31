import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  Sparkles,
  ChevronDown,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Flame,
} from 'lucide-react';
import { SESSIONS_DATA } from '../data/roadmapData';

interface ScorePredictorWidgetProps {
  completedSessions: Record<string, boolean>;
  solvedQuestions: Record<string, boolean>;
  onSelectTopicFilter?: (topicName: string) => void;
}

interface TopicWeight {
  id: string;
  name: string;
  tier: 'A' | 'B' | 'C';
  avgMarks: number;
  sessionIds: string[];
}

const TOPIC_WEIGHTS: TopicWeight[] = [
  { id: 'rel', name: 'Relevant Costs', tier: 'A', avgMarks: 45, sessionIds: ['s2-b1', 's2-b2'] },
  { id: 'rat', name: 'Fin. Ratios & ROI', tier: 'A', avgMarks: 44, sessionIds: ['s3-b1', 's3-b2'] },
  { id: 'cvp', name: 'CVP Analysis', tier: 'A', avgMarks: 29, sessionIds: ['s1-b1', 's1-b2'] },
  { id: 'var', name: 'Var vs Absorption', tier: 'A', avgMarks: 22, sessionIds: ['s1-b3', 's1-b4'] },
  { id: 'job', name: 'Job-Order Costing', tier: 'A', avgMarks: 21, sessionIds: ['s0-b2', 's0-b3'] },
  { id: 'mb', name: 'Master Budget', tier: 'A', avgMarks: 20, sessionIds: ['s2-b3', 's2-b4'] },
  { id: 'abc', name: 'ABC Costing', tier: 'A', avgMarks: 20, sessionIds: ['s2-b5'] },
  { id: 'proc', name: 'Process Costing (WA)', tier: 'A', avgMarks: 15, sessionIds: ['s1-b5', 's1-b6'] },
  { id: 'flex', name: 'Flexible Budgets', tier: 'B', avgMarks: 17, sessionIds: ['s3-b4'] },
  { id: 'std', name: 'Standard Variances', tier: 'B', avgMarks: 13, sessionIds: ['s3-b3'] },
  { id: 'hl', name: 'Cost Behavior / High-Low', tier: 'B', avgMarks: 10, sessionIds: ['s0-b4'] },
  { id: 'cap', name: 'Capital Budgeting', tier: 'B', avgMarks: 10, sessionIds: ['s3-b5'] },
  { id: 'cogm', name: 'Cost Concepts & COGM', tier: 'B', avgMarks: 9, sessionIds: ['s0-b1'] },
  { id: 'fifo', name: 'Process Costing FIFO', tier: 'B', avgMarks: 5, sessionIds: ['s3-b6'] },
  { id: 'mce', name: 'Foundations & MCE', tier: 'C', avgMarks: 5, sessionIds: ['s3-theory'] },
];

export const ScorePredictorWidget: React.FC<ScorePredictorWidgetProps> = ({
  completedSessions,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate projected readiness score
  let totalCalculatedMarks = 0;
  const maxPossibleMarks = 210;
  const aPlusTarget = 168; // 80%

  TOPIC_WEIGHTS.forEach((topic) => {
    const totalSessions = topic.sessionIds.length;
    const completedCount = topic.sessionIds.filter((id) => !!completedSessions[id]).length;
    const completionRatio = totalSessions > 0 ? completedCount / totalSessions : 0;
    totalCalculatedMarks += topic.avgMarks * completionRatio;
  });

  const projectedScore = Math.min(210, Math.round(totalCalculatedMarks * 0.9 + 25)); // Base starting floor of ~25 marks
  const isSafeZone = projectedScore >= aPlusTarget;

  return (
    <div className="bg-gradient-to-br from-[#FCFBF8] to-[#F5F4EE] rounded-3xl border border-stone-200/90 shadow-[0_12px_36px_-6px_rgba(28,25,23,0.06),0_1px_3px_rgba(28,25,23,0.02)] p-6 sm:p-7 space-y-5 transition-all">
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-stone-900 text-stone-100 shadow-2xs">
              AI Exam Readiness & Score Predictor
            </span>
            <span className="text-xs font-bold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80">
              BUET 80%+ (CGPA 4.00)
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>Projected Exam Mark:</span>
            <span className="font-mono text-2xl sm:text-3xl text-amber-700 tabular-nums">
              {projectedScore}
            </span>
            <span className="text-stone-400 font-medium text-lg">/ 210</span>
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
            {isSafeZone ? (
              <span className="text-teal-800 font-bold flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-teal-600 inline" />
                <span>You have crossed the 168+ threshold! Keep reviewing past papers and error logs to lock in your A+.</span>
              </span>
            ) : (
              <span>
                Need <strong className="text-stone-900 font-bold font-mono">{Math.max(0, aPlusTarget - projectedScore)}</strong> more marks to enter the Safe A+ Zone (168+). Master the 8 Tier-A topics to secure this effortlessly!
              </span>
            )}
          </p>
        </div>

        {/* Visual Luxury Gauge Card */}
        <div className="flex items-center gap-4 bg-white/90 p-4 rounded-2xl border border-stone-200/90 shadow-xs min-w-[260px]">
          <div className="w-14 h-14 rounded-2xl bg-[#FAF9F5] border border-stone-200 flex flex-col items-center justify-center flex-shrink-0 shadow-2xs">
            <Flame className={`w-6 h-6 ${isSafeZone ? 'text-teal-600' : 'text-amber-600'}`} />
            <span className="text-[10px] font-black text-stone-700 tabular-nums mt-0.5">
              {Math.round((projectedScore / 210) * 100)}%
            </span>
          </div>

          <div className="flex-1 space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-stone-500">A+ Goal: 168</span>
              <span className={`font-mono ${isSafeZone ? 'text-teal-700' : 'text-amber-700'}`}>
                {isSafeZone ? 'SAFE ZONE' : 'BUILDING'}
              </span>
            </div>
            {/* Multi-segment progress bar */}
            <div className="relative w-full bg-stone-200 h-3 rounded-full overflow-hidden shadow-inner">
              {/* 80% A+ Target line marker */}
              <div className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-stone-800 z-10" title="168 Marks Target" />
              <div
                className={`h-full transition-all duration-700 rounded-full ${
                  isSafeZone
                    ? 'bg-gradient-to-r from-teal-500 to-emerald-600'
                    : 'bg-gradient-to-r from-stone-800 via-amber-600 to-amber-500'
                }`}
                style={{ width: `${Math.min(100, (projectedScore / 210) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-stone-400 font-semibold">
              <span>0</span>
              <span>105 (Pass)</span>
              <span className="font-bold text-stone-700">168 (A+)</span>
              <span>210</span>
            </div>
          </div>
        </div>
      </div>

      {/* Expand / Collapse 15 Topics Readiness Grid Button */}
      <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-bold text-stone-700 hover:text-stone-950 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Topic Readiness Matrix' : 'Show 15-Topic Exam Readiness Matrix'}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isExpanded ? 'transform rotate-180 text-amber-700' : ''
            }`}
          />
        </button>

        <span className="text-xs font-medium text-stone-500">
          8 Tier-A topics carry <strong className="text-stone-900 font-bold">120+ marks</strong> in every paper
        </span>
      </div>

      {/* Topic Readiness Grid */}
      {isExpanded && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {TOPIC_WEIGHTS.map((t) => {
            const completedCount = t.sessionIds.filter((id) => !!completedSessions[id]).length;
            const isFullyMastered = completedCount === t.sessionIds.length;
            const isPartial = completedCount > 0 && !isFullyMastered;

            return (
              <div
                key={t.id}
                className={`p-3 rounded-2xl border transition-all text-left space-y-1.5 ${
                  isFullyMastered
                    ? 'bg-teal-50/40 border-teal-200 shadow-2xs'
                    : isPartial
                    ? 'bg-amber-50/40 border-amber-200'
                    : 'bg-white/80 border-stone-200/90'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                      t.tier === 'A'
                        ? 'bg-stone-900 text-white'
                        : t.tier === 'B'
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    Tier {t.tier}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-stone-500">
                    ~{t.avgMarks}m
                  </span>
                </div>

                <div className="font-bold text-xs text-stone-900 truncate" title={t.name}>
                  {t.name}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-stone-500 font-medium">
                    {completedCount}/{t.sessionIds.length} blocks
                  </span>
                  {isFullyMastered ? (
                    <span className="text-teal-700 font-bold text-[10px]">Mastered ✓</span>
                  ) : isPartial ? (
                    <span className="text-amber-700 font-bold text-[10px]">In Progress</span>
                  ) : (
                    <span className="text-stone-400 text-[10px]">Pending</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
