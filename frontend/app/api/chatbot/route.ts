import { NextRequest, NextResponse } from 'next/server'

/**
 * Chatbot API Route Handler
 * 
 * This API route handles communication with the Mistral AI API.
 * It processes incoming chat messages and returns AI-generated responses.
 * 
 * @param req - The incoming Next.js request object containing chat messages
 * @returns NextResponse with the AI's response
 */
export async function POST(req: NextRequest) {
  // Extract messages from the request body
  const { messages } = await req.json()

  // Make request to Mistral AI API
  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      // Use environment variable for API key
      Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      // Use the small model for faster responses
      model: 'mistral-small',
      messages
    })
  })

  // Parse the API response
  const data = await res.json()
  
  // Extract the AI's response or use a default message if none is provided
  const answer = data.choices?.[0]?.message?.content || 'No response.'
  
  // Return the response as JSON
  return NextResponse.json({ answer })
}
