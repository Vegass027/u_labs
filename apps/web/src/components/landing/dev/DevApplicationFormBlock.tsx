'use client'

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import TerminalWindow from "../TerminalWindow"
import { api } from "@/lib/api"

type FormStatus = "idle" | "submitting" | "success" | "error"

interface FormData {
  full_name: string
  phone: string
  experience_years: string
  experience_months: string
  telegram: string
  about: string
}

type FormField = keyof FormData

const initialForm: FormData = {
  full_name: "",
  phone: "",
  experience_years: "",
  experience_months: "0",
  telegram: "",
  about: "",
}

const DevApplicationFormBlock = () => {
  const [form, setForm] = useState<FormData>(initialForm)
  const [status, setStatus] = useState<FormStatus>("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const [focusedField, setFocusedField] = useState<FormField | null>(null)

  const inputRefs: Record<FormField, React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>> = {
    full_name: useRef<HTMLInputElement>(null),
    phone: useRef<HTMLInputElement>(null),
    experience_years: useRef<HTMLInputElement>(null),
    experience_months: useRef<HTMLInputElement>(null),
    telegram: useRef<HTMLInputElement>(null),
    about: useRef<HTMLTextAreaElement>(null),
  }

  const handleChange = (field: FormField, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleContainerClick = (field: FormField) => {
    inputRefs[field]?.current?.focus()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus("submitting")
    setErrorMsg("")

    const years = parseInt(form.experience_years, 10)
    if (isNaN(years) || years < 0) {
      setErrorMsg("Укажите корректный опыт работы (лет)")
      setStatus("error")
      return
    }

    const months = parseInt(form.experience_months, 10)
    if (isNaN(months) || months < 0 || months > 11) {
      setErrorMsg("Месяцы: от 0 до 11")
      setStatus("error")
      return
    }

    const { data, error } = await api.post<{ id: string }>("/api/dev-applications", {
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      experience_years: years,
      experience_months: months,
      telegram: form.telegram.trim() || undefined,
      about: form.about.trim() || undefined,
    })

    if (error) {
      setErrorMsg(error)
      setStatus("error")
      return
    }

    if (data) {
      setStatus("success")
      setForm(initialForm)
    }
  }

  const renderTerminalInput = (
    field: FormField,
    label: string,
    comment: string,
    inputType: string = "text",
    required = false,
    maxLength = 100,
  ) => (
    <div className="flex items-start gap-2">
      <span className="text-terminal-prompt text-sm mt-2 shrink-0">$</span>
      <div className="flex-1">
        <label className="text-xs text-muted-foreground font-mono mb-1 block">{label} <span className="text-terminal-comment">{comment}</span></label>
        <div
          className="relative w-full border border-border rounded focus-within:border-primary/50 bg-card cursor-text"
          onClick={() => handleContainerClick(field)}
        >
          <div className="relative flex items-center min-w-0 px-3 py-2 min-h-[40px]">
            <input
              ref={inputRefs[field] as React.RefObject<HTMLInputElement>}
              type={inputType}
              value={form[field]}
              onChange={e => handleChange(field, e.target.value)}
              onFocus={() => setFocusedField(field)}
              onBlur={() => setFocusedField(null)}
              required={required}
              maxLength={maxLength}
              min={inputType === "number" ? 0 : undefined}
              max={inputType === "number" ? (field === "experience_months" ? 11 : 50) : undefined}
              className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-transparent caret-transparent font-mono text-sm cursor-text z-10"
              disabled={status === "submitting"}
            />
            <span className="font-mono text-sm whitespace-pre pointer-events-none text-terminal-prompt">
              {form[field] || ""}
            </span>
            {focusedField === field && (
              <span className="w-2.5 h-5 bg-terminal-prompt animate-blink inline-block shrink-0 ml-0.5 pointer-events-none" />
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const renderTerminalTextarea = (
    field: FormField,
    label: string,
    comment: string,
  ) => (
    <div className="flex items-start gap-2">
      <span className="text-terminal-prompt text-sm mt-2 shrink-0">$</span>
      <div className="flex-1">
        <label className="text-xs text-muted-foreground font-mono mb-1 block">{label} <span className="text-terminal-comment">{comment}</span></label>
        <div
          className="relative w-full border border-border rounded focus-within:border-primary/50 bg-card cursor-text"
          onClick={() => handleContainerClick(field)}
        >
          <div className="relative min-w-0 px-3 py-2 min-h-[100px]">
            <textarea
              ref={inputRefs[field] as React.RefObject<HTMLTextAreaElement>}
              value={form[field]}
              onChange={e => handleChange(field, e.target.value)}
              onFocus={() => setFocusedField(field)}
              onBlur={() => setFocusedField(null)}
              rows={4}
              maxLength={2000}
              className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-transparent caret-transparent font-mono text-sm cursor-text z-10 resize-none p-3"
              disabled={status === "submitting"}
            />
            <span className="font-mono text-sm whitespace-pre-wrap pointer-events-none text-terminal-prompt break-words">
              {form[field] || ""}
            </span>
            {focusedField === field && (
              <span className="w-2.5 h-5 bg-terminal-prompt animate-blink inline-block shrink-0 ml-0.5 pointer-events-none" />
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <section id="dev-form" className="relative py-20 md:py-28 px-4">
      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <TerminalWindow title="~/apply — developer application">
            {status === "success" ? (
              <div className="space-y-3 py-4">
                <div className="text-primary text-sm">
                  <span className="text-terminal-comment mr-2">✓</span>
                  Заявка принята. Мы свяжемся когда откроем набор.
                </div>
                <div className="text-terminal-comment text-xs">
                  // спасибо за интерес — мы сохранили ваши контакты
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-terminal-comment text-xs">
                  // заполните форму — мы свяжемся когда откроется набор
                </div>

                <div className="h-1" />

                {renderTerminalInput("full_name", "name:", "// ваше имя", "text", true)}
                {renderTerminalInput("phone", "phone:", "// ваш телефон", "tel", true, 20)}

                <div className="flex items-start gap-2">
                  <span className="text-terminal-prompt text-sm mt-2 shrink-0">$</span>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground font-mono mb-1 block">experience: <span className="text-terminal-comment">// какой у вас опыт</span></label>
                    <div className="flex items-center gap-2">
                      <div
                        className="relative w-20 border border-border rounded focus-within:border-primary/50 bg-card cursor-text"
                        onClick={() => handleContainerClick("experience_years")}
                      >
                        <div className="relative flex items-center min-w-0 px-3 py-2 min-h-[40px]">
                          <input
                            ref={inputRefs.experience_years as React.RefObject<HTMLInputElement>}
                            type="number"
                            value={form.experience_years}
                            onChange={e => handleChange("experience_years", e.target.value)}
                            onFocus={() => setFocusedField("experience_years")}
                            onBlur={() => setFocusedField(null)}
                            required
                            min={0}
                            max={50}
                            className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-transparent caret-transparent font-mono text-sm cursor-text z-10"
                            disabled={status === "submitting"}
                          />
                          <span className="font-mono text-sm whitespace-pre pointer-events-none text-terminal-prompt">
                            {form.experience_years || ""}
                          </span>
                          {focusedField === "experience_years" && (
                            <span className="w-2.5 h-5 bg-terminal-prompt animate-blink inline-block shrink-0 ml-0.5 pointer-events-none" />
                          )}
                        </div>
                      </div>
                      <span className="text-muted-foreground text-sm">лет</span>
                      <div
                        className="relative w-20 border border-border rounded focus-within:border-primary/50 bg-card cursor-text"
                        onClick={() => handleContainerClick("experience_months")}
                      >
                        <div className="relative flex items-center min-w-0 px-3 py-2 min-h-[40px]">
                          <input
                            ref={inputRefs.experience_months as React.RefObject<HTMLInputElement>}
                            type="number"
                            value={form.experience_months}
                            onChange={e => handleChange("experience_months", e.target.value)}
                            onFocus={() => setFocusedField("experience_months")}
                            onBlur={() => setFocusedField(null)}
                            min={0}
                            max={11}
                            className="absolute inset-0 w-full h-full bg-transparent border-none outline-none text-transparent caret-transparent font-mono text-sm cursor-text z-10"
                            disabled={status === "submitting"}
                          />
                          <span className="font-mono text-sm whitespace-pre pointer-events-none text-terminal-prompt">
                            {form.experience_months || ""}
                          </span>
                          {focusedField === "experience_months" && (
                            <span className="w-2.5 h-5 bg-terminal-prompt animate-blink inline-block shrink-0 ml-0.5 pointer-events-none" />
                          )}
                        </div>
                      </div>
                      <span className="text-muted-foreground text-sm">месяцев</span>
                    </div>
                  </div>
                </div>

                {renderTerminalInput("telegram", "telegram:", "// ваш телеграм")}
                {renderTerminalTextarea("about", "about:", "// о себе и своих проектах")}

                <div className="h-2" />

                {status === "error" && errorMsg && (
                  <div className="text-destructive text-xs font-mono">
                    <span className="text-terminal-comment mr-1">// error:</span> {errorMsg}
                  </div>
                )}

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={status === "submitting"}
                  className="w-full py-3 rounded-lg border border-primary/40 text-primary font-mono text-sm hover:bg-primary/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "submitting" ? (
                    <span>
                      <span className="text-terminal-comment mr-2">$</span>
                      sending...
                    </span>
                  ) : (
                    <span>
                      <span className="text-terminal-comment mr-2">$</span>
                      Отправить заявку →
                    </span>
                  )}
                </motion.button>

                <div className="text-terminal-comment text-xs text-center">
                  // заявка бесплатна, без обязательств
                </div>
              </form>
            )}
          </TerminalWindow>
        </motion.div>
      </div>
    </section>
  )
}

export default DevApplicationFormBlock
