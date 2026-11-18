import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './components/Dashboard'
import Placeholder from './components/Placeholder'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-violet-50/60 text-slate-900">
        <Sidebar />
        <main className="md:pl-64 min-h-screen">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/conversations" element={<Placeholder title="Conversations" description="Your past multilingual AI voice conversations will appear here." />} />
            <Route path="/voice-models" element={<Placeholder title="Voice Models" description="Custom multilingual voice models will appear here." />} />
            <Route path="/settings" element={<Placeholder title="Settings" description="Assistant and voice settings will appear here." />} />
            <Route path="/integrations" element={<Placeholder title="Integrations" description="Third-party service integrations will appear here." />} />
            <Route path="/analytics" element={<Placeholder title="Analytics" description="Usage analytics will appear here." />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}
