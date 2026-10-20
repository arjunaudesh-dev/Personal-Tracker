import React from 'react';
import { X, ZoomIn, Download } from 'lucide-react';

interface ImageLightboxModalProps {
  imageUrl: string | null;
  title: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightboxModal({
  imageUrl,
  title,
  isOpen,
  onClose,
}: ImageLightboxModalProps) {
  if (!isOpen || !imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative max-w-4xl w-full bg-slate-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        <div className="flex items-center justify-between p-3.5 bg-slate-950 border-b border-white/10">
          <div className="flex items-center gap-2">
            <ZoomIn className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-white font-mono">{title}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex items-center justify-center bg-slate-950/40 min-h-[400px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[70vh] max-w-full object-contain rounded-lg border border-white/5"
          />
        </div>
      </div>
    </div>
  );
}
