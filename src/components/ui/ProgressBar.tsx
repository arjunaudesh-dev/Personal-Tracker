import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={cn('h-1.5 w-full overflow-hidden rounded-full bg-white/10', className)}>
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400"
        initial={false}
        animate={{ width: `${v}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}
