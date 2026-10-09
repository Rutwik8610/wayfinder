'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Bot,
  Compass,
  Loader2,
  Send,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { useAppSettings } from '@/components/providers/app-settings-provider'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'

type Message = { role: 'user' | 'assistant'; content: string }

export default function AIAssistantPage() {
  const { language, t } = useAppSettings()
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: t('assistant.greeting') || 'Hello! Where would you like to travel next?' },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setMessages((current) =>
      current.length === 1
        ? [{ role: 'assistant', content: t('assistant.greeting') || 'Hello! Where would you like to travel next?' }]
        : current
    )
  }, [language, t])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const question = input.trim()
    if (!question || isLoading) return
    setInput('')
    setMessages((current) => [...current, { role: 'user', content: question }])
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          messages: [...messages, { role: 'user', content: question }],
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setMessages((current) => [...current, { role: 'assistant', content: data.text }])
    } catch {
      setMessages((current) => [
        ...current,
        { role: 'assistant', content: t('assistant.error') || 'Could not reach AI assistant. Please try again.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <Navbar />

      <main className="flex-1">
        <section className="mx-auto flex max-w-4xl flex-col px-5 py-10 lg:px-8 lg:py-16">
          <div className="mb-8 max-w-2xl">
            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="size-4" /> {t('assistant.eyebrow') || 'AI Companion'}
            </span>
            <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">
              {t('assistant.title') || 'Your Personal Travel Concierge'}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">
              {t('assistant.intro') || 'Ask anything about destination culture, food recommendations, and packing advice.'}
            </p>
          </div>

          <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-foreground/5">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border px-6 py-4 bg-muted/20">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Bot className="size-5" />
              </span>
              <div>
                <p className="text-sm font-bold text-foreground">{t('assistant.name') || 'Wayfinder AI'}</p>
                <p className="text-xs text-muted-foreground">{t('assistant.subtitle') || 'Powered by Gemini Intelligence'}</p>
              </div>
              <span className="ml-auto flex items-center gap-2 text-xs font-semibold text-primary">
                <span className="size-2 rounded-full bg-primary animate-pulse" />
                {t('assistant.online') || 'Active'}
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex min-h-[440px] flex-col gap-4 bg-muted/10 p-5 sm:p-8" aria-live="polite">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex items-end gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                >
                  {message.role === 'assistant' && (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground text-xs font-bold">
                      <Bot className="size-4" />
                    </span>
                  )}
                  <div
                    className={`max-w-[82%] rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                      message.role === 'user'
                        ? 'rounded-br-xs bg-primary text-primary-foreground shadow-md shadow-primary/20'
                        : 'rounded-bl-xs border border-border bg-card text-foreground shadow-xs'
                    }`}
                  >
                    {message.content}
                  </div>
                  {message.role === 'user' && (
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      <UserRound className="size-4" />
                    </span>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                    <Bot className="size-4" />
                  </span>
                  <div className="flex items-center gap-2 rounded-2xl border border-border bg-card px-4 py-3 text-xs font-semibold">
                    <Loader2 className="size-4 animate-spin text-primary" /> Thinking about that...
                  </div>
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSubmit} className="flex items-center gap-3 border-t border-border bg-card p-4">
              <label htmlFor="assistant-message" className="sr-only">
                {t('assistant.inputLabel')}
              </label>
              <input
                id="assistant-message"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder={t('assistant.inputPlaceholder') || 'Ask about destinations, local cuisines, or culture...'}
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/25 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={t('assistant.send')}
              >
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              </button>
            </form>
          </div>

          {/* Quick Prompts */}
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              'assistant.promptKyoto',
              'assistant.promptLisbon',
              'assistant.promptPatagonia',
            ].map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setInput(t(key))}
                className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
              >
                {t(key)}
              </button>
            ))}
          </div>

          <Link
            href="/plan-trip"
            className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
          >
            <span>{t('assistant.turnIntoTrip') || 'Turn these ideas into a full Trip Plan'}</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  )
}
