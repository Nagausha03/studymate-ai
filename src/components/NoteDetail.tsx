import React, { useState, useEffect } from 'react';
import Markdown from 'react-markdown';
import { Note, SummaryData, QuizQuestion, FlashcardItem, ChatMessage, AIResults } from '../types';
import { ArrowLeft, Sparkles, FileText, HelpCircle, BookMarked, MessageSquare, CheckCircle, XCircle, RotateCcw, Send, ChevronLeft, ChevronRight, FlipHorizontal, Download, ChevronDown, Volume2, Square, Copy } from 'lucide-react';

interface NoteDetailProps {
  note: Note;
  onBack: () => void;
}

export const NoteDetail: React.FC<NoteDetailProps> = ({ note, onBack }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'quiz' | 'flashcards' | 'chat'>('summary');

  const [aiResults, setAiResults] = useState<AIResults>({ noteId: note.id, updatedAt: new Date().toISOString() });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Quiz state
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: number }>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // Chat state
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const summaryText = aiResults.summary ? [
    aiResults.summary.revisionNotes,
    ...(aiResults.summary.keyConcepts || []),
    ...(aiResults.summary.importantPoints || []),
    ...(aiResults.summary.bulletSummary || [])
  ].join(' ') : '';

  const summaryWordCount = summaryText ? summaryText.trim().split(/\s+/).length : 0;
  const readingTimeMinutes = Math.max(1, Math.ceil(summaryWordCount / 200));
  const readingTime = readingTimeMinutes === 1 ? '1 min read' : `${readingTimeMinutes} mins read`;

  const handleCopySummary = () => {
    if (!summaryText) return;
    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Fetch cached AI results on load
  useEffect(() => {
    fetch(`/api/ai-results/${note.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.results) {
          setAiResults(data.results);
        }
      })
      .catch(err => console.error("Failed to load AI results", err));
  }, [note.id]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleReadAloud = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    let textToRead = `${note.title}. Subject: ${note.subject}. Content: ${note.content}`;
    if (aiResults.summary?.revisionNotes) {
      textToRead += `. AI Revision Notes: ${aiResults.summary.revisionNotes}`;
    }

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setIsSpeaking(false);
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Generate Summary
  const handleGenerateSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: note.id, content: note.content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate summary');
      setAiResults(prev => ({ ...prev, summary: data.summary }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate Quiz
  const handleGenerateQuiz = async () => {
    setLoading(true);
    setError('');
    setSelectedAnswers({});
    setQuizSubmitted(false);
    try {
      const res = await fetch('/api/ai/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: note.id, content: note.content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate quiz');
      setAiResults(prev => ({ ...prev, quiz: data.quiz }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate Flashcards
  const handleGenerateFlashcards = async () => {
    setLoading(true);
    setError('');
    setCurrentCardIndex(0);
    setIsFlipped(false);
    try {
      const res = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId: note.id, content: note.content })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate flashcards');
      setAiResults(prev => ({ ...prev, flashcards: data.flashcards }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit Quiz
  const handleQuizSubmit = () => {
    if (!aiResults.quiz) return;
    let currentScore = 0;
    aiResults.quiz.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        currentScore += 1;
      }
    });
    setScore(currentScore);
    setQuizSubmitted(true);
  };

  // Retake Quiz
  const handleRetakeQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setScore(0);
  };

  // Send Chat Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userMsgText = chatInput.trim();
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId: note.id,
          content: note.content,
          message: userMsgText,
          history: aiResults.chatHistory || []
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get chat response');
      setAiResults(prev => ({ ...prev, chatHistory: data.chatHistory }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setChatLoading(false);
    }
  };

  const handleExportMarkdown = () => {
    let md = `# ${note.title}\n`;
    md += `**Subject:** ${note.subject}\n`;
    md += `**Date:** ${new Date(note.createdAt).toLocaleDateString()}\n\n`;
    md += `## Original Note Content\n${note.content}\n\n`;

    if (aiResults.summary) {
      md += `## AI Summary & Revision Notes\n`;
      md += `${aiResults.summary.revisionNotes}\n\n`;

      if (aiResults.summary.keyConcepts && aiResults.summary.keyConcepts.length > 0) {
        md += `### Key Concepts\n`;
        aiResults.summary.keyConcepts.forEach((c, i) => {
          md += `${i + 1}. ${c}\n`;
        });
        md += `\n`;
      }

      if (aiResults.summary.importantPoints && aiResults.summary.importantPoints.length > 0) {
        md += `### Important Points\n`;
        aiResults.summary.importantPoints.forEach((p, i) => {
          md += `- ${p}\n`;
        });
        md += `\n`;
      }

      if (aiResults.summary.bulletSummary && aiResults.summary.bulletSummary.length > 0) {
        md += `### Bullet-Point Summary\n`;
        aiResults.summary.bulletSummary.forEach((b) => {
          md += `- ${b}\n`;
        });
        md += `\n`;
      }
    }

    if (aiResults.quiz && aiResults.quiz.length > 0) {
      md += `## Practice Quiz\n`;
      aiResults.quiz.forEach((q, i) => {
        md += `### Question ${i + 1}: ${q.question}\n`;
        q.options.forEach((opt, oIdx) => {
          md += `- [${oIdx === q.correctAnswer ? 'x' : ' '}] ${opt}\n`;
        });
        md += `*Explanation:* ${q.explanation}\n\n`;
      });
    }

    if (aiResults.flashcards && aiResults.flashcards.length > 0) {
      md += `## Active Recall Flashcards\n`;
      aiResults.flashcards.forEach((fc, i) => {
        md += `### Card ${i + 1}\n`;
        md += `**Front:** ${fc.front}\n\n`;
        md += `**Back:** ${fc.back}\n\n`;
      });
    }

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_studymate.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    setIsExportOpen(false);
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups for this website to export PDF.');
      return;
    }

    let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${note.title} - StudyMate AI Guide</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    h1 { font-size: 28px; margin-bottom: 8px; color: #0f172a; }
    .badge { display: inline-block; background: #e0e7ff; color: #3730a3; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: bold; margin-bottom: 24px; }
    .section { margin-bottom: 32px; border-bottom: 1px solid #e2e8f0; padding-bottom: 24px; page-break-inside: avoid; }
    h2 { font-size: 20px; color: #334155; margin-top: 24px; margin-bottom: 12px; }
    h3 { font-size: 16px; color: #475569; margin-top: 16px; margin-bottom: 8px; }
    p, li { font-size: 15px; color: #475569; }
    ul { padding-left: 20px; }
    .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-bottom: 12px; page-break-inside: avoid; }
    .card-front { font-weight: bold; color: #1e293b; margin-bottom: 6px; }
    .card-back { color: #475569; }
  </style>
</head>
<body>
  <h1>${note.title}</h1>
  <div class="badge">${note.subject}</div>
  <p><em>Generated on ${new Date().toLocaleDateString()} via StudyMate AI</em></p>

  <div class="section">
    <h2>Original Note Content</h2>
    <p style="white-space: pre-wrap; font-family: monospace; background: #f8fafc; padding: 16px; border-radius: 8px; font-size: 13px;">${note.content}</p>
  </div>
`;

    if (aiResults.summary) {
      html += `
  <div class="section">
    <h2>AI Summary & Revision Notes</h2>
    <p><strong>Quick Revision:</strong> ${aiResults.summary.revisionNotes}</p>
`;
      if (aiResults.summary.keyConcepts && aiResults.summary.keyConcepts.length > 0) {
        html += `<h3>Key Concepts</h3><ul>`;
        aiResults.summary.keyConcepts.forEach(c => html += `<li>${c}</li>`);
        html += `</ul>`;
      }
      if (aiResults.summary.importantPoints && aiResults.summary.importantPoints.length > 0) {
        html += `<h3>Important Points</h3><ul>`;
        aiResults.summary.importantPoints.forEach(p => html += `<li>${p}</li>`);
        html += `</ul>`;
      }
      if (aiResults.summary.bulletSummary && aiResults.summary.bulletSummary.length > 0) {
        html += `<h3>Bullet-Point Summary</h3><ul>`;
        aiResults.summary.bulletSummary.forEach(b => html += `<li>${b}</li>`);
        html += `</ul>`;
      }
      html += `</div>`;
    }

    if (aiResults.quiz && aiResults.quiz.length > 0) {
      html += `<div class="section"><h2>Practice Quiz</h2>`;
      aiResults.quiz.forEach((q, i) => {
        html += `<div class="card"><strong>Q${i + 1}: ${q.question}</strong><ul>`;
        q.options.forEach((opt, oIdx) => {
          const isCorrect = oIdx === q.correctAnswer;
          html += `<li ${isCorrect ? 'style="font-weight:bold; color:#059669;"' : ''}>${opt} ${isCorrect ? '(Correct Answer)' : ''}</li>`;
        });
        html += `</ul><p style="font-size:13px; margin-top:8px;"><em>Explanation:</em> ${q.explanation}</p></div>`;
      });
      html += `</div>`;
    }

    if (aiResults.flashcards && aiResults.flashcards.length > 0) {
      html += `<div class="section"><h2>Active Recall Flashcards</h2>`;
      aiResults.flashcards.forEach((fc, i) => {
        html += `<div class="card"><div class="card-front">Card ${i + 1}: ${fc.front}</div><div class="card-back"><strong>Answer:</strong> ${fc.back}</div></div>`;
      });
      html += `</div>`;
    }

    html += `
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 600);
    };
  </script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header bar */}
      <div className="flex items-center justify-between mb-6 animate-fade-up">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-violet-600 dark:hover:text-violet-400 font-semibold text-sm glass-card px-4 py-2 rounded-xl border border-paper-300 dark:border-ink-800 shadow-sm hover:shadow-md hover:-translate-x-0.5 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>
        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1 bg-violet-50 dark:bg-violet-950/80 text-violet-700 dark:text-violet-300 text-xs font-bold rounded-full border border-violet-100 dark:border-violet-900">
            {note.subject}
          </span>
          <button
            onClick={handleReadAloud}
            className={`inline-flex items-center gap-2 px-3.5 py-2 font-semibold text-xs rounded-xl shadow-sm hover:shadow-md transition-all ${
              isSpeaking
                ? 'bg-gold-500 hover:bg-gold-600 text-white animate-pulse'
                : 'glass-card border border-paper-300 dark:border-ink-800 text-ink-700 dark:text-slate-300 hover:bg-paper-50 dark:hover:bg-ink-800'
            }`}
            title={isSpeaking ? "Stop Reading" : "Read Note Aloud"}
          >
            {isSpeaking ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />}
            <span>{isSpeaking ? 'Stop Reading' : 'Read Aloud'}</span>
          </button>
          <div className="relative">
            <button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-violet-600 to-violet-500 hover:brightness-110 hover:scale-[1.03] active:scale-[0.98] text-white font-semibold text-xs rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              title="Export Study Material"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Study Guide</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
            {isExportOpen && (
              <div className="absolute right-0 mt-2 w-56 glass-card border border-paper-300 dark:border-ink-800 rounded-2xl shadow-xl py-2 z-30 animate-fade-up">
                <button
                  onClick={() => {
                    handleExportMarkdown();
                    setIsExportOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-ink-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-ink-800 flex items-center gap-2"
                >
                  <FileText className="w-3.5 h-3.5 text-violet-600" />
                  <span>Download as Markdown (.md)</span>
                </button>
                <button
                  onClick={() => {
                    handleExportPDF();
                    setIsExportOpen(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs font-medium text-ink-700 dark:text-slate-300 hover:bg-violet-50 dark:hover:bg-ink-800 flex items-center gap-2"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Print / Save as PDF</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-3xl border border-paper-300 dark:border-ink-800 shadow-md p-6 sm:p-8 mb-8 animate-fade-up" style={{ animationDelay: '60ms' }}>
        <h1 className="font-display text-2xl sm:text-3xl font-black text-ink-900 dark:text-white mb-3">{note.title}</h1>
        <div className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed bg-paper-50 dark:bg-ink-800/60 p-4 rounded-2xl border border-paper-100 dark:border-ink-800 max-h-40 overflow-y-auto font-mono">
          {note.content}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 rounded-2xl text-sm font-medium animate-fade-up">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-paper-300 dark:border-ink-800 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 transition-colors shrink-0 ${
            activeTab === 'summary'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>AI Summary</span>
          {aiResults.summary && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 transition-colors shrink-0 ${
            activeTab === 'quiz'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Quiz Practice</span>
          {aiResults.quiz && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 transition-colors shrink-0 ${
            activeTab === 'flashcards'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          <BookMarked className="w-4 h-4" />
          <span>Flashcards</span>
          {aiResults.flashcards && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 transition-colors shrink-0 ${
            activeTab === 'chat'
              ? 'border-violet-600 text-violet-600 dark:text-violet-400 bg-violet-50/50 dark:bg-violet-950/40'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-ink-900 dark:hover:text-white'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Ask AI Tutor</span>
          {aiResults.chatHistory && aiResults.chatHistory.length > 0 && (
            <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900 text-violet-700 dark:text-violet-300 text-xs rounded-full font-bold">
              {aiResults.chatHistory.length / 2}
            </span>
          )}
        </button>
      </div>

      {/* Tab Content: Summary */}
      {activeTab === 'summary' && (
        <div className="space-y-6 animate-fade-up">
          {!aiResults.summary ? (
            <div className="glass-card rounded-3xl border border-paper-300 dark:border-ink-800 p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 rounded-2xl mx-auto flex items-center justify-center mb-4 animate-float-slow">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-ink-900 dark:text-white mb-2">Generate Smart AI Summary</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
                Let Gemini extract key concepts, important bullet points, and quick revision notes from your study material.
              </p>
              <button
                onClick={handleGenerateSummary}
                disabled={loading}
                className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-violet-500 hover:brightness-110 hover:scale-105 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/20 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 inline-flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>{loading ? 'Generating Summary...' : 'Generate Summary'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-900/60 px-6 py-4 rounded-2xl flex-wrap gap-4">
                <div className="flex items-center gap-2 text-violet-900 dark:text-violet-200 font-bold">
                  <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  <span>AI Summary Generated Successfully</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <span className="px-2.5 py-1 bg-white dark:bg-ink-800 rounded-lg border border-violet-100 dark:border-violet-900">{summaryWordCount} words</span>
                  <span className="px-2.5 py-1 bg-white dark:bg-ink-800 rounded-lg border border-violet-100 dark:border-violet-900">{readingTime}</span>
                  <button
                    onClick={handleCopySummary}
                    className="px-3 py-1.5 bg-white dark:bg-ink-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-ink-700 font-semibold text-xs rounded-xl border border-violet-200 dark:border-violet-800 shadow-sm transition-all flex items-center gap-1.5"
                    title="Copy Summary to Clipboard"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedSummary ? 'Copied!' : 'Copy Summary'}</span>
                  </button>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={loading}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all"
                  >
                    {loading ? 'Regenerating...' : 'Regenerate'}
                  </button>
                </div>
              </div>

              {/* Quick Revision Notes */}
              <div className="bg-gradient-to-br from-gold-300 to-orange-50 dark:from-gold-600/30 dark:to-orange-950/30 border border-gold-300 dark:border-gold-600 rounded-3xl p-6 sm:p-8">
                <h3 className="text-lg font-bold text-gold-600 dark:text-gold-300 mb-2 flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-gold-600 dark:text-gold-400" /> Quick Revision Notes
                </h3>
                <p className="text-gold-600/90 dark:text-gold-300/90 text-sm sm:text-base leading-relaxed">
                  {aiResults.summary.revisionNotes}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Key Concepts */}
                <div className="glass-card rounded-3xl border border-paper-300 dark:border-ink-800 p-6 sm:p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-ink-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-violet-600"></span> Key Concepts
                  </h3>
                  <ul className="space-y-3">
                    {aiResults.summary.keyConcepts.map((concept, idx) => (
                      <li key={idx} className="flex items-start gap-3 bg-paper-50 dark:bg-ink-800/60 p-3.5 rounded-2xl border border-paper-100 dark:border-ink-800">
                        <span className="w-6 h-6 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-sm font-semibold text-ink-800 dark:text-paper-300">{concept}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Important Points */}
                <div className="glass-card rounded-3xl border border-paper-300 dark:border-ink-800 p-6 sm:p-8 shadow-sm">
                  <h3 className="text-lg font-bold text-ink-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600"></span> Important Points
                  </h3>
                  <ul className="space-y-3">
                    {aiResults.summary.importantPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-3 bg-paper-50 dark:bg-ink-800/60 p-3.5 rounded-2xl border border-paper-100 dark:border-ink-800">
                        <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-sm text-ink-700 dark:text-slate-300">{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bullet Summary */}
              <div className="glass-card rounded-3xl border border-paper-300 dark:border-ink-800 p-6 sm:p-8 shadow-sm">
                <h3 className="text-lg font-bold text-ink-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span> Bullet-Point Summary
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {aiResults.summary.bulletSummary.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-paper-50 dark:bg-ink-800/60 p-4 rounded-2xl border border-paper-100 dark:border-ink-800">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                      <p className="text-sm text-ink-700 dark:text-slate-300 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Quiz */}
      {activeTab === 'quiz' && (
        <div className="space-y-6 animate-fade-up">
          {!aiResults.quiz ? (
            <div className="glass-card rounded-3xl border border-paper-300 dark:border-ink-800 p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 rounded-2xl mx-auto flex items-center justify-center mb-4 animate-float-slow">
                <HelpCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-ink-900 dark:text-white mb-2">Generate Interactive Quiz</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
                Test your knowledge with 5 AI-generated multiple-choice questions complete with instant feedback and scoring.
              </p>
              <button
                onClick={handleGenerateQuiz}
                disabled={loading}
                className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-violet-500 hover:brightness-110 hover:scale-105 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/20 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 inline-flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>{loading ? 'Generating Quiz...' : 'Generate Quiz'}</span>
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-900/60 px-6 py-4 rounded-2xl">
                <div className="flex items-center gap-2 text-violet-900 dark:text-violet-200 font-bold">
                  <HelpCircle className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  <span>Practice Quiz (5 Questions)</span>
                </div>
                <div className="flex items-center gap-3">
                  {quizSubmitted && (
                    <span className="text-sm font-bold text-violet-950 dark:text-violet-200 bg-violet-200/70 dark:bg-violet-900 px-3 py-1 rounded-xl">
                      Score: {score} / {aiResults.quiz.length}
                    </span>
                  )}
                  <button
                    onClick={handleGenerateQuiz}
                    disabled={loading}
                    className="px-4 py-2 bg-white dark:bg-ink-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-ink-700 font-semibold text-xs rounded-xl border border-violet-200 dark:border-violet-800 shadow-sm transition-all disabled:opacity-50"
                  >
                    {loading ? 'Regenerating...' : 'Regenerate Quiz'}
                  </button>
                </div>
              </div>

              {aiResults.quiz.map((q, qIdx) => {
                const isAnswered = selectedAnswers[qIdx] !== undefined;
                const isCorrect = selectedAnswers[qIdx] === q.correctAnswer;
                return (
                  <div key={q.id || qIdx} className="glass-card rounded-3xl border border-paper-300 dark:border-ink-800 p-6 sm:p-8 shadow-sm">
                    <h3 className="font-bold text-lg text-ink-900 dark:text-white mb-4 flex items-start gap-3">
                      <span className="w-7 h-7 rounded-xl bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 font-bold text-sm flex items-center justify-center shrink-0">
                        {qIdx + 1}
                      </span>
                      <span>{q.question}</span>
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedAnswers[qIdx] === optIdx;
                        let btnStyle = "bg-paper-50 dark:bg-ink-800 border-paper-300 dark:border-ink-700 text-ink-700 dark:text-slate-300 hover:bg-violet-50/50 dark:hover:bg-ink-700 hover:border-violet-200";

                        if (quizSubmitted) {
                          if (optIdx === q.correctAnswer) {
                            btnStyle = "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 font-semibold";
                          } else if (isSelected && optIdx !== q.correctAnswer) {
                            btnStyle = "bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-900 text-red-900 dark:text-red-200";
                          }
                        } else if (isSelected) {
                          btnStyle = "bg-violet-600 text-white border-violet-600 shadow-md";
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => setSelectedAnswers({ ...selectedAnswers, [qIdx]: optIdx })}
                            className={`p-4 rounded-2xl border text-left text-sm transition-all flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && optIdx === q.correctAnswer && (
                              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-2" />
                            )}
                            {quizSubmitted && isSelected && optIdx !== q.correctAnswer && (
                              <XCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="mt-4 p-4 rounded-2xl bg-paper-50 dark:bg-ink-800/80 border border-paper-300 dark:border-ink-700 text-sm">
                        <span className="font-bold text-ink-900 dark:text-white">Explanation: </span>
                        <span className="text-slate-600 dark:text-slate-300">{q.explanation}</span>
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="flex items-center justify-center gap-4 pt-4">
                {!quizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(selectedAnswers).length === 0}
                    className="px-8 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl shadow-lg shadow-violet-200 dark:shadow-none transition-all disabled:opacity-50"
                  >
                    Submit Quiz Answers
                  </button>
                ) : (
                  <button
                    onClick={handleRetakeQuiz}
                    className="px-8 py-3.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl shadow-lg shadow-violet-200 dark:shadow-none transition-all inline-flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Retake Quiz</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Flashcards */}
      {activeTab === 'flashcards' && (
        <div className="space-y-6 animate-fade-up">
          {!aiResults.flashcards ? (
            <div className="glass-card rounded-3xl border border-paper-300 dark:border-ink-800 p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 rounded-2xl mx-auto flex items-center justify-center mb-4 animate-float-slow">
                <BookMarked className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-ink-900 dark:text-white mb-2">Generate Active Recall Flashcards</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto mb-6">
                Master core concepts with 8 interactive flashcards designed for active recall learning.
              </p>
              <button
                onClick={handleGenerateFlashcards}
                disabled={loading}
                className="px-8 py-3.5 bg-gradient-to-r from-violet-600 to-violet-500 hover:brightness-110 hover:scale-105 active:scale-95 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/20 transition-all duration-200 disabled:opacity-50 disabled:hover:scale-100 inline-flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                <span>{loading ? 'Generating Flashcards...' : 'Generate Flashcards'}</span>
              </button>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="flex justify-between items-center bg-violet-50 dark:bg-violet-950/50 border border-violet-100 dark:border-violet-900/60 px-6 py-4 rounded-2xl">
                <span className="font-bold text-violet-900 dark:text-violet-200 text-sm">
                  Card {currentCardIndex + 1} of {aiResults.flashcards.length}
                </span>
                <button
                  onClick={handleGenerateFlashcards}
                  disabled={loading}
                  className="px-4 py-2 bg-white dark:bg-ink-800 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-ink-700 font-semibold text-xs rounded-xl border border-violet-200 dark:border-violet-800 shadow-sm transition-all disabled:opacity-50"
                >
                  {loading ? 'Regenerating...' : 'Regenerate Flashcards'}
                </button>
              </div>

              {/* Flashcard Flip Card */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="glass-card rounded-3xl border-2 border-paper-300 dark:border-ink-800 hover:border-violet-400 dark:hover:border-violet-600 p-10 sm:p-14 shadow-md cursor-pointer min-h-[320px] flex flex-col justify-between transition-all relative overflow-hidden group select-none"
              >
                <div className="absolute top-4 right-4 flex items-center gap-1.5 text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950 px-3 py-1 rounded-full border border-violet-100 dark:border-violet-900">
                  <FlipHorizontal className="w-3.5 h-3.5" />
                  <span>{isFlipped ? 'Answer Side' : 'Question Side (Click to Flip)'}</span>
                </div>

                <div className="my-auto text-center">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 block">
                    {isFlipped ? 'Answer & Explanation' : 'Concept / Question'}
                  </span>
                  <p className="text-xl sm:text-2xl font-bold text-ink-900 dark:text-white leading-relaxed">
                    {isFlipped
                      ? aiResults.flashcards[currentCardIndex].back
                      : aiResults.flashcards[currentCardIndex].front}
                  </p>
                </div>

                <div className="text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
                  Click anywhere on card to flip
                </div>
              </div>

              {/* Navigation controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex(prev => Math.max(0, prev - 1));
                  }}
                  disabled={currentCardIndex === 0}
                  className="px-5 py-3 rounded-2xl border border-paper-300 dark:border-ink-700 glass-card text-ink-700 dark:text-slate-300 font-bold text-sm hover:bg-paper-50 dark:hover:bg-ink-800 transition-all disabled:opacity-40 flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex gap-1.5">
                  {aiResults.flashcards.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsFlipped(false);
                        setCurrentCardIndex(idx);
                      }}
                      className={`w-3 h-3 rounded-full transition-all ${
                        currentCardIndex === idx ? 'bg-violet-600 dark:bg-violet-500 w-6' : 'bg-paper-300 dark:bg-ink-800'
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => {
                    setIsFlipped(false);
                    setCurrentCardIndex(prev => Math.min(aiResults.flashcards!.length - 1, prev + 1));
                  }}
                  disabled={currentCardIndex === aiResults.flashcards.length - 1}
                  className="px-5 py-3 rounded-2xl border border-paper-300 dark:border-ink-700 glass-card text-ink-700 dark:text-slate-300 font-bold text-sm hover:bg-paper-50 dark:hover:bg-ink-800 transition-all disabled:opacity-40 flex items-center gap-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Chat / Ask AI */}
      {activeTab === 'chat' && (
        <div className="glass-card rounded-3xl border border-paper-300 dark:border-ink-800 shadow-md flex flex-col h-[600px] overflow-hidden animate-fade-up">
          <div className="p-6 bg-paper-50 dark:bg-ink-800/85 border-b border-paper-100 dark:border-ink-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-ink-900 dark:text-white">StudyMate AI Tutor</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ask any question based on this study note</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {(!aiResults.chatHistory || aiResults.chatHistory.length === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-ink-800 dark:text-paper-300">Ask me anything about this note!</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mt-1">
                  Example: "Explain the main concept in simple words" or "What are the practical applications?"
                </p>
              </div>
            ) : (
              aiResults.chatHistory.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-violet-600 text-white rounded-br-xs'
                        : 'bg-paper-100 dark:bg-ink-800 text-ink-800 dark:text-paper-300 rounded-bl-xs border border-paper-300 dark:border-ink-700'
                    }`}
                  >
                    <Markdown>{msg.text}</Markdown>
                  </div>
                </div>
              ))
            )}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="bg-paper-100 dark:bg-ink-800 border border-paper-300 dark:border-ink-700 rounded-2xl px-5 py-3.5 text-sm text-slate-500 dark:text-slate-400 rounded-bl-xs animate-pulse flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400 animate-spin" />
                  <span>StudyMate AI is thinking...</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-4 bg-paper-50 dark:bg-ink-800/85 border-t border-paper-100 dark:border-ink-800 flex gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question about this note..."
              className="flex-1 px-4 py-3 glass-card border border-paper-300 dark:border-ink-700 rounded-2xl text-ink-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <button
              type="submit"
              disabled={chatLoading || !chatInput.trim()}
              className="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <span>Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

