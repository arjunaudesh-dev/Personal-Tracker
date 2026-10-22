import React, { useState } from 'react';
import type { SystemType, Universe, UniverseKind } from '../types';
import { universeKindLabel } from '../data/seed';
import { cx } from '../lib/utils';
import { IconClose } from './icons';

const PALETTE: Array<{ accent: string; accent2: string }> = [
  { accent: '#f5c451', accent2: '#ff9d5c' },
  { accent: '#4ade80', accent2: '#22d3ee' },
  { accent: '#60a5fa', accent2: '#818cf8' },
  { accent: '#c084fc', accent2: '#f472b6' },
  { accent: '#fb7185', accent2: '#f43f5e' },
  { accent: '#22d3ee', accent2: '#38bdf8' },
  { accent: '#a3e635', accent2: '#34d399' },
  { accent: '#fb923c', accent2: '#f59e0b' },
];

const GLYPHS = ['▦', '✚', '◈', '✦', '⬢', '◐', '✧', '⟡', '❖', '⌘'];
const KINDS: UniverseKind[] = ['civil', 'health', 'finance', 'personal', 'career', 'custom'];

const SYSTEMS: Array<{ id: SystemType; label: string; hint: string }> = [
  { id: 'mind', label: 'Mind map', hint: 'Left-to-right branches' },
  { id: 'network', label: 'Network', hint: 'Consistent pills with links' },
  { id: 'concept', label: 'Concept', hint: 'Labelled relationships' },
  { id: 'hybrid', label: 'Hybrid', hint: 'All three combined' },
];

interface Values {
  name: string;
  tagline: string;
  kind: UniverseKind;
  accent: string;
  accent2: string;
  glyph: string;
  system: SystemType;
}

interface Props {
  mode: 'create' | 'edit';
  universe?: Universe;
  onClose: () => void;
  onSubmit: (values: Values) => void;
}

export const UniverseModal: React.FC<Props> = ({ mode, universe, onClose, onSubmit }) => {
  const [values, setValues] = useState<Values>({
    name: universe?.name ?? '',
    tagline: universe?.tagline ?? 'A fresh universe of tasks',
    kind: universe?.kind ?? 'custom',
    accent: universe?.accent ?? '#c084fc',
    accent2: universe?.accent2 ?? '#f472b6',
    glyph: universe?.glyph ?? '✦',
    system: universe?.system ?? 'mind',
  });

  const set = <K extends keyof Values>(key: K, value: Values[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!values.name.trim()) return;
    onSubmit({ ...values, name: values.name.trim(), tagline: values.tagline.trim() || 'A universe of tasks' });
  };

  return (
    <div
      className="modal-scrim"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <form className="modal" onSubmit={submit} aria-label={mode === 'create' ? 'Create universe' : 'Edit universe'}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span className="preview-orb" style={{ ['--p-acc' as string]: values.accent, ['--p-acc2' as string]: values.accent2 }}>
            {values.glyph}
          </span>
          <div style={{ flex: 1 }}>
            <h2>{mode === 'create' ? 'New universe profile' : 'Universe settings'}</h2>
            <p className="sub">
              {mode === 'create'
                ? 'Each profile is its own mind map, its own tasks and its own budget — link them whenever they touch.'
                : 'Rename, recolour or change the default graph system for this universe.'}
            </p>
          </div>
          <button type="button" className="iconbtn" onClick={onClose} aria-label="Close">
            <IconClose size={15} />
          </button>
        </div>

        <div className="formgrid">
          <div className="fieldblock">
            <span className="flabel">Universe name</span>
            <input
              className="input"
              autoFocus
              value={values.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="e.g. House Build, Health, Startup, Thesis"
              required
            />
          </div>

          <div className="fieldblock">
            <span className="flabel">Tagline</span>
            <input
              className="input"
              value={values.tagline}
              onChange={(e) => set('tagline', e.target.value)}
              placeholder="What is this universe for?"
            />
          </div>

          <div className="row2">
            <div className="fieldblock">
              <span className="flabel">Category</span>
              <select
                className="select"
                style={{ height: 34, width: '100%' }}
                value={values.kind}
                onChange={(e) => set('kind', e.target.value as UniverseKind)}
              >
                {KINDS.map((k) => (
                  <option key={k} value={k}>
                    {universeKindLabel[k]}
                  </option>
                ))}
              </select>
            </div>
            <div className="fieldblock">
              <span className="flabel">Default system</span>
              <select
                className="select"
                style={{ height: 34, width: '100%' }}
                value={values.system}
                onChange={(e) => set('system', e.target.value as SystemType)}
              >
                {SYSTEMS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="fieldblock">
            <span className="flabel">Accent</span>
            <div className="accents">
              {PALETTE.map((p) => (
                <button
                  key={p.accent}
                  type="button"
                  className={cx(values.accent === p.accent && 'on')}
                  style={{ background: `linear-gradient(140deg, ${p.accent}, ${p.accent2})` }}
                  onClick={() => {
                    set('accent', p.accent);
                    set('accent2', p.accent2);
                  }}
                  aria-label={`Accent ${p.accent}`}
                />
              ))}
            </div>
          </div>

          <div className="fieldblock">
            <span className="flabel">Glyph</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {GLYPHS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => set('glyph', g)}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    border: '1px solid var(--line)',
                    background:
                      values.glyph === g
                        ? `color-mix(in srgb, ${values.accent} 22%, transparent)`
                        : 'rgba(255,255,255,0.02)',
                    color: values.glyph === g ? values.accent : 'var(--muted)',
                    fontSize: 14,
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: 12,
              padding: '10px 12px',
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              background: `radial-gradient(120% 140% at 0% 0%, color-mix(in srgb, ${values.accent} 14%, transparent), transparent 60%)`,
            }}
          >
            <span className="dot" style={{ background: values.accent }} />
            <div style={{ fontSize: 10.5, color: 'var(--muted)', lineHeight: 1.5 }}>
              <b style={{ color: 'var(--text)' }}>{values.system === 'mind' ? 'Mind map' : values.system === 'network' ? 'Network map' : values.system === 'concept' ? 'Concept map' : 'Hybrid system'}</b>
              {' · '}
              {SYSTEMS.find((s) => s.id === values.system)?.hint}. You can switch systems per view any time.
            </div>
          </div>
        </div>

        <div className="modal-foot">
          <button type="button" className="btn ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn primary" disabled={!values.name.trim()}>
            {mode === 'create' ? 'Create universe' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
