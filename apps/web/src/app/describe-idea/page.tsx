import VSCodeHeader from "@/components/landing/VSCodeHeader"
import ClientHeroBlock from "@/components/landing/client/ClientHeroBlock"
import ClientPainBlock from "@/components/landing/client/ClientPainBlock"
import ClientLossBlock from "@/components/landing/client/ClientLossBlock"
import ClientProcessBlock from "@/components/landing/client/ClientProcessBlock"
import ClientCasesBlock from "@/components/landing/client/ClientCasesBlock"
import ClientReviewsBlock from "@/components/landing/client/ClientReviewsBlock"
import ClientServicesBlock from "@/components/landing/client/ClientServicesBlock"
import ClientComparisonBlock from "@/components/landing/client/ClientComparisonBlock"
import ClientFAQBlock from "@/components/landing/client/ClientFAQBlock"
import ClientFinalCTABlock from "@/components/landing/client/ClientFinalCTABlock"

export const metadata = {
  title: "Описать идею — Union Labs | Автоматизация бизнеса под ключ",
  description:
    "Разрабатываем цифровые инструменты для бизнеса: Telegram-боты, CRM, веб-приложения, автоматизация процессов. Онлайн-запись, уведомления, интеграции. От 30 000₽, от 2 недель.",
}

const clientTabs = [
  { id: "c-hero", label: "index.tsx", icon: "⚡" },
  { id: "c-pain", label: "pain.ts", icon: "🔴" },
  { id: "c-loss", label: "loss.ts", icon: "📉" },
  { id: "c-process", label: "pipeline.ts", icon: "🤖" },
  { id: "c-cases", label: "cases.ts", icon: "📊" },
  { id: "c-reviews", label: "reviews.ts", icon: "⭐" },
  { id: "c-services", label: "services.ts", icon: "🛠" },
  { id: "c-compare", label: "compare.ts", icon: "⚖️" },
  { id: "c-faq", label: "faq.ts", icon: "💬" },
  { id: "c-cta", label: "start.ts", icon: "🚀" },
]

export default function DescribeIdeaPage() {
  return (
    <main className="relative bg-background text-foreground overflow-x-hidden">
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(155 100% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(155 100% 50%) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <VSCodeHeader tabs={clientTabs} defaultActiveTab="c-hero" />

      <div className="pt-20">
        <div id="c-hero"><ClientHeroBlock /></div>
        <div id="c-pain"><ClientPainBlock /></div>
        <div id="c-loss"><ClientLossBlock /></div>
        <div id="c-process"><ClientProcessBlock /></div>
        <div id="c-cases"><ClientCasesBlock /></div>
        <div id="c-reviews"><ClientReviewsBlock /></div>
        <div id="c-services"><ClientServicesBlock /></div>
        <div id="c-compare"><ClientComparisonBlock /></div>
        <div id="c-faq"><ClientFAQBlock /></div>
        <div id="c-cta"><ClientFinalCTABlock /></div>
      </div>
    </main>
  )
}
