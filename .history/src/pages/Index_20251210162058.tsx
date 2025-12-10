import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PdfConverter } from "@/components/PdfConverter";
import { PdfReplacer } from "@/components/PdfReplacer";
import { ExternalEditGuide } from "@/components/ExternalEditGuide";
import { MascotCharacter } from "@/components/MascotCharacter";
import { FileImage, Replace, Sparkles, ShieldCheck, Palette, ChevronRight } from "lucide-react";

const steps = [
  { value: "convert", label: "PDF 轉 PNG", icon: FileImage },
  { value: "edit", label: "外部編輯", icon: Palette },
  { value: "replace", label: "頁面替換", icon: Replace },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("convert");
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // 滾動到頂部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="min-h-screen py-8 px-4 flex flex-col overflow-x-hidden">
      <div className="max-w-2xl mx-auto flex-1 w-full">
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
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full flex-wrap justify-center">
            <ShieldCheck className="w-4 h-4 text-secondary flex-shrink-0" />
            <span className="text-center">所有運算皆在您的瀏覽器內完成，檔案不會上傳至雲端伺服器，請安心使用。</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="glass-card overflow-hidden transition-shadow duration-300">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            {/* Step Indicator Tabs */}
            <TabsList className="w-full h-auto p-0 bg-transparent rounded-b-none border-b border-border/50">
              <div className="w-full flex items-center">
                {steps.map((step, index) => (
                  <div key={step.value} className="flex items-center flex-1 min-w-0">
                    <TabsTrigger
                      value={step.value}
                      className="flex-1 relative py-3 px-2 sm:py-4 sm:px-3 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-primary/5 transition-all duration-200 gap-1 sm:gap-2 min-w-0"
                    >
                      {/* Step Number Badge */}
                      <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">
                        {index + 1}
                      </span>
                      <step.icon className="w-4 h-4 shrink-0 hidden sm:block" />
                      <span className="text-xs sm:text-sm font-medium truncate">{step.label}</span>
                    </TabsTrigger>
                    {/* Arrow Separator */}
                    {index < steps.length - 1 && (
                      <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground/50 shrink-0 -mx-0.5 sm:-mx-1" />
                    )}
                  </div>
                ))}
              </div>
            </TabsList>

            <TabsContent value="convert">
              <PdfConverter onNextStep={() => handleTabChange("edit")} />
            </TabsContent>
            <TabsContent value="edit">
              <ExternalEditGuide onNextStep={() => handleTabChange("replace")} />
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
    </div>
  );
};

export default Index;