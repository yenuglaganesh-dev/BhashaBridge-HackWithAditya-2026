import { useEffect, useRef, useState } from 'react'
import { Send, Mic, Eraser, Volume2, Bot, AlertCircle } from 'lucide-react'

export default function ChatInterface({
  messages,
  status,
  language,
  error,
  onSend,
  onClear,
  onMicRequest,
  onSpeak,
}) {
  const [input, setInput] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, status])

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    onSend(text)
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend()
  }

  const busy = status === 'thinking'

  return (
    <section className="flex h-[28rem] flex-col rounded-3xl border border-violet-100 bg-white shadow-xl shadow-violet-100/60 sm:h-[32rem] lg:sticky lg:top-6">
      <div className="flex items-center justify-between border-b border-violet-50 px-6 py-4">
        <h2 className="text-lg font-semibold text-slate-900">Conversation</h2>
        <button
          type="button"
          onClick={onClear}
          disabled={messages.length === 0}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-violet-50 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Eraser className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
        {messages.length === 0 && status === 'idle' && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
              <Bot className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-900">No conversation yet</h3>
            <p className="mt-1 max-w-xs text-sm text-slate-500">
              Ask the BhashaBridge assistant anything in Telugu, Hindi or English.
            </p>
          </div>
        )}

        {messages.map((message) => {
          if (message.role === 'user') {
            return (
              <div key={message.id} className="flex justify-end">
                <div className="max-w-[85%] rounded-2xl rounded-br-md bg-indigo-600 px-4 py-2.5 text-sm text-white">
                  {message.text}
                </div>
              </div>
            )
          }

          return (
            <div key={message.id} className="flex items-start gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex max-w-[85%] items-start gap-2">
                <div className="rounded-2xl rounded-bl-md border border-violet-100 bg-violet-50 px-4 py-2.5 text-sm text-slate-900">
                  {message.text}
                </div>
                <button
                  type="button"
                  onClick={() => onSpeak(message.text)}
                  disabled={!message.text}
                  aria-label="Speak AI response"
                  className="mt-1 rounded-lg p-1.5 text-indigo-500 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Volume2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          )
        })}

        {status === 'thinking' && (
          <div className="flex items-start gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl rounded-bl-md border border-violet-100 bg-violet-50 px-4 py-3">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-indigo-400 [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error || 'The AI assistant could not respond right now. Please try again later.'}</span>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <div className="border-t border-violet-50 p-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onMicRequest}
            disabled={busy}
            aria-label="Use microphone"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition-colors hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Mic className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message…"
            disabled={busy}
            className="h-11 flex-1 rounded-xl border border-violet-100 bg-violet-50/60 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || busy}
            aria-label="Send message"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
