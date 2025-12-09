import React from 'react';
import { FileCheck, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileInfoProps {
  fileName: string;
  pageCount?: number;
  onRemove?: () => void;
  className?: string;
}

export const FileInfo: React.FC<FileInfoProps> = ({
  fileName,
  pageCount,
  onRemove,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-4 rounded-xl bg-secondary/10 border border-secondary/30 animate-slide-up",
        className
      )}
    >
      <div className="w-10 h-10 rounded-lg gradient-bg-secondary flex items-center justify-center flex-shrink-0">
        <FileCheck className="w-5 h-5 text-secondary-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{fileName}</p>
        {pageCount !== undefined && (
          <p className="text-sm text-muted-foreground">共 {pageCount} 頁</p>
        )}
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
        </button>
      )}
    </div>
  );
};
