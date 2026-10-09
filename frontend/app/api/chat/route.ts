import { NextResponse } from 'next/server'

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages, message, history, language, currentSpot } = body

    let promptText = ''
    let chatHistory = history || []

    if (Array.isArray(messages) && messages.length > 0) {
      promptText = messages[messages.length - 1]?.content || ''
      chatHistory = messages.slice(0, -1)
    } else if (typeof message === 'string' && message.trim().length > 0) {
      promptText = message.trim()
    }

    if (!promptText) {
      return NextResponse.json({ error: 'A message is required.' }, { status: 400 })
    }

    const backendRes = await fetch(`${apiBaseUrl}/api/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: promptText,
        history: chatHistory,
        currentSpot,
        language: language === 'hi' ? 'hi' : 'en',
      }),
    })

    if (!backendRes.ok) {
      return NextResponse.json(
        { error: 'The assistant is temporarily unavailable.' },
        { status: backendRes.status }
      )
    }

    const data = await backendRes.json()
    return NextResponse.json({
      text: data.reply,
      reply: data.reply,
      spotContext: data.spotContext,
      grounded: data.grounded,
    })
  } catch (err) {
    console.error('Chat proxy error:', err)
    return NextResponse.json(
      { error: 'The assistant is temporarily unavailable.' },
      { status: 500 }
    )
  }
}
