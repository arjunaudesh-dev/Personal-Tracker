import React, { useState } from 'react';
import { Send, Phone, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { MindMapTaskNode, TaskContact } from '@/types/mindmap';
import { generateWhatsAppLink } from '@/lib/utils';

interface PeopleWhatsAppTabProps {
  task: MindMapTaskNode;
  onUpdate: (updated: Partial<MindMapTaskNode>) => void;
}

export function PeopleWhatsAppTab({ task, onUpdate }: PeopleWhatsAppTabProps) {
  const contacts = task.contacts || [];
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');
  const [customMsg, setCustomMsg] = useState(
    `Sir, status update regarding Task: ${task.title}. Current progress is ${task.progress}%.`
  );

  const addContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    const newContact: TaskContact = {
      id: `c_${Date.now()}`,
      name: name.trim(),
      role: role.trim() || 'Site Coordinator',
      phone: phone.trim(),
      whatsapp: phone.trim(),
    };
    onUpdate({ contacts: [...contacts, newContact] });
    setName('');
    setRole('');
    setPhone('');
  };

  const removeContact = (id: string) => {
    onUpdate({ contacts: contacts.filter((c: any) => c.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div className="bg-slate-850 p-2.5 rounded-lg border border-white/5">
        <label className="text-xs text-slate-300 font-semibold block mb-1">
          WhatsApp Dispatch Message Template
        </label>
        <textarea
          rows={2}
          value={customMsg}
          onChange={(e) => setCustomMsg(e.target.value)}
          className="w-full bg-slate-800 text-slate-200 border border-white/10 rounded p-2 text-xs focus:ring-1 focus:ring-emerald-400"
        />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold text-white uppercase tracking-wider">
          Assigned Stakeholders & Contractors ({contacts.length})
        </span>

        {contacts.map((c) => {
          const waUrl = generateWhatsAppLink(c.phone, customMsg);
          return (
            <div
              key={c.id || c.name}
              className="flex items-center justify-between p-2.5 bg-slate-800/80 rounded-lg border border-white/5 text-xs"
            >
              <div>
                <div className="font-bold text-white">{c.name}</div>
                <div className="text-[11px] text-slate-400">{c.role} • {c.phone}</div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-2.5 py-1 rounded transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </a>
                <button
                  type="button"
                  onClick={() => removeContact(c.id || '')}
                  className="text-slate-500 hover:text-rose-400 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Contact Form */}
      <form onSubmit={addContact} className="bg-slate-850 p-3 rounded-lg border border-white/5 space-y-2">
        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5 text-emerald-400" /> Link Personnel / Officer
        </span>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Officer Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs"
          />
          <input
            type="text"
            placeholder="Role / Title"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs"
          />
          <input
            type="text"
            placeholder="Phone e.g. +94771234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="col-span-2 bg-slate-800 text-slate-200 border border-white/10 rounded px-2 py-1 text-xs"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-1.5 rounded text-xs"
        >
          Add to Task CRM
        </button>
      </form>
    </div>
  );
}
