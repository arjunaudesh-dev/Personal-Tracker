import React from 'react';
import type { Toast } from '../store/store';
import { cx } from '../lib/utils';

export const Toasts: React.FC<{ toasts: Toast[] }> = ({ toasts }) => {
  if (!toasts.length) return null;
  return (
    <div className="toasts" role="status" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className="toast">
          <span className={cx('dot', t.tone === 'warn' ? '' : t.tone === 'ok' ? 'done' : '')} />
          {t.text}
        </div>
      ))}
    </div>
  );
};
