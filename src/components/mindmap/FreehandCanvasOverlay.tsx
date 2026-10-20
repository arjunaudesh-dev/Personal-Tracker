import React, { useRef, useState, useEffect } from 'react';
import { Eraser, RotateCcw } from 'lucide-react';

interface FreehandCanvasOverlayProps {
  isActive: boolean;
}

export function FreehandCanvasOverlay({ isActive }: FreehandCanvasOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#38bdf8');
  const [lineWidth, setLineWidth] = useState(3);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
    canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
  }, [isActive]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isActive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
  };

  if (!isActive) return null;

  return (
    <div className="absolute inset-0 z-30 pointer-events-auto">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-sky-500/40 shadow-xl">
        <span className="text-[11px] font-bold text-sky-400 font-mono">CAD MARKUP ACTIVE</span>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
        />
        <button
          type="button"
          onClick={clearCanvas}
          className="p-1 rounded text-slate-400 hover:text-white"
          title="Clear Annotations"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="w-full h-full cursor-crosshair"
      />
    </div>
  );
}
