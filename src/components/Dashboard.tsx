import React, { useState, useMemo } from 'react';
import { Note, User } from '../types';
import { Plus, Search, BookOpen, FileText, Calendar, Trash2, Edit2, Sparkles, ArrowRight, FolderKanban, Pin, GraduationCap, Atom, Calculator, Code, Globe } from 'lucide-react';
interface DashboardProps {
  user: User;
  notes: Note[];
  onOpenNote: (note: Note) => void;
  onCreateNote: () => void;
  onEditNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  onTogglePin: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  notes,
  onOpenNote,
  onCreateNote,
  onEditNote,
  onDeleteNote,
  onTogglePin
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');

  const getSubjectIcon = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes('math') || s.includes('calc') || s.includes('algebra')) return Calculator;
    if (s.includes('science') || s.includes('physics') || s.includes('chem') || s.includes('bio')) return Atom;
    if (s.includes('code') || s.includes('computer') || s.includes('prog') || s.includes('software')) return Code;
    if (s.includes('history') || s.includes('geo') || s.includes('social')) return Globe;
    return BookOpen;
  };

  // Extract unique subjects
  const subjects = useMemo(() => {
    const set = new Set(notes.map(n => n.subject));
    return ['All', ...Array.from(set)];
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const list = notes.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            n.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            n.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSubject = selectedSubject === 'All' || n.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    });

    // Sort: Pinned notes first, then by updatedAt descending
    return list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
  }, [notes, searchTerm, selectedSubject]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome & Stats Banner */}
      <div className="glass-card rounded-3xl p-8 text-ink-900 dark:text-white shadow-lg shadow-violet-900/5 mb-8 relative overflow-hidden animate-fade-up">
        <div className="absolute right-0 top-0 w-80 h-80 bg-gold-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-1/3 bottom-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-300 rounded-full text-xs font-bold tracking-wide uppercase border border-violet-500/20">
                <GraduationCap className="w-3.5 h-3.5" /> Study Hub
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/70 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium border border-paper-300 dark:border-white/10">
                Welcome back, {user.name}
              </span>
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-gradient-gold">Your Intelligent Study Workspace</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-xl text-sm sm:text-base leading-relaxed">
              Upload your lecture notes and reading materials to instantly master subjects with AI-powered summaries, interactive quizzes, and active recall flashcards.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <button
              onClick={onCreateNote}
              className="self-start md:self-auto px-6 py-3.5 bg-gradient-to-r from-ink-900 to-ink-800 dark:from-gold-500 dark:to-gold-600 hover:brightness-110 hover:scale-[1.03] active:scale-[0.98] text-white dark:text-ink-950 font-bold rounded-2xl glow-gold transition-all duration-200 flex items-center gap-2 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span>Upload New Note</span>
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium px-1">  </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-paper-300/70 dark:border-white/10 relative z-10">
          <div className="group">
            <div className="font-display text-2xl sm:text-3xl font-bold text-gold-600 dark:text-gold-300 transition-transform duration-200 group-hover:scale-110 origin-left">{notes.length}</div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Uploaded Notes</div>
          </div>
          <div className="group">
            <div className="font-display text-2xl sm:text-3xl font-bold text-violet-600 dark:text-violet-300 transition-transform duration-200 group-hover:scale-110 origin-left">{subjects.length - 1}</div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Active Subjects</div>
          </div>
        </div>
      </div>

      {/* Search and Subject Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 animate-fade-up" style={{ animationDelay: '80ms' }}>
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes by title, topic, or content..."
            className="w-full pl-10 pr-4 py-3 glass-panel rounded-2xl text-ink-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-400/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <FolderKanban className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 hidden sm:inline" />
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedSubject === sub
                  ? 'bg-gradient-to-r from-ink-900 to-ink-800 dark:from-gold-500 dark:to-gold-600 text-white dark:text-ink-950 glow-gold'
                  : 'glass-panel text-slate-600 dark:text-slate-300 hover:border-gold-400/40'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center shadow-sm animate-fade-up" style={{ animationDelay: '120ms' }}>
          <div className="w-20 h-20 bg-gradient-to-br from-ink-900 to-ink-800 dark:from-gold-500/20 dark:to-violet-500/20 text-gold-300 dark:text-gold-300 rounded-3xl mx-auto flex items-center justify-center mb-5 glow-gold animate-float-slow">
            <BookOpen className="w-10 h-10" />
          </div>
          <h3 className="font-display text-xl font-semibold text-ink-900 dark:text-white">No study notes found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
            {notes.length === 0
              ? "Your learning library is currently empty. Upload your first study note, lecture slides, or reading material to unlock AI summaries and quizzes."
              : "No notes match your current search query or subject filter. Try adjusting your search."}
          </p>
          {notes.length === 0 && (
            <button
              onClick={onCreateNote}
              className="mt-6 px-6 py-3.5 bg-gradient-to-r from-ink-900 to-ink-800 dark:from-gold-500 dark:to-gold-600 hover:brightness-110 hover:scale-[1.03] active:scale-[0.98] text-white dark:text-ink-950 font-semibold rounded-2xl text-sm glow-gold transition-all duration-200 inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Your First Note</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note, idx) => {
            const SubjectIcon = getSubjectIcon(note.subject);
            return (
              <div
                key={note.id}
                style={{ animationDelay: `${Math.min(idx, 8) * 60}ms` }}
                className={`glass-card rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group overflow-hidden animate-fade-up ${
                  note.isPinned ? 'ring-2 ring-gold-400/40 border-gold-400/50' : ''
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-violet-500/10 text-violet-600 dark:text-violet-300 text-xs font-bold rounded-lg border border-violet-500/20">
                        <SubjectIcon className="w-3.5 h-3.5" />
                        {note.subject}
                      </span>
                      {note.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-400/10 text-gold-600 dark:text-gold-300 text-[10px] font-bold rounded-md border border-gold-400/30">
                          <Pin className="w-3 h-3 fill-current rotate-45" /> Pinned
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <h3 className="font-display font-semibold text-lg text-ink-900 dark:text-white group-hover:text-gold-600 dark:group-hover:text-gold-300 transition-colors line-clamp-1 mb-2">
                    {note.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 leading-relaxed mb-4">
                    {note.content}
                  </p>

                  {note.fileName && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-paper-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 text-xs rounded-md font-mono mb-2 border border-paper-200 dark:border-white/5">
                      <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span className="truncate max-w-[200px]">{note.fileName}</span>
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 bg-paper-50/60 dark:bg-white/[0.03] border-t border-paper-200 dark:border-white/5 flex items-center justify-between">
                  <button
                    onClick={() => onOpenNote(note)}
                    className="inline-flex items-center gap-2 text-gold-600 dark:text-gold-300 hover:text-gold-600 dark:hover:text-gold-300 font-bold text-sm group-hover:translate-x-1 transition-transform"
                  >
                    <span>Study Note</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onTogglePin(note.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        note.isPinned
                          ? 'text-gold-500 bg-gold-400/10 hover:bg-gold-400/20'
                          : 'text-slate-400 dark:text-slate-500 hover:text-gold-500 hover:bg-white/60 dark:hover:bg-white/5'
                      }`}
                      title={note.isPinned ? "Unpin Note" : "Pin Note to Top"}
                    >
                      <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-current rotate-45' : 'rotate-45'}`} />
                    </button>
                    <button
                      onClick={() => onEditNote(note)}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-violet-600 dark:hover:text-violet-300 rounded-lg hover:bg-white/60 dark:hover:bg-white/5 transition-colors"
                      title="Edit Note"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-500 rounded-lg hover:bg-white/60 dark:hover:bg-white/5 transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
