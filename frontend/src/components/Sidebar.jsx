import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  MessagesSquare,
  Bot,
  Settings,
  Blocks,
  BarChart3,
  Languages,
  AudioLines,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/conversations', label: 'Conversations', icon: MessagesSquare, end: false },
  { to: '/voice-models', label: 'Voice Models', icon: Bot, end: false },
  { to: '/settings', label: 'Settings', icon: Settings, end: false },
  { to: '/integrations', label: 'Integrations', icon: Blocks, end: false },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, end: false },
]

const itemClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
    isActive
      ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200'
      : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700'
  }`

export default function Sidebar() {
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-30 w-64 flex-col bg-white border-r border-violet-100">
      <div className="flex h-20 items-center gap-3 border-b border-violet-50 px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-200">
          <AudioLines className="h-5 w-5" />
        </div>
        <div>
          <div className="text-lg font-bold text-slate-900">BhashaBridge</div>
          <div className="text-xs font-medium text-slate-500">AI Voice Assistant</div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={itemClass}>
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="m-4 rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50 p-4">
        <div className="flex items-center gap-2 text-violet-700">
          <Languages className="h-4 w-4" />
          <span className="text-sm font-semibold">Powered by multilingual AI</span>
        </div>
        <p className="mt-1 text-xs text-slate-500">Telugu · Hindi · English</p>
      </div>
    </aside>
  )
}
