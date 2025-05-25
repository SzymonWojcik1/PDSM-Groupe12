import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { messages } = await req.json()

  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'mistral-small',
      messages
    })
  })

  const data = await res.json()
  const answer = data.choices?.[0]?.message?.content || 'Aucune réponse.'
  return NextResponse.json({ answer })
}
