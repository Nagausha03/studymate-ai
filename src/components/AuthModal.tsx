import React, { useState } from 'react';
import { User } from '../types';
import { BookOpen, Sparkles, Lock, Mail, User as UserIcon, ArrowRight, Moon, Sun } from 'lucide-react';

interface AuthModalProps {
  onLoginSuccess: (user: User) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onLoginSuccess, theme, onToggleTheme }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email, password } : { name, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('student@studymate.ai');
    setPassword('demopass123');
    setName('Alex Student');
    setLoading(true);
    setError('');

    try {
      let res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'student@studymate.ai', password: 'demopass123' })
      });
      let data = await res.json();

      if (!res.ok) {
        res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: 'Alex Student', email: 'student@studymate.ai', password: 'demopass123' })
        });
        data = await res.json();
      }

      if (data.user) {
        onLoginSuccess(data.user);
      } else {
        throw new Error('Demo login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-violet-500 via-violet-500 to-violet-400 dark:from-ink-950 dark:via-ink-900 dark:to-ink-800 transition-colors duration-300">
      <div className="w-full max-w-6xl bg-white dark:bg-ink-900 rounded-[2rem] shadow-2xl shadow-violet-900/30 overflow-hidden">

        {/* Top bar */}
        <div className="flex items-center justify-between px-8 sm:px-10 py-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-500 text-white flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="font-display font-extrabold text-lg text-ink-900 dark:text-white tracking-tight">StudyMate AI</span>
          </div>
          <button
            onClick={onToggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-paper-300 dark:border-white/10 text-slate-500 dark:text-slate-300 hover:text-violet-500 hover:border-violet-400/50 transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 sm:px-10 pb-10 items-center">
          {/* Left: form panel */}
          <div className="bg-paper-100 dark:bg-white/[0.04] rounded-3xl p-6 sm:p-10">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-violet-500">Welcome back</span>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-ink-900 dark:text-white tracking-tight mt-2">
              {isLogin ? 'Sign in to study' : 'Create your account'}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 mb-6">
              Transform your notes into active learning resources.
            </p>

            <div className="flex bg-white dark:bg-white/5 p-1 rounded-xl mb-6 border border-paper-300 dark:border-white/10 w-fit">
              <button
                onClick={() => { setIsLogin(true); setError(''); }}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                  isLogin ? 'bg-violet-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsLogin(false); setError(''); }}
                className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                  !isLogin ? 'bg-violet-500 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-300 text-sm rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-ink-900 dark:text-white mb-1.5">
                    <UserIcon className="w-4 h-4 text-violet-500" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Student"
                    className="w-full pb-2.5 bg-transparent border-0 border-b-2 border-paper-300 dark:border-white/15 text-ink-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-ink-900 dark:text-white mb-1.5">
                  <Mail className="w-4 h-4 text-violet-500" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full pb-2.5 bg-transparent border-0 border-b-2 border-paper-300 dark:border-white/15 text-ink-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-ink-900 dark:text-white mb-1.5">
                  <Lock className="w-4 h-4 text-violet-500" /> Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pb-2.5 bg-transparent border-0 border-b-2 border-paper-300 dark:border-white/15 text-ink-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-violet-600 to-violet-400 hover:brightness-110 text-white font-bold rounded-xl shadow-lg shadow-violet-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
              >
                <span className="tracking-wide">{isLogin ? 'SIGN IN' : 'CREATE ACCOUNT'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-paper-300 dark:border-white/10 text-center">
              <button
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full py-2.5 bg-gold-400/15 hover:bg-gold-400/25 text-gold-600 dark:text-gold-300 font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 border border-gold-400/30"
              >
                <Sparkles className="w-4 h-4" />
                <span>Quick Demo Student Login</span>
              </button>
            </div>
          </div>

          {/* Right: illustration */}
          <div className="hidden lg:flex items-center justify-center">
            <svg viewBox="0 0 480 460" className="w-full max-w-md" xmlns="http://www.w3.org/2000/svg">
              {/* floating badge icons */}
              <g opacity="0.55">
                <rect x="24" y="18" width="44" height="44" rx="12" fill="currentColor" className="text-violet-200 dark:text-violet-500/20" />
                <path d="M40 34a6 6 0 0 1 12 0v4h-12v-4Zm-4 4h20v14a3 3 0 0 1-3 3H39a3 3 0 0 1-3-3V38Z" fill="currentColor" className="text-violet-500" />

                <rect x="96" y="4" width="44" height="44" rx="12" fill="currentColor" className="text-gold-300/60 dark:text-gold-400/20" />
                <path d="M108 16h20v6h-20zM108 26h20v18a2 2 0 0 1-2 2h-16a2 2 0 0 1-2-2V26Zm4 4v12M124 30v12" stroke="currentColor" strokeWidth="2" fill="none" className="text-gold-500" />

                <rect x="168" y="18" width="44" height="44" rx="12" fill="currentColor" className="text-violet-200 dark:text-violet-500/20" />
                <path d="M190 26l3.5 7.2 8 1.1-5.8 5.6 1.4 8-7.1-3.7-7.1 3.7 1.4-8-5.8-5.6 8-1.1L190 26Z" fill="currentColor" className="text-violet-500" />
              </g>

              {/* browser window mockup */}
              <rect x="30" y="80" width="330" height="260" rx="18" fill="currentColor" className="text-violet-500" />
              <rect x="30" y="80" width="330" height="34" rx="18" fill="currentColor" className="text-ink-900" />
              <circle cx="48" cy="97" r="4" fill="#fff" opacity="0.5" />
              <circle cx="62" cy="97" r="4" fill="#fff" opacity="0.5" />
              <circle cx="76" cy="97" r="4" fill="#fff" opacity="0.5" />

              <circle cx="195" cy="165" r="26" fill="currentColor" className="text-gold-400" />
              <path d="M186 162a9 9 0 0 1 18 0v4h-18v-4Zm-4 4h26v18a4 4 0 0 1-4 4h-18a4 4 0 0 1-4-4v-18Z" fill="#10163a" />

              <rect x="80" y="212" width="230" height="30" rx="8" fill="#fff" opacity="0.92" />
              <circle cx="98" cy="227" r="8" fill="currentColor" className="text-violet-500" />
              <rect x="118" y="222" width="150" height="10" rx="5" fill="currentColor" className="text-paper-300" />

              <rect x="80" y="254" width="230" height="30" rx="8" fill="#fff" opacity="0.92" />
              <path d="M96 224Z" />
              <circle cx="98" cy="269" r="8" fill="currentColor" className="text-gold-500" />
              <rect x="118" y="264" width="120" height="10" rx="5" fill="currentColor" className="text-paper-300" />

              <rect x="90" y="300" width="210" height="18" rx="9" fill="currentColor" className="text-violet-300" opacity="0.7" />

              {/* standing character */}
              <g>
                <rect x="72" y="330" width="26" height="60" rx="10" fill="currentColor" className="text-ink-900 dark:text-ink-700" />
                <rect x="60" y="270" width="50" height="66" rx="18" fill="currentColor" className="text-gold-400" />
                <circle cx="85" cy="252" r="20" fill="currentColor" className="text-paper-300" />
                <rect x="100" y="290" width="34" height="14" rx="7" fill="currentColor" className="text-gold-400" />
                <rect x="126" y="278" width="16" height="24" rx="4" fill="currentColor" className="text-ink-900 dark:text-ink-700" />
              </g>

              {/* seated character at a desk */}
              <g>
                <rect x="330" y="340" width="90" height="6" rx="3" fill="currentColor" className="text-ink-900 dark:text-ink-700" />
                <rect x="336" y="346" width="6" height="34" fill="currentColor" className="text-ink-900 dark:text-ink-700" />
                <rect x="408" y="346" width="6" height="34" fill="currentColor" className="text-ink-900 dark:text-ink-700" />

                <rect x="352" y="318" width="46" height="20" rx="4" fill="#fff" opacity="0.95" />
                <rect x="356" y="308" width="38" height="14" rx="3" fill="currentColor" className="text-violet-300" />

                <rect x="355" y="330" width="40" height="54" rx="16" fill="currentColor" className="text-violet-400" />
                <circle cx="375" cy="312" r="17" fill="currentColor" className="text-paper-300" />
                <rect x="358" y="372" width="16" height="26" rx="6" fill="currentColor" className="text-ink-900 dark:text-ink-700" />
                <rect x="380" y="372" width="16" height="26" rx="6" fill="currentColor" className="text-ink-900 dark:text-ink-700" />
              </g>

              <ellipse cx="240" cy="410" rx="150" ry="10" fill="currentColor" className="text-violet-900/10 dark:text-black/20" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
