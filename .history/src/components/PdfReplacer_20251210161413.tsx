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
import { ImagePlus, Replace, AlertCircle, CheckCircle, X, Image as ImageIcon } from 'lucide-react';

// 設定 PDF.js Worker
pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

interface ReplaceRule {
  pageNum: number;
  imageData: ArrayBuffer;
  fileName: string;
  newImagePreview: string;      // 新圖片預覽 URL
  originalPagePreview: string;  // 原始頁面預覽 URL
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
  const [tempImage, setTempImage] = useState<{ data: ArrayBuffer; name: string; previewUrl: string } | null>(null);
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
          previewUrl: objectUrl, // Keep the URL for preview
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
    };
    img.src = objectUrl;
  }, []);

  const handleClearImage = useCallback(() => {
    if (tempImage?.previewUrl) {
      URL.revokeObjectURL(tempImage.previewUrl);
    }
    setTempImage(null);
    setImageCheck({ status: 'idle', message: '' });
    if (imageInputRef.current) imageInputRef.current.value = '';
  }, [tempImage]);

  // 生成 PDF 頁面縮圖
  const generatePageThumbnail = useCallback(async (pageNum: number): Promise<string> => {
    if (!pdfData) return '';
    
    try {
      const pdf = await pdfjs.getDocument(pdfData.slice(0)).promise;
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 0.3 }); // 小縮圖
      
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d')!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      await page.render({ canvasContext: context, viewport }).promise;
      
      const dataUrl = canvas.toDataURL('image/png');
      page.cleanup();
      
      return dataUrl;
    } catch (error) {
      console.error('生成縮圖失敗:', error);
      return '';
    }
  }, [pdfData]);

  const handleAddRule = useCallback(async () => {
    const pageNum = parseInt(targetPage);
    
    if (!pageNum || pageNum < 1 || pageNum > pdfInfo.pageCount) {
      alert(`請輸入有效的頁碼 (1-${pdfInfo.pageCount})`);
      return;
    }
    
    if (!tempImage) {
      alert('請先選擇圖片');
      return;
    }

    // 生成原始頁面縮圖
    const originalPagePreview = await generatePageThumbnail(pageNum);

    const newRule: ReplaceRule = {
      pageNum,
      imageData: tempImage.data,
      fileName: tempImage.name,
      newImagePreview: tempImage.previewUrl,
      originalPagePreview,
    };

    setReplaceRules(prev => {
      const existingIndex = prev.findIndex(r => r.pageNum === pageNum);
      if (existingIndex >= 0) {
        if (!confirm(`第 ${pageNum} 頁已有設定，要覆蓋嗎？`)) return prev;
        // 清理舊的預覽 URL
        const oldRule = prev[existingIndex];
        if (oldRule.newImagePreview) URL.revokeObjectURL(oldRule.newImagePreview);
        const newRules = [...prev];
        newRules.splice(existingIndex, 1);
        return [...newRules, newRule].sort((a, b) => a.pageNum - b.pageNum);
      }
      return [...prev, newRule].sort((a, b) => a.pageNum - b.pageNum);
    });

    // 不要 revoke previewUrl，因為現在要保留給 ReplaceRuleItem 使用
    setTargetPage('');
    setTempImage(null);
    setImageCheck({ status: 'idle', message: '' });
    if (imageInputRef.current) imageInputRef.current.value = '';
  }, [targetPage, tempImage, pdfInfo.pageCount, generatePageThumbnail]);

  const handleRemoveRule = useCallback((index: number) => {
    setReplaceRules(prev => {
      const rule = prev[index];
      if (rule?.newImagePreview) URL.revokeObjectURL(rule.newImagePreview);
      return prev.filter((_, i) => i !== index);
    });
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
      {/* Step ① 上傳原始 PDF */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
            ①
          </span>
          <span className="font-semibold text-foreground">上傳原始 PDF 簡報</span>
        </div>
        
        {!pdfData ? (
          <UploadZone
            onFileSelect={handlePdfSelect}
            accept="application/pdf"
            icon="pdf"
            title="點擊或拖曳上傳 PDF"
            subtitle="選擇要進行頁面替換的 PDF 檔案"
          />
        ) : (
          <FileInfo
            fileName={pdfInfo.fileName}
            pageCount={pdfInfo.pageCount}
            onRemove={handleReset}
          />
        )}
      </div>

      {pdfData && (
        <div className="space-y-6 animate-slide-up">
          {/* Step ② 設定替換規則 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-sm font-bold">
                ②
              </span>
              <span className="font-semibold text-foreground">設定替換規則</span>
            </div>

            <div className="p-5 rounded-xl bg-muted/30 border border-border/50 space-y-4">
              {/* Image Preview or Upload Button */}
              {tempImage ? (
                <div className="flex items-center gap-4 p-3 rounded-xl bg-accent/10 border border-accent/30">
                  <div className="w-20 h-14 rounded-lg overflow-hidden bg-black flex-shrink-0">
                    <img 
                      src={tempImage.previewUrl} 
                      alt="預覽" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-accent flex-shrink-0" />
                      <span className="font-medium text-foreground truncate">{tempImage.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">已選擇圖片</p>
                  </div>
                  <button
                    onClick={handleClearImage}
                    className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
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
                    className="w-full"
                  >
                    <ImagePlus className="w-4 h-4" />
                    選擇新圖片
                  </Button>
                </>
              )}

              {/* Page Number Input */}
              <div className="flex gap-3 items-center">
                <span className="text-sm text-muted-foreground whitespace-nowrap">替換至第</span>
                <Input
                  type="number"
                  value={targetPage}
                  onChange={(e) => setTargetPage(e.target.value)}
                  placeholder="頁碼"
                  className="w-20"
                  min={1}
                />
                <span className="text-sm text-muted-foreground">頁</span>
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
                加入替換清單
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
                      originalPreview={rule.originalPagePreview}
                      newPreview={rule.newImagePreview}
                      onRemove={() => handleRemoveRule(index)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Step ③ 開始處理 */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-accent text-accent-foreground text-sm font-bold">
                ③
              </span>
              <span className="font-semibold text-foreground">開始處理並下載</span>
            </div>

            <Button
              onClick={handleExecuteReplace}
              disabled={isProcessing || replaceRules.length === 0}
              size="lg"
              className="w-full"
            >
              <Replace className="w-5 h-5" />
              {isProcessing ? '處理中...' : '下載新 PDF'}
            </Button>

            {status && (
              <ProgressBar progress={isProcessing ? 50 : 100} status={status} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
