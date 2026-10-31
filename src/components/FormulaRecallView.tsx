import React, { useState } from 'react';
import {
  Check,
  Search,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle,
  BookOpen,
  Filter,
} from 'lucide-react';
import { FORMULA_CHECKLIST, FormulaChecklistItem } from '../data/roadmapData';
import { playSuccessChime, playTickSound } from '../utils/sound';
import { launchConfetti } from '../utils/confetti';

interface FormulaRecallViewProps {
  masteredFormulas: Record<string, boolean>;
  onToggleMastered: (formulaId: string) => void;
  soundEnabled: boolean;
}

export const FormulaRecallView: React.FC<FormulaRecallViewProps> = ({
  masteredFormulas,
  onToggleMastered,
  soundEnabled,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [blankPageMode, setBlankPageMode] = useState<boolean>(false);
  const [revealedItems, setRevealedItems] = useState<Record<string, boolean>>({});

  // Categories list
  const categories = Array.from(new Set(FORMULA_CHECKLIST.map((f) => f.category)));

  const filteredFormulas = FORMULA_CHECKLIST.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const totalCount = FORMULA_CHECKLIST.length;
  const masteredCount = Object.values(masteredFormulas).filter(Boolean).length;
  const masteredPercent = Math.round((masteredCount / totalCount) * 100);

  const toggleReveal = (id: string) => {
    playTickSound(soundEnabled);
    setRevealedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleMasteredCheck = (item: FormulaChecklistItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const wasMastered = !!masteredFormulas[item.id];
    onToggleMastered(item.id);

    if (!wasMastered) {
      playSuccessChime(soundEnabled);
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      launchConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);
    } else {
      playTickSound(soundEnabled);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Banner Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-indigo-100 p-6 shadow-[0_8px_30px_rgba(79,70,229,0.06)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Part 5 · Master Checklist
              </span>
              <span className="text-xs font-semibold text-slate-500">
                12 Topic Groups
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
              Formula & Concept Blank-Page Recall
            </h2>
            <p className="text-xs text-slate-600 max-w-xl">
              Nov 4 strategy: cover this sheet and write every formula from pure memory onto a blank page. What you cannot write is your real weak spot!
            </p>
          </div>

          {/* Mastered Progress Bar */}
          <div className="flex items-center gap-3 bg-slate-50/80 border border-slate-200/60 p-3.5 rounded-2xl min-w-[220px]">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="font-semibold text-slate-600">Formulas Mastered</span>
                <span className="font-bold tabular-nums text-teal-600">{masteredPercent}%</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-500 to-indigo-500 transition-all duration-500 rounded-full"
                  style={{ width: `${masteredPercent}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold text-slate-700 tabular-nums">
                {masteredCount}/{totalCount}
              </span>
              <div className="text-[10px] text-slate-400">mastered</div>
            </div>
          </div>
        </div>

        {/* Controls: Recall Mode Toggle & Search */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Blank Page Mode Toggle Button */}
          <button
            onClick={() => {
              playTickSound(soundEnabled);
              setBlankPageMode(!blankPageMode);
              setRevealedItems({});
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${
              blankPageMode
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-200 ring-2 ring-indigo-300/50'
                : 'bg-white hover:bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs'
            }`}
          >
            {blankPageMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>
              {blankPageMode ? 'Blank-Page Recall Mode ON (Hidden)' : 'Enable Blank-Page Recall Mode'}
            </span>
          </button>

          {/* Search box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search formula, concept, or ratio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-400 rounded-2xl text-xs text-slate-800 placeholder-slate-400 outline-none transition-all shadow-2xs"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 scrollbar-none">
          <button
            onClick={() => {
              playTickSound(soundEnabled);
              setSelectedCategory('all');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-semibold flex-shrink-0 transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({FORMULA_CHECKLIST.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playTickSound(soundEnabled);
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex-shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-bold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Formula Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFormulas.map((item) => {
          const isMastered = !!masteredFormulas[item.id];
          const isRevealed = !blankPageMode || !!revealedItems[item.id];

          return (
            <div
              key={item.id}
              className={`relative bg-white/75 backdrop-blur-md rounded-2xl md:rounded-3xl border p-5 transition-all duration-300 flex flex-col justify-between gap-3 ${
                isMastered
                  ? 'border-teal-200/90 bg-teal-50/20 shadow-[0_4px_20px_rgba(20,184,166,0.06)]'
                  : item.isKeyTrap
                  ? 'border-amber-200/80 bg-amber-50/20 shadow-[0_8px_30px_rgba(245,158,11,0.06)]'
                  : 'border-indigo-500/12 shadow-[0_8px_30px_rgba(79,70,229,0.06)] hover:border-indigo-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {item.category}
                    </span>
                    {item.isKeyTrap && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
                        <span>High-Risk Trap</span>
                      </span>
                    )}
                  </div>

                  {/* Mastered Checkbox Button */}
                  <button
                    type="button"
                    onClick={(e) => handleMasteredCheck(item, e)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                      isMastered
                        ? 'bg-teal-500 text-white shadow-sm shadow-teal-200 ring-2 ring-teal-300/50'
                        : 'bg-white border-2 border-slate-300 hover:border-indigo-400'
                    }`}
                    title={isMastered ? 'Mark unmastered' : 'Mark as mastered'}
                  >
                    {isMastered && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-800 leading-snug">
                  {item.title}
                </h3>

                {/* Formula Body / Blank-Page Reveal */}
                <div className="mt-3">
                  {isRevealed ? (
                    <div className="space-y-2">
                      <div className="font-mono text-xs font-semibold text-indigo-950 bg-indigo-50/80 p-3 rounded-xl border border-indigo-100/80 break-words leading-relaxed">
                        {item.formula}
                      </div>
                      {item.exampleOrNote && (
                        <p className="text-[11px] text-slate-500 leading-relaxed italic">
                          💡 {item.exampleOrNote}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => toggleReveal(item.id)}
                      className="bg-slate-100/90 hover:bg-slate-200/90 border border-dashed border-slate-300 rounded-xl p-4 text-center cursor-pointer transition-all duration-200"
                    >
                      <span className="text-xs font-bold text-slate-600 block">
                        🔒 Hidden for Blank-Page Recall
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Write formula on paper, then tap here to check!
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reveal toggle button if blank page mode is active */}
              {blankPageMode && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => toggleReveal(item.id)}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                  >
                    {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{isRevealed ? 'Hide again' : 'Reveal answer'}</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
