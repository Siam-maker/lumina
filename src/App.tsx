import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  Sparkles,
  Award,
  Layers,
} from 'lucide-react';
import { Header } from './components/Header';
import { SessionsView } from './components/SessionsView';
import { TimerView } from './components/TimerView';
import { FormulaRecallView } from './components/FormulaRecallView';
import { ErrorLogView } from './components/ErrorLogView';
import { BlueprintView } from './components/BlueprintView';
import { QuestionBankView } from './components/QuestionBankModal';
import { ResetModal } from './components/ResetModal';
import {
  SESSIONS_DATA,
  SessionBlock,
  ErrorLogItem,
} from './data/roadmapData';
import { playTickSound } from './utils/sound';

type TabType = 'sessions' | 'timer' | 'recall' | 'errors' | 'blueprint' | 'questions';

const INITIAL_ERROR_LOGS: ErrorLogItem[] = [
  {
    id: 'err-1',
    timestamp: Date.now() - 86400000,
    topic: 'Variable vs Absorption',
    problemRef: 'Q102 Fine Producers',
    errorType: 'Concept',
    whatWentWrong: 'Calculated Fixed MOH rate using units sold (40,000) instead of units produced (50,000).',
    correctRecipe: 'Fixed MOH rate = Total Fixed MOH ÷ UNITS PRODUCED, always. Inventory cost is never based on sales volume.',
    resolved: true,
  },
  {
    id: 'err-2',
    timestamp: Date.now() - 43200000,
    topic: 'Job-Order Costing',
    problemRef: 'Q42 High Desert Pottery',
    errorType: 'Formula',
    whatWentWrong: 'Multiplied POHR by estimated machine-hours instead of actual machine-hours worked on Job 205.',
    correctRecipe: 'POHR is calculated from ESTIMATED amounts; Applied MOH = POHR × ACTUAL base hours used on that job.',
    resolved: true,
  },
  {
    id: 'err-3',
    timestamp: Date.now() - 21600000,
    topic: 'Relevant Costs',
    problemRef: 'Q148 Pegasus Flight 482',
    errorType: 'Concept',
    whatWentWrong: 'Treated flight crew annual salaries and aircraft depreciation as avoidable savings when dropping the flight.',
    correctRecipe: 'Annual salaries continue under existing contracts, and equipment depreciation is a sunk cost. Neither is avoidable.',
    resolved: false,
  },
  {
    id: 'err-4',
    timestamp: Date.now() - 10800000,
    topic: 'Master Budget',
    problemRef: 'Q161 Hareston',
    errorType: 'Arithmetic',
    whatWentWrong: 'Summed quarterly ending inventories across Q1–Q4 to get the year-end inventory balance.',
    correctRecipe: 'Annual ending inventory is simply the ending inventory of Q4. Never sum balance sheet items across periods!',
    resolved: false,
  },
];

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('sessions');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Persistence States
  const [completedSessions, setCompletedSessions] = useState<Record<string, boolean>>({});
  const [weakSessions, setWeakSessions] = useState<Record<string, boolean>>({});
  const [solvedQuestions, setSolvedQuestions] = useState<Record<string, boolean>>({});
  const [masteredFormulas, setMasteredFormulas] = useState<Record<string, boolean>>({});
  const [errorLogs, setErrorLogs] = useState<ErrorLogItem[]>(INITIAL_ERROR_LOGS);

  // Selected session for Timer
  const [selectedSessionForTimer, setSelectedSessionForTimer] = useState<SessionBlock | null>(null);

  // Selected question for modal inspection
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  // Reset modal state
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedCompleted = localStorage.getItem('ipe105_completed_sessions');
      if (savedCompleted) setCompletedSessions(JSON.parse(savedCompleted));

      const savedWeak = localStorage.getItem('ipe105_weak_sessions');
      if (savedWeak) setWeakSessions(JSON.parse(savedWeak));

      const savedSolved = localStorage.getItem('ipe105_solved_questions');
      if (savedSolved) setSolvedQuestions(JSON.parse(savedSolved));

      const savedMastered = localStorage.getItem('ipe105_mastered_formulas');
      if (savedMastered) setMasteredFormulas(JSON.parse(savedMastered));

      const savedErrors = localStorage.getItem('ipe105_error_logs');
      if (savedErrors) setErrorLogs(JSON.parse(savedErrors));

      const savedSound = localStorage.getItem('ipe105_sound_enabled');
      if (savedSound !== null) setSoundEnabled(savedSound === 'true');
    } catch {
      // LocalStorage error fallback
    } finally {
      setTimeout(() => setIsLoading(false), 200);
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('ipe105_completed_sessions', JSON.stringify(completedSessions));
      localStorage.setItem('ipe105_weak_sessions', JSON.stringify(weakSessions));
      localStorage.setItem('ipe105_solved_questions', JSON.stringify(solvedQuestions));
      localStorage.setItem('ipe105_mastered_formulas', JSON.stringify(masteredFormulas));
      localStorage.setItem('ipe105_error_logs', JSON.stringify(errorLogs));
      localStorage.setItem('ipe105_sound_enabled', String(soundEnabled));
    }
  }, [completedSessions, weakSessions, solvedQuestions, masteredFormulas, errorLogs, soundEnabled, isLoading]);

  const handleToggleSession = (sessionId: string) => {
    setCompletedSessions((prev) => {
      const nextState = !prev[sessionId];
      const updated = { ...prev, [sessionId]: nextState };
      if (nextState) {
        showToast('Study block completed! High-yield progress.');
      }
      return updated;
    });
  };

  const handleToggleWeak = (sessionId: string) => {
    setWeakSessions((prev) => {
      const next = !prev[sessionId];
      showToast(next ? 'Flagged as weak topic for Day 4 repair.' : 'Removed weak flag.');
      return { ...prev, [sessionId]: next };
    });
  };

  const handleToggleQuestion = (questionId: string) => {
    setSolvedQuestions((prev) => {
      const next = !prev[questionId];
      if (next) showToast(`Problem ${questionId} marked solved.`);
      return { ...prev, [questionId]: next };
    });
  };

  const handleToggleMastered = (formulaId: string) => {
    setMasteredFormulas((prev) => {
      const next = !prev[formulaId];
      if (next) showToast('Formula committed to recall memory!');
      return { ...prev, [formulaId]: next };
    });
  };

  const handleStartSessionTimer = (session: SessionBlock) => {
    setSelectedSessionForTimer(session);
    setActiveTab('timer');
    showToast(`Focus timer ready for: ${session.title}`);
  };

  const handleSelectQuestion = (qId: string) => {
    setSelectedQuestionId(qId);
    setActiveTab('questions');
  };

  const handleAddError = (error: Omit<ErrorLogItem, 'id' | 'timestamp'>) => {
    const newEntry: ErrorLogItem = {
      ...error,
      id: `err-${Date.now()}`,
      timestamp: Date.now(),
    };
    setErrorLogs((prev) => [newEntry, ...prev]);
    showToast('Logged for Day 4 surgical re-solve.');
  };

  const handleToggleResolved = (id: string) => {
    setErrorLogs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, resolved: !item.resolved } : item))
    );
    showToast('Re-solve status updated.');
  };

  const handleDeleteError = (id: string) => {
    setErrorLogs((prev) => prev.filter((item) => item.id !== id));
    showToast('Error record removed.');
  };

  const handleConfirmReset = () => {
    setCompletedSessions({});
    setWeakSessions({});
    setSolvedQuestions({});
    setMasteredFormulas({});
    setErrorLogs(INITIAL_ERROR_LOGS);
    localStorage.clear();
    showToast('All progress reset to fresh baseline.');
  };

  // Export JSON Backup
  const handleExportData = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      completedSessions,
      weakSessions,
      solvedQuestions,
      masteredFormulas,
      errorLogs,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IPE105-RescuePlan-Backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup JSON exported successfully!');
  };

  // Import JSON Backup
  const handleImportData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.completedSessions) setCompletedSessions(parsed.completedSessions);
          if (parsed.weakSessions) setWeakSessions(parsed.weakSessions);
          if (parsed.solvedQuestions) setSolvedQuestions(parsed.solvedQuestions);
          if (parsed.masteredFormulas) setMasteredFormulas(parsed.masteredFormulas);
          if (parsed.errorLogs) setErrorLogs(parsed.errorLogs);
          showToast('Progress successfully restored from backup!');
        } catch {
          showToast('Error: Invalid JSON file format.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const totalSessionsCount = SESSIONS_DATA.length;
  const completedSessionsCount = SESSIONS_DATA.filter((s) => !!completedSessions[s.id]).length;

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#FAF9F5] via-[#F4F3ED] to-[#ECEAE2] text-[#1C1917]">
      {/* Warm off-white floating ambient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="warm-blob-1 absolute -top-40 -left-40 w-96 h-96 sm:w-[560px] sm:h-[560px] rounded-full bg-amber-200/22 blur-[100px]" />
        <div className="warm-blob-2 absolute top-1/3 -right-32 w-80 h-80 sm:w-[500px] sm:h-[500px] rounded-full bg-teal-200/18 blur-[105px]" />
        <div className="warm-blob-3 absolute -bottom-32 left-1/3 w-96 h-96 sm:w-[520px] sm:h-[520px] rounded-full bg-rose-200/16 blur-[110px]" />
      </div>

      {/* Toast Notification Pill */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="bg-stone-900/95 text-stone-100 text-xs font-semibold px-4.5 py-2.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2.5 border border-stone-700/60">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          activeTab={activeTab}
          onTabChange={setActiveTab}
          completedSessionsCount={completedSessionsCount}
          totalSessionsCount={totalSessionsCount}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          onOpenResetModal={() => setIsResetModalOpen(true)}
          onExportData={handleExportData}
          onImportData={handleImportData}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {isLoading ? (
            <div className="space-y-5">
              <div className="h-44 rounded-3xl skeleton-shimmer" />
              <div className="h-32 rounded-3xl skeleton-shimmer" />
              <div className="h-32 rounded-3xl skeleton-shimmer" />
            </div>
          ) : (
            <>
              {activeTab === 'sessions' && (
                <SessionsView
                  completedSessions={completedSessions}
                  weakSessions={weakSessions}
                  solvedQuestions={solvedQuestions}
                  onToggleSession={handleToggleSession}
                  onToggleWeak={handleToggleWeak}
                  onToggleQuestion={handleToggleQuestion}
                  onSelectQuestion={handleSelectQuestion}
                  onStartSessionTimer={handleStartSessionTimer}
                  soundEnabled={soundEnabled}
                />
              )}

              {activeTab === 'timer' && (
                <TimerView
                  selectedSession={selectedSessionForTimer}
                  onSessionComplete={(id) => {
                    handleToggleSession(id);
                    setSelectedSessionForTimer(null);
                  }}
                  soundEnabled={soundEnabled}
                  onToggleSound={() => setSoundEnabled(!soundEnabled)}
                />
              )}

              {activeTab === 'recall' && (
                <FormulaRecallView
                  masteredFormulas={masteredFormulas}
                  onToggleMastered={handleToggleMastered}
                  soundEnabled={soundEnabled}
                />
              )}

              {activeTab === 'errors' && (
                <ErrorLogView
                  errorLogs={errorLogs}
                  onAddError={handleAddError}
                  onToggleResolved={handleToggleResolved}
                  onDeleteError={handleDeleteError}
                  soundEnabled={soundEnabled}
                />
              )}

              {activeTab === 'blueprint' && (
                <BlueprintView soundEnabled={soundEnabled} />
              )}

              {activeTab === 'questions' && (
                <QuestionBankView
                  solvedQuestions={solvedQuestions}
                  onToggleQuestion={handleToggleQuestion}
                  selectedQuestionId={selectedQuestionId}
                  onCloseModal={() => setSelectedQuestionId(null)}
                  soundEnabled={soundEnabled}
                />
              )}
            </>
          )}
        </main>

        {/* Bottom Floating Pill Navigation on Mobile */}
        <div className="fixed bottom-3.5 left-1/2 transform -translate-x-1/2 z-40 md:hidden w-auto max-w-[95%]">
          <nav className="flex items-center gap-1 bg-[#FAF9F5]/95 backdrop-blur-xl border border-stone-300/80 px-2.5 py-1.5 rounded-full shadow-[0_12px_35px_rgba(28,25,23,0.12)]">
            {[
              { id: 'sessions', label: 'Plan', icon: Calendar },
              { id: 'timer', label: 'Timer', icon: Clock },
              { id: 'recall', label: 'Recall', icon: BookOpen },
              { id: 'errors', label: 'Errors', icon: Sparkles },
              { id: 'blueprint', label: 'Exam', icon: Award },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    playTickSound(soundEnabled);
                    setActiveTab(t.id as TabType);
                  }}
                  className={`flex flex-col items-center justify-center px-3.5 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-white shadow-xs font-bold'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] mt-0.5">{t.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <ResetModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirmReset={handleConfirmReset}
      />
    </div>
  );
}
