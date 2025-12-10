import { ExternalLink, Play, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import geminiLogo from "@/assets/gemini.png";
import lovartLogo from "@/assets/lovart.png";
import canvaLogo from "@/assets/canva.jpeg";

const tools = [
  {
    name: "Gemini Nano Banana Pro",
    description: "使用 AI 重新生成整張圖片，適合需要大幅度修改的頁面",
    logo: geminiLogo,
    url: "https://gemini.google.com/",
    tips: ["上傳 PNG 圖片", "描述你想要的修改", "下載生成的新圖片"],
    videoId: "v7coObJUWwk",
  },
  {
    name: "Lovart.ai",
    description: "專業的 AI 圖片編輯工具，支援「編輯文字」功能直接修改圖片中的文字",
    logo: lovartLogo,
    url: "https://www.lovart.ai/",
    tips: ["上傳需要修改的頁面", "使用「編輯文字」功能修改文字內容", "匯出高畫質圖片"],
    videoId: "X7-8ddTnRkg",
  },
  {
    name: "Canva",
    description: "使用魔術橡皮擦、背景移除等功能進行細節調整",
    logo: canvaLogo,
    url: "https://www.canva.com/",
    tips: ["將圖片拖入 Canva 編輯器", "使用魔術橡皮擦移除不需要的元素", "調整文字、顏色或版面"],
    videoId: "lkZdHxJVBTI",
  },
];

interface ExternalEditGuideProps {
  onNextStep?: () => void;
}

export const ExternalEditGuide = ({ onNextStep }: ExternalEditGuideProps) => {
  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          使用外部工具編輯圖片
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          選擇以下任一工具，對第一步驟匯出的 PNG 圖片進行修改
        </p>
      </div>

      {/* Tools with Collapsible Videos */}
      <Accordion type="single" collapsible className="space-y-4">
        {tools.map((tool, toolIndex) => (
          <AccordionItem
            key={tool.name}
            value={tool.name}
            className="border border-border/50 rounded-xl bg-card/50 overflow-hidden transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
          >
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Logo */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden shadow-lg bg-white">
                  <img 
                    src={tool.logo} 
                    alt={`${tool.name} logo`} 
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-foreground">{tool.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-primary hover:text-primary"
                      onClick={() => window.open(tool.url, "_blank")}
                    >
                      前往
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>

                  {/* Tips */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {tool.tips.map((tip, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1.5 text-xs bg-muted/50 text-muted-foreground px-2.5 py-1 rounded-full"
                      >
                        <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] font-medium flex items-center justify-center">
                          {index + 1}
                        </span>
                        {tip}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Video Accordion Trigger */}
              <AccordionTrigger className="pt-3 pb-0 hover:no-underline">
                <span className="inline-flex items-center gap-2 text-sm text-primary">
                  <Play className="w-4 h-4" />
                  觀看教學影片
                </span>
              </AccordionTrigger>
            </div>

            {/* Collapsible Video */}
            <AccordionContent className="px-4 pb-4">
              <div className="relative rounded-lg overflow-hidden bg-black aspect-video mt-2">
                <iframe
                  src={`https://www.youtube.com/embed/${tool.videoId}`}
                  title={`${tool.name} 教學影片`}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Footer Note */}
      <div className="text-center space-y-4">
        <p className="text-xs text-muted-foreground">
          編輯完成後，請將修改好的圖片儲存為 PNG 或 JPG 格式，以便在第三步驟中使用
        </p>
        
        {/* Next Step Button */}
        {onNextStep && (
          <Button
            onClick={onNextStep}
            size="lg"
            className="gap-2"
          >
            <span className="flex flex-col items-center leading-tight">
              <span>第三步：PDF 頁面替換</span>
            </span>
            <ArrowRight className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
};
