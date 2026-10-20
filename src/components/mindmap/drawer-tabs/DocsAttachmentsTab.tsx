'use client';

import { FileImage, FileUp, Paperclip, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';

import type { MindMapTaskNode } from '@/lib/types/mindmap';
import { useNexus } from '@/store/nexus-store';
import { cn } from '@/lib/parser/utils';

/** Tab 2b — basic attachment uploader with blueprint lightbox. */
export function DocsAttachmentsTab({ task }: { task: MindMapTaskNode }) {
  const { dispatch } = useNexus();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const onFiles = (files: FileList | null) => {
    if (!files) return;
    const names = Array.from(files).map((f) => f.name);
    dispatch({
      type: 'update-task',
      id: task.id,
      patch: { attachments: [...task.attachments, ...names] },
    });
  };

  const remove = (name: string) => {
    dispatch({
      type: 'update-task',
      id: task.id,
      patch: { attachments: task.attachments.filter((a) => a !== name) },
    });
  };

  return (
    <div className="space-y-4">
      <button
        onClick={() => inputRef.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-4 py-8 transition-colors hover:border-nexus-cyan/40 hover:bg-white/[0.04]"
      >
        <FileUp className="h-6 w-6 text-nexus-cyan" />
        <p className="text-[11.5px] font-medium text-slate-200">Attach drawings, reports or photos</p>
        <p className="text-[10px] text-slate-500">PDF · DWG · PNG · JPG — stored against this task</p>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />

      {task.attachments.length > 0 ? (
        <ul className="space-y-1.5">
          {task.attachments.map((file) => {
            const isImage = /\.(png|jpe?g|webp|gif)$/i.test(file);
            return (
              <li
                key={file}
                className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5"
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border',
                    isImage
                      ? 'border-nexus-violet/30 bg-nexus-violet/10 text-nexus-violet'
                      : 'border-nexus-sky/30 bg-nexus-sky/10 text-nexus-sky',
                  )}
                >
                  {isImage ? <FileImage className="h-3.5 w-3.5" /> : <Paperclip className="h-3.5 w-3.5" />}
                </span>
                <span className="min-w-0 flex-1 truncate text-[11px] text-slate-300">{file}</span>
                {isImage ? (
                  <button onClick={() => setPreview(file)} className="btn h-6 px-2 text-[9px]">
                    Inspect
                  </button>
                ) : null}
                <button
                  onClick={() => remove(file)}
                  className="btn btn-ghost h-6 w-6 p-0 text-slate-600 hover:text-nexus-rose"
                  aria-label="Remove attachment"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {preview ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-ink-950/85 p-6 backdrop-blur"
          onClick={() => setPreview(null)}
        >
          <div className="glass max-h-full max-w-3xl overflow-auto p-4">
            <p className="mb-3 text-xs font-semibold text-slate-200">{preview}</p>
            <div className="flex aspect-video items-center justify-center rounded-xl border border-white/10 bg-ink-900">
              <FileImage className="h-12 w-12 text-slate-700" />
              <p className="ml-3 text-[11px] text-slate-500">
                Blueprint viewer placeholder — connect the document store to stream the original.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
