import VSCodeHeader from "@/components/landing/VSCodeHeader"
import DevComingSoonBlock from "@/components/landing/dev/DevComingSoonBlock"
import DevApplicationFormBlock from "@/components/landing/dev/DevApplicationFormBlock"

export const metadata = {
  title: "Dev Mode — Union Labs | Набор разработчиков",
  description: "Оставьте контакты — мы свяжемся когда откроем набор разработчиков в команду.",
}

const devTabs = [
  { id: "dev-status", label: "status.ts", icon: "🚧" },
  { id: "dev-form", label: "apply.ts", icon: "📝" },
]

export default function DevModePage() {
  return (
    <main className="relative bg-background text-foreground overflow-x-hidden">
      <div
        className="fixed inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(hsl(155 100% 50%) 1px, transparent 1px), linear-gradient(90deg, hsl(155 100% 50%) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <VSCodeHeader tabs={devTabs} defaultActiveTab="dev-status" />

      <div className="pt-20">
        <DevComingSoonBlock />
        <DevApplicationFormBlock />
      </div>
    </main>
  )
}
