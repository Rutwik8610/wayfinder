'use client'

import { FormEvent, useEffect, useRef, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  Bot,
  Compass,
  CornerDownLeft,
  Loader2,
  MapPin,
  MessageSquare,
  RotateCcw,
  Send,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { useAppSettings } from '@/components/providers/app-settings-provider'
import { apiBaseUrl } from '@/lib/auth-session'

type Message = {
  role: 'user' | 'assistant'
  content: string
}

export function FloatingAssistant() {
  const { language, t } = useAppSettings()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        t('assistant.greeting') ||
        "Hello! I'm Wayfinder, your AI travel companion. Ask me anything about tourist spots, itineraries, budget estimates, or local cuisine!",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Extract destination context from current page
  const destinationParam = searchParams.get('destination')
  const currentSpot = destinationParam ? decodeURIComponent(destinationParam).trim() : ''

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
      setTimeout(() => inputRef.current?.focus(), 150)
    }
  }, [isOpen, messages, isLoading])

  const suggestedQuestions = [
    currentSpot ? `Budget for ${currentSpot}` : 'Plan a 3-day trip in Maharashtra',
    currentSpot ? `Best time to visit ${currentSpot}?` : 'Best time to visit Solapur?',
    currentSpot ? `What are top attractions near ${currentSpot}?` : 'Famous local food & sweets?',
  ]

  const handleSend = async (questionText?: string) => {
    const textToSend = (questionText || input).trim()
    if (!textToSend || isLoading) return

    setInput('')
    setErrorMsg('')

    const updatedHistory: Message[] = [...messages, { role: 'user', content: textToSend }]
    setMessages(updatedHistory)
    setIsLoading(true)

    try {
      const response = await fetch(`${apiBaseUrl}/api/assistant/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: updatedHistory.slice(-6),
          currentSpot: currentSpot || undefined,
          language: language === 'hi' ? 'hi' : 'en',
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get a response from travel assistant.')
      }

      const data = await response.json()
      const reply = data.reply || 'I am ready to help you plan your next journey!'

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } catch (err: unknown) {
      console.error('Chat error:', err)
      const errText =
        t('assistant.error') ||
        'Could not reach the travel assistant right now. Please check your connection and try again.'
      setErrorMsg(errText)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: errText,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    void handleSend()
  }

  const handleClearChat = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          t('assistant.greeting') ||
          "Chat cleared! I'm Wayfinder, your AI travel companion. Where would you like to travel next?",
      },
    ])
    setErrorMsg('')
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Floating Chat Window */}
      {isOpen && (
        <aside
          role="dialog"
          aria-label="AI Travel Assistant"
          className="mb-3 flex h-[580px] max-h-[82vh] w-[94vw] max-w-[420px] flex-col overflow-hidden rounded-3xl border border-border/80 bg-card/95 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-5 py-4">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
                <Bot className="size-5" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-foreground">
                    {t('assistant.name') || 'Wayfinder AI'}
                  </h3>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Smart Tourism Concierge
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                title="Clear conversation"
                className="flex size-8 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <Trash2 className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close chat"
                className="flex size-8 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>

          {/* Context Banner if on Spot Page */}
          {currentSpot && (
            <div className="flex items-center gap-2 border-b border-border/40 bg-emerald-500/5 px-4 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <MapPin className="size-3.5 shrink-0" />
              <span className="truncate">
                Active destination context: <strong>{currentSpot}</strong>
              </span>
            </div>
          )}

          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scroll-smooth">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user'
              return (
                <div
                  key={index}
                  className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary text-xs font-bold">
                      <Bot className="size-3.5" />
                    </span>
                  )}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed sm:text-[13px] ${
                      isUser
                        ? 'rounded-br-xs bg-primary text-primary-foreground shadow-sm'
                        : 'rounded-bl-xs border border-border bg-muted/30 text-foreground shadow-xs whitespace-pre-line'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              )
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Bot className="size-3.5" />
                </span>
                <div className="flex items-center gap-2 rounded-2xl border border-border bg-muted/20 px-3.5 py-2">
                  <Loader2 className="size-3.5 animate-spin text-primary" />
                  <span>Thinking about that...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Questions */}
          <div className="border-t border-border/40 bg-muted/10 px-3 py-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <Sparkles className="size-3 text-primary shrink-0 ml-1" />
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => void handleSend(q)}
                  className="shrink-0 rounded-full border border-border/80 bg-card px-2.5 py-1 text-[11px] font-medium text-foreground transition hover:border-primary hover:bg-primary/5 active:scale-95 disabled:opacity-50"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-border/60 bg-card p-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder={t('assistant.inputPlaceholder') || 'Ask about spots, routes, food, budget...'}
              className="flex-1 rounded-2xl border border-border bg-background px-4 py-2.5 text-xs outline-none ring-primary/20 placeholder:text-muted-foreground focus:ring-3 sm:text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md transition hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="size-4" />
            </button>
          </form>
        </aside>
      )}

      {/* Floating Action Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Close AI Travel Assistant' : 'Open AI Travel Assistant'}
        className="group relative flex size-14 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-white shadow-xl shadow-emerald-600/30 ring-4 ring-card transition-all duration-300 hover:scale-105 active:scale-95"
      >
        {isOpen ? (
          <X className="size-6 transition-transform duration-200 group-hover:rotate-90" />
        ) : (
          <>
            <Bot className="size-6 transition-transform duration-200 group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-black text-amber-950 shadow-sm animate-pulse">
              ✦
            </span>
          </>
        )}
      </button>
    </div>
  )
}
