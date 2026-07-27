import React, { useState, useEffect } from 'react';
import { User, Note } from './types';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { Dashboard } from './components/Dashboard';
import { NoteDetail } from './components/NoteDetail';
import { NoteFormModal } from './components/NoteFormModal';
import { OnboardingModal } from './components/OnboardingModal';
import studyBg from './assets/images/study_bg_pattern_1785000355900.jpg';

export default function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('studymate_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('dark')) {
      return 'dark';
    }
    return 'light';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      localStorage.setItem('studymate_theme', next);
      return next;
    });
  };

  // Save user session & check onboarding
  useEffect(() => {
    if (user) {
      localStorage.setItem('studymate_user', JSON.stringify(user));
      fetchNotes(user.id);

      const hasSeenOnboarding = localStorage.getItem(`studymate_onboarded_${user.id}`);
      if (!hasSeenOnboarding) {
        setIsOnboardingOpen(true);
      }
    } else {
      localStorage.removeItem('studymate_user');
      setNotes([]);
    }
  }, [user]);

  const handleCloseOnboarding = () => {
    if (user) {
      localStorage.setItem(`studymate_onboarded_${user.id}`, 'true');
    }
    setIsOnboardingOpen(false);
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+N or Cmd+N for new note
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        if (user && !isNoteModalOpen) {
          e.preventDefault();
          setEditingNote(null);
          setIsNoteModalOpen(true);
        }
      }
      // Esc to close modal or go back
      if (e.key === 'Escape') {
        if (isNoteModalOpen) {
          setIsNoteModalOpen(false);
        } else if (selectedNote) {
          setSelectedNote(null);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user, isNoteModalOpen, selectedNote]);

  const fetchNotes = async (userId: string) => {
    try {
      const res = await fetch(`/api/notes?userId=${userId}`);
      const data = await res.json();
      if (data.notes) {
        setNotes(data.notes);
      }
    } catch (err) {
      console.error("Failed to fetch notes", err);
    }
  };

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedNote(null);
  };

  const handleSaveNote = async (
    noteData: { title: string; subject: string; content: string; fileName?: string },
    editingId?: string
  ) => {
    if (!user) return;

    try {
      if (editingId) {
        const res = await fetch(`/api/notes/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(noteData)
        });
        const data = await res.json();
        if (res.ok) {
          setNotes(prev => prev.map(n => n.id === editingId ? data.note : n));
          if (selectedNote && selectedNote.id === editingId) {
            setSelectedNote(data.note);
          }
        }
      } else {
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, ...noteData })
        });
        const data = await res.json();
        if (res.ok) {
          setNotes(prev => [data.note, ...prev]);
        }
      }
    } catch (err) {
      console.error("Failed to save note", err);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Are you sure you want to delete this study note and all its AI resources?")) return;

    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setNotes(prev => prev.filter(n => n.id !== id));
        if (selectedNote && selectedNote.id === id) {
          setSelectedNote(null);
        }
      }
    } catch (err) {
      console.error("Failed to delete note", err);
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}/pin`, { method: 'PATCH' });
      const data = await res.json();
      if (res.ok) {
        setNotes(prev => prev.map(n => n.id === id ? data.note : n));
        if (selectedNote && selectedNote.id === id) {
          setSelectedNote(data.note);
        }
      }
    } catch (err) {
      console.error("Failed to toggle pin", err);
    }
  };

  if (!user) {
    return (
      <div>
        <AuthModal onLoginSuccess={handleLoginSuccess} theme={theme} onToggleTheme={toggleTheme} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-paper-50 to-paper-100 dark:from-ink-950 dark:via-ink-950 dark:to-ink-900 relative overflow-x-hidden font-sans text-slate-900 dark:text-slate-100 selection:bg-gold-400 selection:text-ink-950 transition-colors duration-300">
      {/* Background study aesthetic image layer */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.05] dark:opacity-[0.04] pointer-events-none -z-20 mix-blend-overlay"
        style={{ backgroundImage: `url(${studyBg})` }}
      ></div>

      {/* Ambient background glow accents — the "desk lamp" motif, gently drifting */}
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-violet-400/15 dark:bg-violet-500/10 rounded-full blur-3xl pointer-events-none -z-10 animate-float-slow"></div>
      <div className="fixed top-1/3 right-1/4 w-[30rem] h-[30rem] bg-gold-400/10 dark:bg-gold-400/[0.06] rounded-full blur-3xl pointer-events-none -z-10 animate-float-slower"></div>
      <div className="fixed bottom-0 left-1/3 w-72 h-72 bg-violet-300/10 dark:bg-violet-400/[0.06] rounded-full blur-3xl pointer-events-none -z-10 animate-float-slow"></div>

      <Navbar
        user={user}
        onLogout={handleLogout}
        onHome={() => setSelectedNote(null)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main>
        {selectedNote ? (
          <NoteDetail
            note={selectedNote}
            onBack={() => setSelectedNote(null)}
          />
        ) : (
          <Dashboard
            user={user}
            notes={notes}
            onOpenNote={(note) => setSelectedNote(note)}
            onCreateNote={() => {
              setEditingNote(null);
              setIsNoteModalOpen(true);
            }}
            onEditNote={(note) => {
              setEditingNote(note);
              setIsNoteModalOpen(true);
            }}
            onDeleteNote={handleDeleteNote}
            onTogglePin={handleTogglePin}
          />
        )}
      </main>

      <NoteFormModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        onSave={handleSaveNote}
        editingNote={editingNote}
        userId={user.id}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={handleCloseOnboarding}
        userName={user.name}
      />
    </div>
  );
}

