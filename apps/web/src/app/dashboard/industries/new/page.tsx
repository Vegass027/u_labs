import { IndustryForm } from '../components/IndustryForm'

export default function NewIndustryPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      <div className="border border-border rounded-lg overflow-hidden bg-card">
        <div className="px-4 py-3 bg-muted/50">
          <h1 className="text-lg font-bold text-foreground font-mono">
            <span className="text-[#dcb67a]">{'>>>'}</span> Создать нишу
          </h1>
        </div>
        <div className="p-4">
          <IndustryForm />
        </div>
      </div>
    </div>
  )
}
