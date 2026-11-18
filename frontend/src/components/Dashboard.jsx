import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { AudioLines } from 'lucide-react'
import Sidebar from './Sidebar'
import LiveVoiceCard from './LiveVoiceCard'
import LanguageSelector from './LanguageSelector'
import StatsCards from './StatsCards'
import RecentSessions from './RecentSessions'
import ChatInterface from './ChatInterface'
import { getSpeechRecognition, speakText, LANGUAGE_CODES } from '../utils/speech'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080/api'

export default function Dashboard() {
  const language = useSelector((state) => state.language.current)

  const [messages, setMessages] = useState([])
  const [chatStatus, setChatStatus] = useState('idle')
  const [voiceStatus, setVoiceStatus] = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)

  const recognitionRef = useRef(null)
  const finalRef = useRef(false)

  useEffect(
    () => () => {
      const rec = recognitionRef.current
      if (rec) {
        try {
          rec.abort()
        } catch {
          // noop
        }
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    },
    []
  )

  const generateAiReply = async (text, language) => {
    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, language }),
    })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(
        data.error || data.message || 'Failed to reach the AI assistant. Please make sure the backend and AI engine are running.'
      )
    }
    const reply = data.response
    if (!reply) {
      throw new Error('The AI assistant returned an empty response. Please try again.')
    }
    return reply
  }

  const speak = async (text) => {
    setVoiceStatus('speaking')
    try {
      await speakText(text, language)
    } catch {
      // Speech synthesis unavailable or failed — keep the UI in a safe state.
    } finally {
      setVoiceStatus('idle')
    }
  }

  const sendMessage = async (rawText) => {
    const text = (rawText || transcript).trim()
    if (!text) return
    if (chatStatus === 'thinking') return

    setMessages((prev) => [
      ...prev,
      { id: `user-${Date.now()}`, role: 'user', text, ts: Date.now() },
    ])
    setChatStatus('thinking')
    setError(null)

    try {
      const reply = await generateAiReply(text, language)
      setMessages((prev) => [
        ...prev,
        { id: `assistant-${Date.now()}`, role: 'assistant', text: reply, ts: Date.now() },
      ])
      setChatStatus('idle')
      setVoiceStatus('speaking')
      try {
        await speakText(reply, language)
      } finally {
        setVoiceStatus('idle')
      }
    } catch (err) {
      setChatStatus('error')
      setError(err?.message || 'The AI assistant could not respond right now. Please try again later.')
      setVoiceStatus('idle')
    }
  }

  const startListening = () => {
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) {
      setVoiceStatus('error')
      return
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort()
      } catch {
        // noop
      }
    }
    const rec = new SpeechRecognition()
    recognitionRef.current = rec
    finalRef.current = false
    rec.lang = LANGUAGE_CODES[language]?.speechCode || 'en-US'
    rec.interimResults = false
    rec.maxAlternatives = 1
    rec.onresult = (event) => {
      const result = event.results && event.results[0]
      const text = result ? (result[0] && result[0].transcript) || '' : ''
      if (text) {
        finalRef.current = true
        setTranscript(text)
        setVoiceStatus('processing')
        void sendMessage(text)
      }
    }
    rec.onerror = () => {
      setVoiceStatus('error')
    }
    rec.onend = () => {
      if (!finalRef.current) {
        finalRef.current = false
        setVoiceStatus('idle')
      }
    }
    rec.start()
    setVoiceStatus('listening')
  }

  const stopListening = () => {
    const rec = recognitionRef.current
    if (!rec) return
    try {
      rec.stop()
    } catch {
      // noop
    }
  }

  const handleMicRequest = () => {
    if (voiceStatus === 'idle') {
      startListening()
    } else if (voiceStatus === 'listening') {
      stopListening()
    }
  }

  const clearConversation = () => {
    setMessages([])
    setChatStatus('idle')
    setError(null)
  }

  return (
    <div className="min-h-screen bg-violet-50/60 text-slate-900 pb-20 md:pb-8">
      <Sidebar />

      <main className="md:pl-64 min-h-screen">
        <div className="md:hidden flex items-center gap-3 px-4 pt-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
            <AudioLines className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-slate-900">BhashaBridge</span>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8">
          <header className="max-w-3xl">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              BhashaBridge AI Voice Assistant
            </h1>
            <p className="mt-2 text-base text-slate-500">Speak naturally. Understand every language.</p>
          </header>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <LiveVoiceCard
                status={voiceStatus}
                transcript={transcript}
                onStartListening={startListening}
                onStopListening={stopListening}
              />
              <LanguageSelector />
              <StatsCards />
              <RecentSessions />
            </div>

            <div>
              <ChatInterface
                messages={messages}
                status={chatStatus}
                language={language}
                error={error}
                onSend={sendMessage}
                onClear={clearConversation}
                onMicRequest={handleMicRequest}
                onSpeak={speak}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
