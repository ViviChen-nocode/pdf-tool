import React from 'react';
import { Image, Trash2 } from 'lucide-react';
import { Button } from './ui/button';

interface ReplaceRuleItemProps {
  pageNum: number;
  fileName: string;
  onRemove: () => void;
}

export const ReplaceRuleItem: React.FC<ReplaceRuleItemProps> = ({
  pageNum,
  fileName,
  onRemove,
}) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border/50 animate-slide-up hover:bg-muted/70 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Image className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">第 {pageNum} 頁</p>
          <p className="text-sm text-muted-foreground truncate max-w-[200px]">
            {fileName}
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};
