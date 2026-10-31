import React, { useState } from 'react';
import {
  Check,
  Search,
  Eye,
  EyeOff,
  AlertTriangle,
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
    <div className="space-y-8 pb-24">
      {/* Banner Card */}
      <div className="bg-white/90 backdrop-blur-md rounded-3xl border border-stone-200/90 p-6 sm:p-7 shadow-[0_10px_35px_-5px_rgba(28,25,23,0.04)] space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-stone-900 text-white shadow-2xs">
                Part 5 · Master Checklist
              </span>
              <span className="text-xs font-semibold text-stone-600 bg-[#F4F3ED] px-3 py-1 rounded-full border border-stone-200">
                12 Topic Groups
              </span>
            </div>
            <h2 className="text-2xl font-black text-stone-900 tracking-tight">
              Formula & Concept Blank-Page Recall
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 max-w-2xl leading-relaxed">
              Nov 4 strategy: cover this sheet and write every formula from pure memory onto a blank page. What you cannot write is your real weak spot!
            </p>
          </div>

          {/* Mastered Progress Bar */}
          <div className="flex items-center gap-4 bg-[#F8F7F3] border border-stone-200/90 p-4 rounded-2xl min-w-[240px] shadow-2xs">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-bold text-stone-600">Formulas Mastered</span>
                <span className="font-extrabold tabular-nums text-teal-700">{masteredPercent}%</span>
              </div>
              <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-teal-600 to-stone-800 transition-all duration-500 rounded-full"
                  style={{ width: `${masteredPercent}%` }}
                />
              </div>
            </div>
            <div className="text-right pl-2 border-l border-stone-200">
              <span className="text-sm font-extrabold text-stone-900 tabular-nums">
                {masteredCount}/{totalCount}
              </span>
              <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">mastered</div>
            </div>
          </div>
        </div>

        {/* Controls: Recall Mode Toggle & Search */}
        <div className="pt-4 border-t border-stone-200/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <button
            onClick={() => {
              playTickSound(soundEnabled);
              setBlankPageMode(!blankPageMode);
              setRevealedItems({});
            }}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all active:scale-95 cursor-pointer ${
              blankPageMode
                ? 'bg-stone-900 text-white shadow-md'
                : 'bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 shadow-2xs'
            }`}
          >
            {blankPageMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>
              {blankPageMode ? 'Blank-Page Recall Mode: ACTIVE (Formulas Hidden)' : 'Enable Blank-Page Recall Mode'}
            </span>
          </button>

          {/* Search box */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search formula, concept, or ratio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#F9F8F4] hover:bg-white focus:bg-white border border-stone-200 focus:border-stone-400 rounded-2xl text-xs text-stone-900 placeholder-stone-400 outline-none transition-all shadow-2xs font-medium"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 scrollbar-none">
          <button
            onClick={() => {
              playTickSound(soundEnabled);
              setSelectedCategory('all');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-stone-900 text-white shadow-2xs'
                : 'bg-[#F2EFE9] text-stone-600 hover:bg-[#EAE6DE]'
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-stone-900 text-white shadow-2xs'
                  : 'bg-[#F2EFE9] text-stone-600 hover:bg-[#EAE6DE]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Formula Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredFormulas.map((item) => {
          const isMastered = !!masteredFormulas[item.id];
          const isRevealed = !blankPageMode || !!revealedItems[item.id];

          return (
            <div
              key={item.id}
              className={`relative bg-white/90 backdrop-blur-md rounded-3xl border p-6 transition-all duration-300 flex flex-col justify-between gap-4 ${
                isMastered
                  ? 'border-teal-300/80 bg-teal-50/15 shadow-[0_4px_24px_-4px_rgba(13,148,136,0.06)]'
                  : item.isKeyTrap
                  ? 'border-amber-300/80 bg-amber-50/15 shadow-[0_6px_25px_-5px_rgba(217,119,6,0.06)]'
                  : 'border-stone-200/90 shadow-[0_6px_25px_-5px_rgba(28,25,23,0.04)] hover:border-stone-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-[#EFECE6] text-stone-800 border border-stone-200">
                      {item.category}
                    </span>
                    {item.isKeyTrap && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>High-Risk Trap</span>
                      </span>
                    )}
                  </div>

                  {/* Mastered Checkbox Button */}
                  <button
                    type="button"
                    onClick={(e) => handleMasteredCheck(item, e)}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all cursor-pointer ${
                      isMastered
                        ? 'bg-teal-600 text-white shadow-2xs'
                        : 'bg-white border-2 border-stone-300 hover:border-stone-500'
                    }`}
                    title={isMastered ? 'Mark unmastered' : 'Mark as mastered'}
                  >
                    {isMastered && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>
                </div>

                <h3 className="text-base font-bold text-stone-900 leading-snug">
                  {item.title}
                </h3>

                {/* Formula Body / Blank-Page Reveal */}
                <div className="pt-1">
                  {isRevealed ? (
                    <div className="space-y-2.5">
                      <div className="font-mono text-xs font-semibold text-stone-900 bg-[#F9F8F4] p-3.5 rounded-2xl border border-stone-200/90 break-words leading-relaxed">
                        {item.formula}
                      </div>
                      {item.exampleOrNote && (
                        <p className="text-xs text-stone-500 leading-relaxed italic pt-0.5">
                          💡 {item.exampleOrNote}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => toggleReveal(item.id)}
                      className="bg-[#F6F5EF] hover:bg-[#EDEBE3] border border-dashed border-stone-300 rounded-2xl p-5 text-center cursor-pointer transition-all duration-200 space-y-1"
                    >
                      <span className="text-xs font-bold text-stone-700 block">
                        🔒 Hidden for Blank-Page Recall
                      </span>
                      <span className="text-[11px] text-stone-500 block leading-relaxed">
                        Write the formula on your paper, then click to reveal & compare!
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {blankPageMode && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => toggleReveal(item.id)}
                    className="text-xs font-bold text-stone-700 hover:text-stone-950 flex items-center gap-1.5 cursor-pointer"
                  >
                    {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
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
