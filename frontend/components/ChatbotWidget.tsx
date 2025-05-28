'use client'

import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * Chatbot Widget Component
 * 
 * A floating chat interface that provides AI-powered assistance to users.
 * Features:
 * - Toggleable chat window
 * - Real-time message exchange
 * - Multi-language support
 * - Markdown-like text formatting
 * - Loading states
 * - Responsive design
 */
export default function ChatbotWidget() {
  // Component state management
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([])
  const [loading, setLoading] = useState(false)
  const { t, i18n } = useTranslation()

  // Toggle chat window visibility
  const toggle = () => setOpen(prev => !prev)

  /**
   * Formats the chatbot response text
   * Converts markdown-like syntax to HTML
   * @param text - The text to format
   * @returns Formatted HTML string
   */
  const formatResponse = (text: string) => {
    return text
      .replace(/\n/g, '<br />')
      .replace(/\s*\d+\.\s*/g, match => `<div class="ml-4 list-decimal"><span class="font-semibold">${match.trim()}</span> `)
      .replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>') // bold text
      .replace(/\n\n/g, '<br /><br />')
  }

  /**
   * Sends a message to the chatbot API
   * Handles message state updates and API communication
   */
  const sendMessage = async () => {
    if (!input.trim()) return
    const newMessages = [...messages, { role: 'user', content: input }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    // System prompts for different languages
    const systemPromptByLang: Record<string, string> = {
      fr: `Tu es un assistant virtuel pour l'application TdH, utilisée dans un contexte humanitaire pour la gestion des bénéficiaires, des activités et du cadre logique. Aide les utilisateurs à comprendre comment utiliser les fonctionnalités suivantes :
- Remplir ou consulter le cadre logique (objectifs, outcomes, outputs, indicateurs)
- Lier des activités à des indicateurs
- Gérer les bénéficiaires et leurs données
- Importer/exporter des fichiers (CSV/Excel)
- Filtrer des données par pays, région, sexe, type...
- Utiliser les rôles (utilisateur, CN, CR, siège) pour accéder aux bonnes pages
Tu dois répondre de manière claire, concise et sans inventer. Si une question est hors sujet (pas liée à l'application), indique poliment que tu es limité à l'aide pour l'application.`,

      en: `You are a virtual assistant for the TdH application, used in a humanitarian context to manage beneficiaries, activities, and the logical framework. Help users understand how to use features such as:
- Viewing or filling out the logical framework (objectives, outcomes, outputs, indicators)
- Linking activities to indicators
- Managing beneficiaries and their details
- Importing/exporting files (CSV/Excel)
- Filtering data by country, region, gender, type, etc.
- Using roles (user, CN, CR, headquarters) to access the right pages
Always answer clearly and concisely. Do not invent answers. If the question is out of scope (not related to the app), politely explain your limitation.`,

      es: `Eres un asistente virtual para la aplicación TdH, utilizada en un contexto humanitario para gestionar beneficiarios, actividades y el marco lógico. Ayuda a los usuarios a entender cómo utilizar funciones como:
- Consultar o completar el marco lógico (objetivos, resultados, productos, indicadores)
- Vincular actividades a indicadores
- Gestionar beneficiarios y sus datos
- Importar/exportar archivos (CSV/Excel)
- Filtrar datos por país, región, sexo, tipo, etc.
- Utilizar los roles (usuario, CN, CR, sede) para acceder a las páginas adecuadas
Responde de forma clara, concisa y sin inventar información. Si la pregunta no está relacionada con la app, informa educadamente que solo puedes ayudar con la aplicación.`
    }

    // Get system prompt based on current language
    const lang = i18n.language || 'fr'
    const systemPrompt = systemPromptByLang[lang] || systemPromptByLang['fr']

    // Send request to chatbot API
    const res = await fetch('/api/chatbot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...newMessages
        ]
      })
    })

    // Update messages with API response
    const data = await res.json()
    setMessages([...newMessages, { role: 'assistant', content: data.answer }])
    setLoading(false)
  }

  return (
    <>
      {/* Floating action button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={toggle}
          className="bg-[#9F0F3A] text-white p-3 rounded-full shadow-lg hover:bg-[#800d30]"
          aria-label={t('chatbot_open', 'Open chatbot')}
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-20 right-6 w-80 max-h-[70vh] bg-white border shadow-xl rounded-xl p-4 flex flex-col z-50">
          {/* Chat header */}
          <h3 className="text-lg font-bold text-[#9F0F3A] mb-2">{t('chatbot_title', 'TdH Assistant')}</h3>
          
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto mb-2 text-sm space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded whitespace-pre-line text-sm ${
                  msg.role === 'user' ? 'bg-gray-100 text-right' : 'bg-[#f4e6ea] text-left'
                }`}
                dangerouslySetInnerHTML={{ __html: msg.role === 'assistant' ? formatResponse(msg.content) : msg.content }}
              />
            ))}
          </div>

          {/* Input area */}
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('chatbot_placeholder', 'Ask your question...')}
            rows={2}
            className="w-full border px-2 py-1 rounded text-sm"
            aria-label={t('chatbot_placeholder', 'Ask your question...')}
          />

          {/* Send button */}
          <button
            onClick={sendMessage}
            disabled={loading}
            className="mt-2 bg-[#9F0F3A] text-white rounded py-1.5 text-sm hover:bg-[#800d30] disabled:bg-gray-300"
            aria-label={loading ? t('chatbot_loading', 'Loading...') : t('chatbot_send', 'Send')}
          >
            {loading ? t('chatbot_loading', 'Loading...') : t('chatbot_send', 'Send')}
          </button>
        </div>
      )}
    </>
  )
}