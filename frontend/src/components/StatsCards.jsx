import { MessagesSquare, Clock, Mic } from 'lucide-react'

const stats = [
  {
    label: 'Total Conversations',
    value: '0',
    icon: MessagesSquare,
    caption: 'No conversations yet',
  },
  {
    label: 'Total Talk Time',
    value: '0:00',
    icon: Clock,
    caption: 'No talk time yet',
  },
  {
    label: 'Voice Sessions',
    value: '0',
    icon: Mic,
    caption: 'No voice sessions yet',
  },
]

export default function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map(({ label, value, icon: Icon, caption }) => (
        <div
          key={label}
          className="rounded-3xl border border-violet-100 bg-white p-6 shadow-xl shadow-violet-100/60"
        >
          <div className="flex items-start justify-between">
            <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <Icon className="h-5 w-5" />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900">{value}</div>
            <div className="mt-1 text-sm font-semibold text-slate-700">{label}</div>
            <div className="mt-1 text-xs text-slate-400">{caption}</div>
          </div>
        </div>
      ))}
    </div>
  )
}
