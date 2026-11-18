import { Mic, Square, Loader2 } from 'lucide-react'

const STATUS_STYLES = {
  idle: { label: 'Ready', dot: 'bg-slate-400', text: 'text-slate-500', bg: 'bg-slate-100', pulse: false },
  listening: { label: 'Listening…', dot: 'bg-teal-500', text: 'text-teal-600', bg: 'bg-teal-50', pulse: true },
  processing: { label: 'Processing…', dot: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50', pulse: true },
  speaking: { label: 'Speaking…', dot: 'bg-indigo-500', text: 'text-indigo-600', bg: 'bg-indigo-50', pulse: true },
  error: { label: 'Error', dot: 'bg-red-500', text: 'text-red-600', bg: 'bg-red-50', pulse: false },
}

export default function LiveVoiceCard({
  status,
  transcript,
  onStartListening,
  onStopListening,
}) {
  const active = status === 'listening' || status === 'processing' || status === 'speaking'
  const cfg = STATUS_STYLES[status] || STATUS_STYLES.idle

  return (
    <section className="rounded-3xl border border-violet-100 bg-white p-6 shadow-xl shadow-violet-100/60 sm:p-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-900">Live Voice Output</h2>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
          <span className={`h-2 w-2 rounded-full ${cfg.dot} ${cfg.pulse ? 'animate-pulse' : ''}`} />
          {cfg.label}
        </span>
      </div>

      <div className="mt-8 flex h-16 items-center justify-center gap-2">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full transition-all duration-300 ${
              active ? 'bg-teal-400 eq-bar' : 'bg-violet-100'
            }`}
            style={
              active ? { height: '3rem', animationDelay: `${i * 0.12}s` } : { height: '0.5rem' }
            }
          />
        ))}
      </div>

      <div className="mt-8 flex flex-col items-center">
        {status === 'listening' ? (
          <button
            type="button"
            onClick={onStopListening}
            aria-label="Stop voice recording"
            className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-500 text-white shadow-2xl shadow-teal-300 transition-transform hover:scale-105"
          >
            <Square className="h-7 w-7 fill-current" />
          </button>
        ) : (
          <button
            type="button"
            onClick={status === 'idle' ? onStartListening : undefined}
            disabled={status === 'processing' || status === 'speaking'}
            aria-label={status === 'idle' ? 'Start voice recording' : 'Voice is active'}
            className={`relative flex h-24 w-24 items-center justify-center rounded-full text-white shadow-2xl transition-all duration-300 ${
              status === 'idle'
                ? 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-indigo-300 hover:from-indigo-600 hover:to-violet-700 hover:scale-105'
                : status === 'listening'
                  ? 'bg-teal-500 shadow-teal-300 hover:scale-105'
                  : status === 'speaking'
                    ? 'bg-indigo-100 text-indigo-600 shadow-indigo-100'
                    : 'bg-slate-200'
            } ${status === 'listening' ? 'animate-pulse' : ''}`}
          >
            {status === 'processing' ? (
              <Loader2 className="h-10 w-10 animate-spin text-slate-500" />
            ) : (
              <Mic className={`h-10 w-10 ${status === 'speaking' ? 'text-indigo-600' : 'text-white'}`} />
            )}
            {status === 'listening' && (
              <span className="absolute inset-0 animate-ping rounded-full bg-teal-400 opacity-30" />
            )}
          </button>
        )}

        <p className="mt-6 text-sm text-slate-500">
          {status === 'idle' && 'Tap the microphone and speak…'}
          {status === 'listening' && 'Listening… tap stop when you are done'}
          {status === 'processing' && 'Processing your question…'}
          {status === 'speaking' && 'Speaking…'}
          {status === 'error' && 'Voice error — please try again'}
        </p>

        {transcript && (status === 'listening' || status === 'processing') && (
          <div className="mt-6 max-w-md rounded-2xl bg-violet-50 px-4 py-3 text-center text-sm text-slate-700">
            {transcript}
          </div>
        )}
      </div>

      {status === 'listening' && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onStopListening}
            className="inline-flex items-center gap-2 rounded-full bg-red-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-200 transition-colors hover:bg-red-600"
          >
            <Square className="h-4 w-4 fill-current" />
            Stop recording
          </button>
        </div>
      )}
    </section>
  )
}
