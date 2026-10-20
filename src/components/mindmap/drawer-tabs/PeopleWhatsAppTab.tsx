'use client';

import { MessageCircle, Phone, Plus, UserRound, Trash2 } from 'lucide-react';
import { useState } from 'react';

import type { MindMapTaskNode } from '@/lib/types/mindmap';
import { useNexus } from '@/store/nexus-store';
import { uid, waLink } from '@/lib/parser/utils';

/** Tab 4 — contact CRM with one-click WhatsApp deep links. */
export function PeopleWhatsAppTab({ task }: { task: MindMapTaskNode }) {
  const { dispatch } = useNexus();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [phone, setPhone] = useState('');

  const addContact = () => {
    if (!name.trim() || !phone.trim()) return;
    dispatch({
      type: 'update-task',
      id: task.id,
      patch: {
        contacts: [
          ...task.contacts,
          { id: uid('ct'), name: name.trim(), role: role.trim() || 'Contact', phone: phone.trim() },
        ],
      },
    });
    setName('');
    setRole('');
    setPhone('');
  };

  const removeContact = (id: string) => {
    dispatch({
      type: 'update-task',
      id: task.id,
      patch: { contacts: task.contacts.filter((c) => c.id !== id) },
    });
  };

  const message = `Hi ${name || 'there'} — update on "${task.title}": ${task.markdownNotes.slice(0, 120) || 'please review the latest task state.'}`;

  return (
    <div className="space-y-4">
      <section>
        <p className="label-caps mb-2">Linked personnel ({task.contacts.length})</p>
        {task.contacts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center text-[11px] text-slate-600">
            No contacts linked — add site personnel, suppliers or approvers below.
          </div>
        ) : (
          <ul className="space-y-1.5">
            {task.contacts.map((contact) => (
              <li
                key={contact.id}
                className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3 py-2.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] text-nexus-cyan">
                  <UserRound className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11.5px] font-medium text-slate-200">{contact.name}</p>
                  <p className="truncate text-[10px] text-slate-500">
                    {contact.role} · <span className="font-mono">{contact.phone}</span>
                  </p>
                </div>
                <a
                  href={waLink(contact.phone, message)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn h-7 w-7 p-0 text-nexus-emerald"
                  title="Send WhatsApp update"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </a>
                <a
                  href={`tel:${contact.phone}`}
                  className="btn btn-ghost h-7 w-7 p-0"
                  title="Call"
                >
                  <Phone className="h-3.5 w-3.5" />
                </a>
                <button
                  onClick={() => removeContact(contact.id)}
                  className="btn btn-ghost h-7 w-7 p-0 text-slate-600 hover:text-nexus-rose"
                  aria-label="Remove contact"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="glass-soft p-3">
        <p className="label-caps mb-2">Add contact</p>
        <div className="grid grid-cols-2 gap-1.5">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="input"
          />
          <input
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Role / organisation"
            className="input"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone (94…)"
            className="input col-span-2"
          />
          <button onClick={addContact} className="btn btn-primary col-span-2">
            <Plus className="h-3 w-3" />
            Link contact
          </button>
        </div>
      </section>
    </div>
  );
}
