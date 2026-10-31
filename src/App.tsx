import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  BookOpen,
  Sparkles,
  Award,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
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
  FORMULA_CHECKLIST,
} from './data/roadmapData';
import { QUESTION_BANK } from './data/questionBankData';
import { playTickSound, playSuccessChime } from './utils/sound';

type TabType = 'sessions' | 'timer' | 'recall' | 'errors' | 'blueprint' | 'questions';

const INITIAL_ERROR_LOGS: ErrorLogItem[] = [
  {
    id: 'err-1',
    timestamp: Date.now() - 86400000,
    topic: 'Variable vs Absorption',
    problemRef: 'Q102 Fine Producers',
    errorType: 'Concept',
    whatWentWrong: 'Calculated Fixed MOH rate using units sold (40,000) instead of units produced (50,000).',
    correctRecipe: 'Fixed MOH rate = Total Fixed MOH ÷ UNITS PRODUCED, always. Unit inventory cost is never based on sales.',
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
    }, 3500);
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

  // Handler toggles
  const handleToggleSession = (sessionId: string) => {
    setCompletedSessions((prev) => {
      const nextState = !prev[sessionId];
      const updated = { ...prev, [sessionId]: nextState };
      if (nextState) {
        showToast('Block completed! Keep up the momentum.');
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
      if (next) showToast(`Problem ${questionId} marked solved!`);
      return { ...prev, [questionId]: next };
    });
  };

  const handleToggleMastered = (formulaId: string) => {
    setMasteredFormulas((prev) => {
      const next = !prev[formulaId];
      if (next) showToast('Formula mastered from memory!');
      return { ...prev, [formulaId]: next };
    });
  };

  const handleStartSessionTimer = (session: SessionBlock) => {
    setSelectedSessionForTimer(session);
    setActiveTab('timer');
    showToast(`Timer primed for: ${session.title}`);
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
    showToast('Mistake logged for Day 4 re-solve round.');
  };

  const handleToggleResolved = (id: string) => {
    setErrorLogs((prev) =>
      prev.map((item) => (item.id === id ? { ...item, resolved: !item.resolved } : item))
    );
    showToast('Status updated.');
  };

  const handleDeleteError = (id: string) => {
    setErrorLogs((prev) => prev.filter((item) => item.id !== id));
    showToast('Error entry deleted.');
  };

  const handleConfirmReset = () => {
    setCompletedSessions({});
    setWeakSessions({});
    setSolvedQuestions({});
    setMasteredFormulas({});
    setErrorLogs(INITIAL_ERROR_LOGS);
    localStorage.clear();
    showToast('All progress reset to baseline.');
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
    showToast('Progress backup file downloaded!');
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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#F8FAFF] via-[#EEF2FF] to-[#FDF2F8] text-[#0F172A]">
      {/* 2-3 big blurred pastel blobs (indigo, teal, pink) slowly floating in the background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="blob-1 absolute -top-40 -left-40 w-96 h-96 sm:w-[520px] sm:h-[520px] rounded-full bg-indigo-300/20 blur-[90px]" />
        <div className="blob-2 absolute top-1/3 -right-32 w-80 h-80 sm:w-[480px] sm:h-[480px] rounded-full bg-teal-300/18 blur-[95px]" />
        <div className="blob-3 absolute -bottom-32 left-1/4 w-96 h-96 sm:w-[500px] sm:h-[500px] rounded-full bg-pink-300/15 blur-[100px]" />
      </div>

      {/* Toast Notification Notification Pill */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
          <div className="bg-slate-900/90 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-2 border border-slate-700/50">
            <Sparkles className="w-4 h-4 text-teal-400 flex-shrink-0" />
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

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-40 rounded-3xl skeleton-shimmer" />
              <div className="h-28 rounded-3xl skeleton-shimmer" />
              <div className="h-28 rounded-3xl skeleton-shimmer" />
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

        {/* Bottom Floating Pill Navigation on Mobile (Sessions · Timer · Log · Cheat card · Blueprint) */}
        <div className="fixed bottom-3 left-1/2 transform -translate-x-1/2 z-40 md:hidden w-auto max-w-[95%]">
          <nav className="flex items-center gap-1 bg-white/90 backdrop-blur-xl border border-indigo-200/80 px-2 py-1.5 rounded-full shadow-[0_10px_35px_rgba(79,70,229,0.18)]">
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
                  className={`flex flex-col items-center justify-center px-3 py-1.5 rounded-full transition-all active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-[10px] font-bold mt-0.5">{t.label}</span>
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
