import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number;
  status: string;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status,
  className,
}) => {
  return (
    <div className={cn("space-y-3 animate-slide-up", className)}>
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 gradient-bg-primary rounded-full transition-all duration-300 ease-out progress-bar-shine"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-sm text-center text-muted-foreground font-medium">
        {status}
      </p>
    </div>
  );
};
