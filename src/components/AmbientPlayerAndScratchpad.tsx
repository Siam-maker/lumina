import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Volume2,
  VolumeX,
  Edit3,
  X,
  Save,
  Check,
  Sparkles,
  CloudRain,
  Waves,
  Zap,
} from 'lucide-react';
import {
  playAmbientSound,
  stopAmbientSound,
  setAmbientVolume,
  getAmbientStatus,
} from '../utils/ambientSound';
import { playTickSound, playSuccessChime } from '../utils/sound';

interface AmbientPlayerAndScratchpadProps {
  soundEnabled: boolean;
}

export const AmbientPlayerAndScratchpad: React.FC<AmbientPlayerAndScratchpadProps> = ({
  soundEnabled,
}) => {
  const [ambientPreset, setAmbientPreset] = useState<'none' | 'rain' | 'binaural' | 'waves'>('none');
  const [ambientVol, setAmbientVol] = useState(0.25);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);
  const [scratchpadText, setScratchpadText] = useState('');
  const [savedBadge, setSavedBadge] = useState(false);

  // Load scratchpad from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ipe105_scratchpad');
      if (saved) {
        setScratchpadText(saved);
      } else {
        setScratchpadText(
`# BUET IPE 105 Quick Scratchpad
- Scientific Calculator STAT Mode: MODE -> STAT (3) -> A+BX (2) -> Enter (X, Y) -> AC -> SHIFT 1 (STAT) -> Reg (5) -> a(1), b(2)
- POHR: Estimated Base in Denominator! (Never actual base).
- Constraint Ranking: Always rank by CM / scarce hour (never just unit CM).
- Target Profit: (Fixed + Target Profit) ÷ CM/unit. If after-tax: Target ÷ (1 - tax).
`
        );
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleSaveScratchpad = () => {
    try {
      localStorage.setItem('ipe105_scratchpad', scratchpadText);
      playSuccessChime(soundEnabled);
      setSavedBadge(true);
      setTimeout(() => setSavedBadge(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handlePresetSelect = (preset: 'rain' | 'binaural' | 'waves') => {
    playTickSound(soundEnabled);
    if (ambientPreset === preset) {
      stopAmbientSound();
      setAmbientPreset('none');
    } else {
      playAmbientSound(preset, ambientVol);
      setAmbientPreset(preset);
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAmbientVol(vol);
    setAmbientVolume(vol);
  };

  return (
    <>
      {/* Floating Widget Bar in Bottom Right */}
      <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2">
        {/* Ambient Sound Controller */}
        <div className="relative group">
          <div className="bg-[#FAF9F5]/95 backdrop-blur-xl border border-stone-200/90 rounded-2xl p-2 shadow-lg flex items-center gap-2">
            <button
              onClick={() => {
                if (ambientPreset !== 'none') {
                  stopAmbientSound();
                  setAmbientPreset('none');
                } else {
                  handlePresetSelect('rain');
                }
              }}
              title="Toggle Lo-Fi Study Soundscape"
              className={`p-2.5 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 ${
                ambientPreset !== 'none'
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs font-bold'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 shadow-2xs'
              }`}
            >
              <Headphones className="w-4 h-4" />
              <span className="text-xs hidden sm:inline">
                {ambientPreset === 'none' ? 'Focus Audio' : ambientPreset.toUpperCase()}
              </span>
            </button>

            {ambientPreset !== 'none' && (
              <div className="flex items-center gap-1.5 pl-1 pr-2">
                <button
                  onClick={() => handlePresetSelect('rain')}
                  title="Raindrops Soundscape"
                  className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                    ambientPreset === 'rain' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <CloudRain className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handlePresetSelect('binaural')}
                  title="432Hz Alpha Focus Waves"
                  className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                    ambientPreset === 'binaural' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handlePresetSelect('waves')}
                  title="Ocean Wave Swells"
                  className={`p-1.5 rounded-lg text-xs cursor-pointer ${
                    ambientPreset === 'waves' ? 'bg-stone-900 text-white' : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <Waves className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min="0.05"
                  max="0.5"
                  step="0.05"
                  value={ambientVol}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 h-1.5 bg-stone-200 accent-stone-900 rounded-lg cursor-pointer ml-1"
                  title="Volume"
                />
              </div>
            )}
          </div>
        </div>

        {/* Floating Quick Scratchpad Button */}
        <button
          onClick={() => {
            playTickSound(soundEnabled);
            setIsScratchpadOpen(true);
          }}
          title="Open Quick Scratchpad / Exam Notes"
          className="bg-stone-900 hover:bg-black text-white p-3.5 rounded-2xl shadow-xl border border-stone-700 transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <Edit3 className="w-4 h-4" />
          <span className="text-xs font-bold hidden md:inline">Scratchpad</span>
        </button>
      </div>

      {/* Slide-out Scratchpad Modal / Panel */}
      {isScratchpadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-0 sm:p-4 bg-stone-950/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-[#FCFBF8] h-full sm:h-auto sm:max-h-[92vh] w-full max-w-lg rounded-none sm:rounded-3xl border border-stone-200 p-6 sm:p-7 shadow-2xl flex flex-col justify-between gap-4 animate-in slide-in-from-right-6 duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-amber-700" />
                <h3 className="text-base font-extrabold text-stone-900 tracking-tight">
                  Student Scratchpad & Cheat Notes
                </h3>
              </div>
              <button
                onClick={() => setIsScratchpadOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-h-[300px]">
              <textarea
                value={scratchpadText}
                onChange={(e) => setScratchpadText(e.target.value)}
                placeholder="Write quick formulas, STAT calculator mode notes, reminders..."
                className="w-full h-full min-h-[320px] p-4 bg-white border border-stone-200 rounded-2xl text-xs font-mono text-stone-900 leading-relaxed outline-none focus:border-stone-400 shadow-inner resize-none"
              />
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-[11px] text-stone-400 font-medium">
                Saves automatically to browser memory.
              </span>
              <div className="flex items-center gap-2">
                {savedBadge && (
                  <span className="text-xs font-bold text-teal-700 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Saved!
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSaveScratchpad}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-stone-900 hover:bg-black transition-all active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Notes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
