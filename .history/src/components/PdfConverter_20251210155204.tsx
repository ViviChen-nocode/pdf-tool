import React, { useState, useCallback, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { UploadZone } from './UploadZone';
import { FileInfo } from './FileInfo';
import { ProgressBar } from './ProgressBar';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Sparkles, ArrowRight } from 'lucide-react';

// 設定 PDF.js Worker
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

interface PDFState {
  pdf: pdfjs.PDFDocumentProxy | null;
  fileName: string;
  pageCount: number;
}

interface PdfConverterProps {
  onNextStep?: () => void;
}

export const PdfConverter: React.FC<PdfConverterProps> = ({ onNextStep }) => {
  const [pdfState, setPdfState] = useState<PDFState>({ pdf: null, fileName: '', pageCount: 0 });
  const [scale, setScale] = useState('3');
  const [pageRange, setPageRange] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('請上傳 PDF 檔案');
      return;
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument(arrayBuffer).promise;
      
      setPdfState({
        pdf,
        fileName: file.name,
        pageCount: pdf.numPages,
      });
    } catch (error) {
      console.error(error);
      alert('無法讀取此 PDF，檔案可能損毀。');
    }
  }, []);

  const parsePageRange = useCallback((input: string, maxPage: number): number[] => {
    const pages = new Set<number>();
    const parts = input.split(',');
    
    parts.forEach(part => {
      part = part.trim();
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            if (i >= 1 && i <= maxPage) pages.add(i);
          }
        }
      } else {
        const num = Number(part);
        if (!isNaN(num) && num >= 1 && num <= maxPage) pages.add(num);
      }
    });
    return Array.from(pages).sort((a, b) => a - b);
  }, []);

  const handleConvert = useCallback(async () => {
    if (!pdfState.pdf) return;
    
    setIsProcessing(true);
    setProgress(0);
    
    const scaleValue = parseFloat(scale);
    let pagesToProcess: number[] = [];
    
    if (!pageRange.trim()) {
      for (let i = 1; i <= pdfState.pageCount; i++) pagesToProcess.push(i);
    } else {
      pagesToProcess = parsePageRange(pageRange, pdfState.pageCount);
    }

    if (pagesToProcess.length === 0) {
      alert('頁數範圍無效，請檢查輸入。');
      setIsProcessing(false);
      return;
    }

    const zip = new JSZip();
    const originalName = pdfState.fileName.replace('.pdf', '');
    const padLength = pdfState.pageCount >= 100 ? 3 : 2;

    try {
      for (let i = 0; i < pagesToProcess.length; i++) {
        const pageNum = pagesToProcess[i];
        setStatus(`正在處理第 ${pageNum} 頁... (${i + 1}/${pagesToProcess.length})`);
        
        const page = await pdfState.pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: scaleValue });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport }).promise;

        const blob = await new Promise<Blob>((resolve) => 
          canvas.toBlob((b) => resolve(b!), 'image/png')
        );
        
        const fileName = `${originalName}-${String(pageNum).padStart(padLength, '0')}.png`;
        zip.file(fileName, blob);

        page.cleanup();
        canvas.width = 0;
        canvas.height = 0;
        
        const percent = Math.round(((i + 1) / pagesToProcess.length) * 100);
        setProgress(percent);
      }

      setStatus('正在打包 ZIP...');
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${originalName}_images.zip`);
      
      setStatus('完成！下載已開始。');
    } catch (err: any) {
      console.error(err);
      alert('轉檔過程發生錯誤：' + err.message);
      setStatus('處理失敗');
    } finally {
      setIsProcessing(false);
    }
  }, [pdfState, scale, pageRange, parsePageRange]);

  const handleReset = useCallback(() => {
    setPdfState({ pdf: null, fileName: '', pageCount: 0 });
    setProgress(0);
    setStatus('');
  }, []);

  return (
    <div className="space-y-6 p-6">
      <UploadZone
        onFileSelect={handleFileSelect}
        accept="application/pdf"
        icon="pdf"
        title="點擊或拖曳上傳 PDF 檔案"
        subtitle="支援任意大小的 PDF 文件"
      />

      {pdfState.pdf && (
        <div className="space-y-6 animate-slide-up">
          <FileInfo
            fileName={pdfState.fileName}
            pageCount={pdfState.pageCount}
            onRemove={handleReset}
          />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resolution" className="text-sm font-medium">
                解析度選擇
              </Label>
              <Select value={scale} onValueChange={setScale}>
                <SelectTrigger id="resolution" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1x - 螢幕預覽用 (72 DPI)</SelectItem>
                  <SelectItem value="2">2x - 一般設計用 (144 DPI)</SelectItem>
                  <SelectItem value="3">3x - 印刷/高畫質修圖 (約 216 DPI)</SelectItem>
                  <SelectItem value="4">4x - 極致畫質 (注意記憶體)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pageRange" className="text-sm font-medium">
                頁數範圍
              </Label>
              <Input
                id="pageRange"
                value={pageRange}
                onChange={(e) => setPageRange(e.target.value)}
                placeholder="例如: 1-16 (預設全選)"
              />
              <p className="text-xs text-muted-foreground">
                支援格式：1-5, 8, 11-13。留空則轉換全部頁面。
              </p>
            </div>

            <Button
              onClick={handleConvert}
              disabled={isProcessing}
              size="lg"
              className="w-full"
            >
              <Sparkles className="w-5 h-5" />
              {isProcessing ? '處理中...' : '開始轉換並下載 ZIP'}
            </Button>

            {/* Next Step Button */}
            {status === '完成！下載已開始。' && onNextStep && (
              <Button
                onClick={onNextStep}
                variant="outline"
                size="lg"
                className="w-full gap-2 border-primary/50 text-primary hover:bg-primary/10"
              >
                <span className="flex flex-col items-center leading-tight">
                  <span>第二步：外部編輯</span>
                </span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            )}
          </div>

          {(isProcessing || progress > 0) && (
            <ProgressBar progress={progress} status={status} />
          )}
        </div>
      )}
    </div>
  );
};
