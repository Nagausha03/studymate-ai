import React, { useState, useEffect } from 'react';
import { Note } from '../types';
import { X, Upload, FileText, Sparkles, Check } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

async function extractTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pageTexts: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    pageTexts.push(pageText.trim());
  }

  return pageTexts.join('\n\n').trim();
}

interface NoteFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (noteData: { title: string; subject: string; content: string; fileName?: string }, editingId?: string) => void;
  editingNote?: Note | null;
  userId: string;
}

export const NoteFormModal: React.FC<NoteFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingNote,
  userId
}) => {
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [fileName, setFileName] = useState<string | undefined>();
  const [loadingFile, setLoadingFile] = useState(false);

  useEffect(() => {
    if (editingNote) {
      setTitle(editingNote.title);
      setSubject(editingNote.subject);
      setContent(editingNote.content);
      setFileName(editingNote.fileName);
    } else {
      setTitle('');
      setSubject('');
      setContent('');
      setFileName(undefined);
    }
  }, [editingNote, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoadingFile(true);
    setFileName(file.name);

    if (!title) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExt);
    }

    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      try {
        const text = await extractTextFromPdf(file);
        if (text) {
          setContent(text);
        } else {
          alert("No selectable text was found in this PDF (it may be a scanned/image-only document). Please paste the content manually.");
        }
      } catch (err) {
        console.error("Failed to extract PDF text:", err);
        alert("Failed to read the PDF. Please try another file or paste the content manually.");
      } finally {
        setLoadingFile(false);
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setContent(text);
      }
      setLoadingFile(false);
    };
    reader.onerror = () => {
      alert("Failed to read file");
      setLoadingFile(false);
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim() || !content.trim()) return;

    onSave(
      {
        title: title.trim(),
        subject: subject.trim(),
        content: content.trim(),
        fileName
      },
      editingNote ? editingNote.id : undefined
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="glass-card rounded-2xl shadow-2xl max-w-2xl w-full border border-paper-100 dark:border-ink-800 overflow-hidden my-8">
        <div className="px-6 py-4 bg-paper-50 dark:bg-ink-800 border-b border-paper-100 dark:border-ink-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-lg text-ink-900 dark:text-white">
              {editingNote ? 'Edit Study Note' : 'Upload & Create Study Note'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-paper-300 dark:hover:bg-ink-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {!editingNote && (
            <div className="p-4 bg-violet-50/60 dark:bg-violet-950/40 rounded-xl border border-violet-100 dark:border-violet-900/60">
              <label className="block text-xs font-bold uppercase text-violet-900 dark:text-violet-300 mb-2">
                Upload File (.txt, .pdf) or Paste Below
              </label>
              <label className="border-2 border-dashed border-violet-200 dark:border-violet-800 hover:border-violet-400 dark:hover:border-violet-600 bg-white dark:bg-ink-800 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors group">
                <Upload className="w-6 h-6 text-violet-500 dark:text-violet-400 mb-1 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium text-ink-700 dark:text-paper-300">
                  {fileName ? fileName : 'Click to browse or drag & drop files'}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Supports .txt and .pdf documents</span>
                <input
                  type="file"
                  accept=".txt,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Note Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Chapter 4: Photosynthesis"
                className="w-full px-4 py-2.5 bg-paper-50 dark:bg-ink-800 border border-paper-300 dark:border-ink-700 rounded-xl text-ink-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">Subject / Category *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Biology"
                className="w-full px-4 py-2.5 bg-paper-50 dark:bg-ink-800 border border-paper-300 dark:border-ink-700 rounded-xl text-ink-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Note Content *</label>
              <span className="text-xs text-slate-400 dark:text-slate-500">{content.length} characters</span>
            </div>
            <textarea
              required
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste your lecture notes, study guide, or document content here..."
              className="w-full p-4 bg-paper-50 dark:bg-ink-800 border border-paper-300 dark:border-ink-700 rounded-xl text-ink-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-paper-100 dark:border-ink-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-paper-300 dark:border-ink-700 text-ink-700 dark:text-slate-300 font-semibold text-sm hover:bg-paper-50 dark:hover:bg-ink-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loadingFile}
              className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-violet-200 dark:shadow-none transition-all flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{editingNote ? 'Save Changes' : 'Upload & Create'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

