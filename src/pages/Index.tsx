import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PdfConverter } from "@/components/PdfConverter";
import { PdfReplacer } from "@/components/PdfReplacer";
import { MascotCharacter } from "@/components/MascotCharacter";
import { FileImage, Replace, Sparkles, ShieldCheck } from "lucide-react";
const Index = () => {
  return <div className="min-h-screen py-8 px-4 flex flex-col">
      <div className="max-w-2xl mx-auto flex-1">
        {/* Header */}
        <div className="text-center mb-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-2">
            <Sparkles className="w-4 h-4" />
            大師姐的工具包
          </div>
          <h1 className="text-3xl font-bold gradient-text">
            NotebookLM 簡報後製工具箱
          </h1>
          <p className="text-muted-foreground">NotebookLM 下載的 PDF 簡報，總覺得差了那麼一點點？ 🤔</p>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto">
            這個小工具能將 PDF 轉為高畫質圖檔，讓你針對特定頁面重新詠唱，
            或進入 Canva / Lovart 進行微調。
            最後透過「PDF頁面替換」功能無縫整合，補足 AI 簡報的最後一哩路！
          </p>
          
          {/* Privacy Notice */}
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span>所有運算皆在您的瀏覽器內完成，檔案不會上傳至雲端伺服器，請安心使用。</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="glass-card overflow-hidden transition-shadow duration-300">
          <Tabs defaultValue="convert" className="w-full">
            <TabsList className="rounded-b-none border-b border-border/50">
              <TabsTrigger value="convert" className="gap-2">
                <FileImage className="w-4 h-4" />
                PDF 轉高畫質圖檔 (PNG)
              </TabsTrigger>
              <TabsTrigger value="replace" className="gap-2">
                <Replace className="w-4 h-4" />
                PDF 頁面替換
              </TabsTrigger>
            </TabsList>
            <TabsContent value="convert">
              <PdfConverter />
            </TabsContent>
            <TabsContent value="replace">
              <PdfReplacer />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-sm text-muted-foreground mt-8 pb-4">
        <p>
          Made with ❤️ by{" "}
          <a href="https://www.facebook.com/vivichen.sister" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
            Vivi Chen 大師姐
          </a>
          {" "}| © 2025
        </p>
      </footer>

      {/* Mascot */}
      <MascotCharacter />
    </div>;
};
export default Index;