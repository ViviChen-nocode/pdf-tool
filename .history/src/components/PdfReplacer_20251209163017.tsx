import React, { useState, useCallback, useRef } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { PDFDocument, rgb } from 'pdf-lib';
import { saveAs } from 'file-saver';
import { UploadZone } from './UploadZone';
import { FileInfo } from './FileInfo';
import { ProgressBar } from './ProgressBar';
import { ReplaceRuleItem } from './ReplaceRuleItem';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { ImagePlus, Replace, AlertCircle, CheckCircle } from 'lucide-react';

// 設定 PDF.js Worker
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

interface ReplaceRule {
  pageNum: number;
  imageData: ArrayBuffer;
  fileName: string;
}

interface ImageCheckResult {
  status: 'idle' | 'checking' | 'perfect' | 'warning';
  message: string;
}

export const PdfReplacer: React.FC = () => {
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);
  const [pdfInfo, setPdfInfo] = useState({ fileName: '', pageCount: 0 });
  const [replaceRules, setReplaceRules] = useState<ReplaceRule[]>([]);
  const [targetPage, setTargetPage] = useState('');
  const [tempImage, setTempImage] = useState<{ data: ArrayBuffer; name: string } | null>(null);
  const [imageCheck, setImageCheck] = useState<ImageCheckResult>({ status: 'idle', message: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('');
  
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handlePdfSelect = useCallback(async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      setPdfData(arrayBuffer);
      
      const pdf = await pdfjs.getDocument(arrayBuffer.slice(0)).promise;
      setPdfInfo({
        fileName: file.name,
        pageCount: pdf.numPages,
      });
      
      setReplaceRules([]);
    } catch (error) {
      console.error(error);
      alert('無法讀取此 PDF');
    }
  }, []);

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageCheck({ status: 'checking', message: '檢查圖片中...' });
    
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    
    img.onload = () => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const ratio = width / height;
      
      const isRatioPerfect = ratio >= 1.76 && ratio <= 1.79;
      const isLowRes = width < 1920;
      
      const reader = new FileReader();
      reader.onload = (evt) => {
        setTempImage({
          data: evt.target?.result as ArrayBuffer,
          name: file.name,
        });
      };
      reader.readAsArrayBuffer(file);
      
      if (isRatioPerfect && !isLowRes) {
        setImageCheck({
          status: 'perfect',
          message: `完美！圖片符合 16:9 高畫質標準 (${width}x${height})`,
        });
      } else {
        let msg = '';
        if (isLowRes) msg += `解析度較低 (${width}x${height})。`;
        if (!isRatioPerfect) msg += `比例非 16:9，系統將自動補黑邊以維持畫面完整。`;
        setImageCheck({ status: 'warning', message: msg });
      }
      
      URL.revokeObjectURL(objectUrl);
    };
    img.src = objectUrl;
  }, []);

  const handleAddRule = useCallback(() => {
    const pageNum = parseInt(targetPage);
    
    if (!pageNum || pageNum < 1) {
      alert('請輸入有效的頁碼');
      return;
    }
    
    if (!tempImage) {
      alert('請先選擇圖片');
      return;
    }

    setReplaceRules(prev => {
      const existingIndex = prev.findIndex(r => r.pageNum === pageNum);
      if (existingIndex >= 0) {
        if (!confirm(`第 ${pageNum} 頁已有設定，要覆蓋嗎？`)) return prev;
        const newRules = [...prev];
        newRules.splice(existingIndex, 1);
        return [...newRules, { pageNum, imageData: tempImage.data, fileName: tempImage.name }]
          .sort((a, b) => a.pageNum - b.pageNum);
      }
      return [...prev, { pageNum, imageData: tempImage.data, fileName: tempImage.name }]
        .sort((a, b) => a.pageNum - b.pageNum);
    });

    setTargetPage('');
    setTempImage(null);
    setImageCheck({ status: 'idle', message: '' });
    if (imageInputRef.current) imageInputRef.current.value = '';
  }, [targetPage, tempImage]);

  const handleRemoveRule = useCallback((index: number) => {
    setReplaceRules(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleExecuteReplace = useCallback(async () => {
    if (!pdfData || replaceRules.length === 0) return;
    
    setIsProcessing(true);
    setStatus('載入 PDF 中...');

    try {
      const pdfDoc = await PDFDocument.load(pdfData);
      const totalPages = pdfDoc.getPageCount();

      for (const rule of replaceRules) {
        if (rule.pageNum > totalPages) {
          throw new Error(`頁碼 ${rule.pageNum} 超出範圍 (總頁數 ${totalPages})`);
        }
      }

      setStatus('正在替換頁面...');

      for (const rule of replaceRules) {
        let image;
        
        try {
          image = await pdfDoc.embedPng(rule.imageData);
        } catch {
          image = await pdfDoc.embedJpg(rule.imageData);
        }

        const pageIndex = rule.pageNum - 1;
        const page = pdfDoc.getPage(pageIndex);
        
        const { width: pageWidth, height: pageHeight } = page.getSize();
        
        page.drawRectangle({
          x: 0,
          y: 0,
          width: pageWidth,
          height: pageHeight,
          color: rgb(0, 0, 0),
        });

        const imgDims = image.scale(1);
        const widthScale = pageWidth / imgDims.width;
        const heightScale = pageHeight / imgDims.height;
        const scale = Math.min(widthScale, heightScale);

        const finalWidth = imgDims.width * scale;
        const finalHeight = imgDims.height * scale;
        
        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;

        page.drawImage(image, {
          x,
          y,
          width: finalWidth,
          height: finalHeight,
        });
      }

      setStatus('產生新檔案中...');
      const pdfBytes = await pdfDoc.save();
      
      const originalName = pdfInfo.fileName.replace('.pdf', '');
      const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
      saveAs(pdfBlob, `${originalName}_edited.pdf`);
      
      setStatus('完成！已下載。');
    } catch (err: any) {
      console.error(err);
      alert('錯誤：' + err.message);
      setStatus('處理失敗');
    } finally {
      setIsProcessing(false);
    }
  }, [pdfData, pdfInfo.fileName, replaceRules]);

  const handleReset = useCallback(() => {
    setPdfData(null);
    setPdfInfo({ fileName: '', pageCount: 0 });
    setReplaceRules([]);
    setStatus('');
  }, []);

  return (
    <div className="space-y-6 p-6">
      <UploadZone
        onFileSelect={handlePdfSelect}
        accept="application/pdf"
        icon="pdf"
        title="第一步：上傳原始 PDF 簡報"
        subtitle="選擇要進行頁面替換的 PDF 檔案"
      />

      {pdfData && (
        <div className="space-y-6 animate-slide-up">
          <FileInfo
            fileName={pdfInfo.fileName}
            pageCount={pdfInfo.pageCount}
            onRemove={handleReset}
          />

          <div className="p-5 rounded-xl bg-muted/30 border border-border/50 space-y-4">
            <Label className="text-sm font-semibold">設定替換規則</Label>
            
            <div className="flex gap-3">
              <Input
                type="number"
                value={targetPage}
                onChange={(e) => setTargetPage(e.target.value)}
                placeholder="頁碼 (如: 3)"
                className="w-28"
                min={1}
              />
              <input
                ref={imageInputRef}
                type="file"
                accept="image/png, image/jpeg"
                onChange={handleImageSelect}
                className="hidden"
              />
              <Button
                variant="muted"
                onClick={() => imageInputRef.current?.click()}
                className="flex-1"
              >
                <ImagePlus className="w-4 h-4" />
                選擇新圖片
              </Button>
            </div>

            {imageCheck.status !== 'idle' && (
              <div className={`flex items-start gap-2 text-sm p-3 rounded-lg ${
                imageCheck.status === 'perfect' 
                  ? 'bg-secondary/10 text-secondary' 
                  : imageCheck.status === 'warning'
                  ? 'bg-yellow-500/10 text-yellow-600'
                  : 'bg-muted text-muted-foreground'
              }`}>
                {imageCheck.status === 'perfect' ? (
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : imageCheck.status === 'warning' ? (
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : null}
                <span>{imageCheck.message}</span>
              </div>
            )}

            <Button
              onClick={handleAddRule}
              disabled={!tempImage || !targetPage}
              variant="secondary"
              className="w-full"
            >
              第二步：加入替換清單
            </Button>
          </div>

          {replaceRules.length > 0 && (
            <div className="space-y-3">
              <Label className="text-sm font-semibold">
                替換清單 ({replaceRules.length} 項)
              </Label>
              <div className="space-y-2">
                {replaceRules.map((rule, index) => (
                  <ReplaceRuleItem
                    key={`${rule.pageNum}-${index}`}
                    pageNum={rule.pageNum}
                    fileName={rule.fileName}
                    onRemove={() => handleRemoveRule(index)}
                  />
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleExecuteReplace}
            disabled={isProcessing || replaceRules.length === 0}
            size="lg"
            className="w-full flex-col h-auto py-3"
          >
            <span className="text-xs opacity-80">第三步</span>
            <span className="flex items-center gap-2">
              <Replace className="w-5 h-5" />
              {isProcessing ? '處理中...' : '開始處理並下載新 PDF'}
            </span>
          </Button>

          {status && (
            <ProgressBar progress={isProcessing ? 50 : 100} status={status} />
          )}
        </div>
      )}
    </div>
  );
};
