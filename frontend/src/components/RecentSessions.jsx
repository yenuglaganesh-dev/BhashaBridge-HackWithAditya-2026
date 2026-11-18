import { AudioLines } from 'lucide-react'

export default function RecentSessions() {
  return (
    <section className="rounded-3xl border border-violet-100 bg-white p-6 shadow-xl shadow-violet-100/60 sm:p-8">
      <h2 className="text-lg font-semibold text-slate-900">Recent Voice Sessions</h2>
      <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-violet-200 bg-violet-50/50 px-6 py-10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
          <AudioLines className="h-7 w-7" />
        </span>
        <h3 className="mt-4 text-base font-semibold text-slate-900">No voice sessions yet</h3>
        <p className="mt-1 max-w-sm text-sm text-slate-500">
          Completed multilingual AI voice conversations will be listed here with language,
          duration and playback controls.
        </p>
      </div>
    </section>
  )
}
