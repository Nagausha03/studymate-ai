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
      {/* Welcome & Stats Banner with Clean Minimal Light Background */}
      <div className="bg-gradient-to-br from-slate-50 via-indigo-50/40 to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/40 rounded-3xl p-8 text-slate-900 dark:text-white shadow-sm mb-8 relative overflow-hidden border border-slate-200/80 dark:border-slate-800">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-bold tracking-wide uppercase">
                <GraduationCap className="w-3.5 h-3.5" /> Study Hub
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-700">
                Welcome back, {user.name}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Your Intelligent Study Workspace</h1>
            <p className="text-slate-600 dark:text-slate-300 mt-2 max-w-xl text-sm sm:text-base leading-relaxed">
              Upload your lecture notes and reading materials to instantly master subjects with AI-powered summaries, interactive quizzes, and active recall flashcards.
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2">
            <button
              onClick={onCreateNote}
              className="self-start md:self-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center gap-2 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              <span>Upload New Note</span>
            </button>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium px-1">Tip: Press <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[10px]">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[10px]">N</kbd> to quick-create</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-slate-200/80 dark:border-slate-800">
          <div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">{notes.length}</div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Uploaded Notes</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">{subjects.length - 1}</div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium">Active Subjects</div>
          </div>
        </div>
      </div>

      {/* Search and Subject Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notes by title, topic, or content..."
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <FolderKanban className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline" />
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-3xl mx-auto flex items-center justify-center mb-5 shadow-inner">
            <BookOpen className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">No study notes found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
            {notes.length === 0
              ? "Your learning library is currently empty. Upload your first study note, lecture slides, or reading material to unlock AI summaries and quizzes."
              : "No notes match your current search query or subject filter. Try adjusting your search."}
          </p>
          {notes.length === 0 && (
            <button
              onClick={onCreateNote}
              className="mt-6 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-2xl text-sm shadow-md transition-all inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Upload Your First Note</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => {
            const SubjectIcon = getSubjectIcon(note.subject);
            return (
              <div
                key={note.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col justify-between group overflow-hidden ${
                  note.isPinned
                    ? 'border-amber-400 dark:border-amber-500/60 ring-2 ring-amber-400/20 dark:ring-amber-500/10'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg border border-indigo-100 dark:border-indigo-900">
                        <SubjectIcon className="w-3.5 h-3.5" />
                        {note.subject}
                      </span>
                      {note.isPinned && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-md border border-amber-200 dark:border-amber-900">
                          <Pin className="w-3 h-3 fill-current rotate-45" /> Pinned
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500 text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1 mb-2">
                    {note.title}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3 leading-relaxed mb-4">
                    {note.content}
                  </p>

                  {note.fileName && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-md font-mono mb-2">
                      <FileText className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span className="truncate max-w-[200px]">{note.fileName}</span>
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => onOpenNote(note)}
                    className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:text-indigo-300 font-bold text-sm group-hover:translate-x-1 transition-transform"
                  >
                    <span>Study Note</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onTogglePin(note.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        note.isPinned
                          ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                          : 'text-slate-400 hover:text-amber-500 hover:bg-white dark:hover:bg-slate-800'
                      }`}
                      title={note.isPinned ? "Unpin Note" : "Pin Note to Top"}
                    >
                      <Pin className={`w-4 h-4 ${note.isPinned ? 'fill-current rotate-45' : 'rotate-45'}`} />
                    </button>
                    <button
                      onClick={() => onEditNote(note)}
                      className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
                      title="Edit Note"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors"
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

