import React, { useState } from 'react';
import { Paperclip, Plus, Trash2, ExternalLink, FileText } from 'lucide-react';
import { MindMapTaskNode, TaskAttachment } from '@/types/mindmap';

interface DocsAttachmentsTabProps {
  task: MindMapTaskNode;
  onUpdate: (updated: Partial<MindMapTaskNode>) => void;
}

export function DocsAttachmentsTab({ task, onUpdate }: DocsAttachmentsTabProps) {
  const attachments = task.attachments || [];
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<'blueprint' | 'pdf' | 'doc' | 'image'>('blueprint');

  const addAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    const item: TaskAttachment = {
      id: `att_${Date.now()}`,
      name: name.trim(),
      url: url.trim(),
      type,
      size: '2.4 MB',
    };
    onUpdate({ attachments: [...attachments, item] });
    setName('');
    setUrl('');
  };

  const removeAttachment = (id: string) => {
    onUpdate({ attachments: attachments.filter((a) => a.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <span className="text-xs font-semibold text-white uppercase tracking-wider">
          Attached Drawings & Blueprint Files ({attachments.length})
        </span>

        {attachments.map((att) => (
          <div
            key={att.id}
            className="flex items-center justify-between p-2.5 bg-slate-800/60 rounded-lg border border-white/5 text-xs"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <div>
                <div className="font-bold text-white">{att.name}</div>
                <div className="text-[10px] text-slate-400 uppercase font-mono">
                  {att.type} • {att.size || 'External'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1 text-slate-400 hover:text-sky-400"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="p-1 text-slate-500 hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={addAttachment} className="bg-slate-850 p-3 rounded-lg border border-white/5 space-y-2">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
          <Paperclip className="w-3.5 h-3.5 text-sky-400" /> Link Blueprint / CAD File
        </span>
        <input
          type="text"
          placeholder="Drawing / Document Title (e.g. Slab Rebar Cross-Section DWG)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs"
        />
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="URL or cloud drive link..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs"
          />
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs"
          >
            <option value="blueprint">Blueprint</option>
            <option value="pdf">PDF</option>
            <option value="doc">Doc</option>
            <option value="image">Image</option>
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-sky-600 hover:bg-sky-500 text-white font-semibold py-1.5 rounded text-xs"
        >
          Attach File Reference
        </button>
      </form>
    </div>
  );
}
