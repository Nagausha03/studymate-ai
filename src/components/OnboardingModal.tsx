import React, { useState } from 'react';
import { Upload, Sparkles, BrainCircuit, X, ArrowRight, CheckCircle2 } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose, userName }) => {
  const [step, setStep] = useState(0);

  if (!isOpen) return null;

  const steps = [
    {
      title: "Welcome to StudyMate AI!",
      description: `Hi ${userName}! Your intelligent learning workspace is ready. Let's take a quick 3-step tour to help you master your subjects faster.`,
      icon: Sparkles,
      color: "bg-indigo-600 text-white"
    },
    {
      title: "1. Upload & Organize Notes",
      description: "Upload lecture notes, paste summaries, or attach study guides. Easily pin your most important notes to the top of your dashboard for quick access.",
      icon: Upload,
      color: "bg-blue-600 text-white"
    },
    {
      title: "2. Ask AI Tutor & Summarize",
      description: "Every note instantly generates comprehensive AI summaries. Use the interactive Ask AI Tutor tab to ask questions and clarify complex concepts instantly.",
      icon: BrainCircuit,
      color: "bg-purple-600 text-white"
    },
    {
      title: "3. Practice Quizzes & Flashcards",
      description: "Test your knowledge with auto-generated practice quizzes and active recall flashcards designed to lock information into long-term memory.",
      icon: CheckCircle2,
      color: "bg-emerald-600 text-white"
    }
  ];

  const current = steps[step];
  const Icon = current.icon;

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-w-lg w-full overflow-hidden relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 text-center">
          <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg ${current.color}`}>
            <Icon className="w-8 h-8" />
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-3">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === step ? 'w-8 bg-indigo-600' : 'w-2 bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3">
            {current.title}
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed mb-8">
            {current.description}
          </p>

          <div className="flex items-center justify-between gap-4">
            {step > 0 ? (
              <button
                onClick={() => setStep(step - 1)}
                className="px-5 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold rounded-2xl transition-colors text-sm"
              >
                Back
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium text-sm transition-colors"
              >
                Skip Tour
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center gap-2 text-sm ml-auto"
            >
              <span>{step === steps.length - 1 ? "Start Learning" : "Next"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
