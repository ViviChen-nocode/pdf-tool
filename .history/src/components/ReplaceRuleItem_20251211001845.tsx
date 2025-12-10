import React from 'react';
import { ArrowRight, Trash2 } from 'lucide-react';
import { Button } from './ui/button';

interface ReplaceRuleItemProps {
  pageNum: number;
  fileName: string;
  originalPreview?: string;
  newPreview?: string;
  onRemove: () => void;
}

export const ReplaceRuleItem: React.FC<ReplaceRuleItemProps> = ({
  pageNum,
  fileName,
  originalPreview,
  newPreview,
  onRemove,
}) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50 animate-slide-up hover:bg-muted/70 transition-colors">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Page Number Badge */}
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <span className="text-sm font-bold text-primary">{pageNum}</span>
        </div>

        {/* Thumbnails Comparison */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Original Page Thumbnail */}
          <div className="flex-shrink-0 w-16 h-10 rounded-md overflow-hidden bg-black border border-border/50">
            {originalPreview ? (
              <img 
                src={originalPreview} 
                alt={`原始第 ${pageNum} 頁`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                原始
              </div>
            )}
          </div>

          {/* Arrow */}
          <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />

          {/* New Image Thumbnail */}
          <div className="flex-shrink-0 w-16 h-10 rounded-md overflow-hidden bg-black border-2 border-secondary/50">
            {newPreview ? (
              <img 
                src={newPreview} 
                alt="新圖片"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                新圖
              </div>
            )}
          </div>

          {/* File Name */}
          <p className="text-xs text-muted-foreground truncate ml-2 hidden sm:block">
            {fileName}
          </p>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0 ml-2"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};