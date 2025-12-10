import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PdfConverter } from "@/components/PdfConverter";
import { PdfReplacer } from "@/components/PdfReplacer";
import { MascotCharacter } from "@/components/MascotCharacter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileImage,
  Replace,
  Sparkles,
  ShieldCheck,
  ExternalLink,
  Wand2,
  PencilRuler,
  Eraser,
  ChevronRight,
} from "lucide-react";

const steps = [
  {
    id: "convert",
    title: "轉 PNG",
    desc: "導出高畫質圖檔",
    icon: <FileImage className="w-4 h-4" />,
  },
  {
    id: "guide",
    title: "外部微調",
    desc: "Gemini / Lovart / Canva",
    icon: <Wand2 className="w-4 h-4" />,
  },
  {
    id: "replace",
    title: "頁面替換",
    desc: "放回修好的頁面",
    icon: <Replace className="w-4 h-4" />,
  },
];

const ExternalGuide = () => (
  <div className="space-y-6 p-6">
    <div className="rounded-xl border border-border/60 bg-muted/40 p-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-2 text-primary font-medium">
        <Sparkles className="w-4 h-4" />
        建議流程：匯出 PNG → 外部編輯 → 以 PNG 匯出
      </div>
      <p className="mt-2">
        目標尺寸 16:9、至少 1920px 寬，檔案格式建議 PNG，避免壓縮失真。
      </p>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      <Card className="h-full">
        <CardHeader className="space-y-1">
          <Badge variant="secondary" className="w-fit gap-2">
            <Wand2 className="w-3 h-3" />
            生成
          </Badge>
          <CardTitle className="text-lg">Gemini nano banana pro</CardTitle>
          <p className="text-sm text-muted-foreground">
            重新生成內容，維持 16:9 版面。
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ul className="space-y-2">
            <li>・上傳單頁 PNG，提醒保持風格一致</li>
            <li>・輸出時選高畫質 PNG</li>
            <li>・若有文字，請確認排版不跑版</li>
          </ul>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href="https://g.co/gemini" target="_blank" rel="noreferrer">
              前往 Gemini
              <ExternalLink className="w-3 h-3 ml-2" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card className="h-full">
        <CardHeader className="space-y-1">
          <Badge variant="secondary" className="w-fit gap-2">
            <PencilRuler className="w-3 h-3" />
            文字修整
          </Badge>
          <CardTitle className="text-lg">Lovart.ai</CardTitle>
          <p className="text-sm text-muted-foreground">
            用「編輯文字」快速校正錯字、微調排版。
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ul className="space-y-2">
            <li>・匯入 PNG，選擇要改的文字區塊</li>
            <li>・保持原字體與顏色，避免版面走樣</li>
            <li>・匯出 PNG，解析度至少 2K</li>
          </ul>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href="https://lovart.ai" target="_blank" rel="noreferrer">
              前往 Lovart
              <ExternalLink className="w-3 h-3 ml-2" />
            </a>
          </Button>
        </CardContent>
      </Card>

      <Card className="h-full">
        <CardHeader className="space-y-1">
          <Badge variant="secondary" className="w-fit gap-2">
            <Eraser className="w-3 h-3" />
            修飾
          </Badge>
          <CardTitle className="text-lg">Canva</CardTitle>
          <p className="text-sm text-muted-foreground">
            用「魔術橡皮擦」清除雜點，快速微調。
          </p>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <ul className="space-y-2">
            <li>・放大到細節區，用橡皮擦清理</li>
            <li>・必要時加上簡易圖示或底色</li>
            <li>・匯出 PNG，保持透明背景或黑底</li>
          </ul>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a href="https://www.canva.com" target="_blank" rel="noreferrer">
              前往 Canva
              <ExternalLink className="w-3 h-3 ml-2" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>

    <div className="rounded-xl border border-dashed border-border/60 p-4 text-sm text-muted-foreground space-y-2">
      <div className="font-semibold text-foreground">匯出小抄</div>
      <div className="grid gap-2 sm:grid-cols-3">
        <div>・比例：16:9（1920px 以上）</div>
        <div>・格式：PNG（避免 JPEG 壓縮）</div>
        <div>・文字：確認字型、行距不跑版</div>
      </div>
    </div>
  </div>
);

const Index = () => {
  const [activeTab, setActiveTab] = useState("convert");

  return (
    <div className="min-h-screen py-8 px-4 flex flex-col">
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
          <p className="text-muted-foreground">
            NotebookLM 下載的 PDF 簡報，總覺得差了那麼一點點？ 🤔
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xl mx-auto">
            1. 轉出高畫質 PNG → 2. 去外部網站微調 → 3. 回來替換頁面。
            三步走完，美化細節不再卡關！
          </p>

          {/* Privacy Notice */}
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <span>所有運算皆在您的瀏覽器內完成，檔案不會上傳至雲端伺服器，請安心使用。</span>
          </div>
        </div>

        {/* Stepper */}
        <div className="glass-card mb-4">
          <div className="flex items-center divide-x divide-border/50">
            {steps.map((step, index) => {
              const isActive = activeTab === step.id;
              const isDone =
                steps.findIndex((s) => s.id === activeTab) > index;
              return (
                <div
                  key={step.id}
                  className={`flex-1 px-4 py-3 flex items-center justify-between gap-3 transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : isDone
                      ? "bg-muted/60 text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="text-left">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        {step.icon}
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {step.desc}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Card */}
        <div className="glass-card overflow-hidden transition-shadow duration-300">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="rounded-b-none border-b border-border/50">
              <TabsTrigger value="convert" className="gap-2">
                <FileImage className="w-4 h-4" />
                PDF 轉高畫質圖檔 (PNG)
              </TabsTrigger>
              <TabsTrigger value="guide" className="gap-2">
                <Wand2 className="w-4 h-4" />
                外部微調指引
              </TabsTrigger>
              <TabsTrigger value="replace" className="gap-2">
                <Replace className="w-4 h-4" />
                PDF 頁面替換
              </TabsTrigger>
            </TabsList>
            <TabsContent value="convert">
              <PdfConverter />
              <div className="px-6 pb-6 -mt-4">
                <Button
                  className="w-full"
                  variant="secondary"
                  onClick={() => setActiveTab("guide")}
                >
                  下一步：外部微調
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="guide">
              <ExternalGuide />
              <div className="px-6 pb-6 -mt-2 flex flex-col gap-2 sm:flex-row sm:gap-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveTab("convert")}
                >
                  返回第 1 步
                </Button>
                <Button
                  className="w-full"
                  onClick={() => setActiveTab("replace")}
                >
                  前往第 3 步：頁面替換
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="replace">
              <PdfReplacer />
              <div className="px-6 pb-6 -mt-4">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setActiveTab("guide")}
                >
                  回到第 2 步確認圖片
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-sm text-muted-foreground mt-8 pb-4">
        <p>
          Made with ❤️ by{" "}
          <a
            href="https://www.facebook.com/vivichen.sister"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline font-medium"
          >
            Vivi Chen 大師姐
          </a>{" "}
          | © 2025
        </p>
      </footer>

      {/* Mascot */}
      <MascotCharacter />
    </div>
  );
};
export default Index;