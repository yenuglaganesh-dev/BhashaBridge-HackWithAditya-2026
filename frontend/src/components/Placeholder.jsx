import React from 'react'
import { Construction } from 'lucide-react'

export default function Placeholder({ title, description }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-8">
      <div className="mx-auto max-w-xl rounded-3xl border border-violet-100 bg-white p-10 text-center shadow-xl shadow-violet-100/60">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
          <Construction className="h-8 w-8" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  )
}
