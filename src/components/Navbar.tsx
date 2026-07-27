import React from 'react';
import { User } from '../types';
import { BookOpen, LogOut, Sparkles, User as UserIcon, Moon, Sun } from 'lucide-react';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onHome: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onHome, theme, onToggleTheme }) => {
  return (
    <header className="sticky top-0 z-30 glass-panel border-b transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          onClick={onHome}
          className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-lg group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ink-800 to-ink-950 dark:from-ink-700 dark:to-ink-900 text-gold-300 flex items-center justify-center glow-gold group-hover:scale-105 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-semibold text-lg text-ink-900 dark:text-white tracking-tight">StudyMate AI</span>
              <span className="bg-violet-500/10 text-violet-600 dark:text-violet-300 text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-violet-500/20">
                <Sparkles className="w-3 h-3" /> Smart
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">AI-Powered Learning Assistant</p>
          </div>
        </button>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-paper-300 dark:border-white/10 text-slate-500 dark:text-slate-300 hover:text-gold-500 dark:hover:text-gold-300 hover:border-gold-400/50 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-paper-100/70 dark:bg-white/5 border border-paper-300 dark:border-white/10 rounded-full">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-ink-950 flex items-center justify-center font-bold text-xs">
              {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{user.name}</span>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-500/20"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
