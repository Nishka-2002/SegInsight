import { useState, useEffect } from 'react'
import { X, Sparkles, Key, CheckCircle, Shield, Cpu, ExternalLink } from 'lucide-react'
import { getStoredAISettings, saveStoredAISettings } from '../services/genaiApi'

export default function GenAISettingsModal({ isOpen, onClose }) {
  const [provider, setProvider] = useState('auto')
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [savedStatus, setSavedStatus] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const current = getStoredAISettings()
      setProvider(current.provider || 'auto')
      setApiKey(current.apiKey || '')
      setSavedStatus(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = () => {
    saveStoredAISettings({ provider, apiKey })
    setSavedStatus(true)
    setTimeout(() => {
      setSavedStatus(false)
      onClose()
    }, 1200)
  }

  const handleClear = () => {
    setApiKey('')
    saveStoredAISettings({ provider: 'auto', apiKey: '' })
    setSavedStatus(true)
    setTimeout(() => {
      setSavedStatus(false)
      onClose()
    }, 1000)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(5, 5, 12, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#0d0d1a',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '540px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 35px rgba(79, 70, 229, 0.25)',
        padding: '32px',
        position: 'relative',
        color: '#f8fafc',
        fontFamily: "'Inter', sans-serif"
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 20, right: 20,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '50%', width: 36, height: 36,
            color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: '0.2s'
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{
            width: 44, height: 44, borderRadius: '12px',
            background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(79, 70, 229, 0.4)'
          }}>
            <Sparkles size={22} color="white" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
              Generative AI Intelligence Engine
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '0.82rem', color: '#94a3b8' }}>
              Configure live LLM providers or use the built-in offline smart engine.
            </p>
          </div>
        </div>

        {/* Engine Provider Options */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: 10 }}>
            Active AI Engine Provider
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
            {[
              { id: 'auto', label: 'Auto Detect', desc: 'Auto by Key / Smart Engine', icon: <Cpu size={14} /> },
              { id: 'gemini', label: 'Google Gemini', desc: 'Gemini 2.0 / 1.5 Flash', icon: <Sparkles size={14} /> },
              { id: 'openai', label: 'OpenAI', desc: 'GPT-4o-mini', icon: <Cpu size={14} /> },
            ].map(p => (
              <div
                key={p.id}
                onClick={() => setProvider(p.id)}
                style={{
                  padding: '12px 10px',
                  borderRadius: '12px',
                  border: provider === p.id ? '2px solid #6366f1' : '1px solid rgba(255,255,255,0.08)',
                  background: provider === p.id ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: '0.2s'
                }}
              >
                <div style={{ color: provider === p.id ? '#818cf8' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 700, marginBottom: 4 }}>
                  {p.icon} {p.label}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* API Key Input */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              API Key (Optional)
            </label>
            <span style={{ fontSize: '0.75rem', color: '#06b6d4' }}>
              {apiKey ? (apiKey.startsWith('AIza') ? 'Gemini Key Detected' : 'Custom Key Set') : 'Using Built-in Smart Fallback'}
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <input
              type={showKey ? 'text' : 'password'}
              placeholder="Paste Gemini (AIzaSy...) or OpenAI (sk-...) Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{
                width: '100%',
                padding: '13px 44px 13px 40px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                color: 'white',
                fontSize: '0.85rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <Key size={16} color="#818cf8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              style={{
                position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: '#64748b', fontSize: '0.75rem', cursor: 'pointer', padding: '4px'
              }}
            >
              {showKey ? 'Hide' : 'Show'}
            </button>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '0.73rem', color: '#64748b' }}>
            Leave blank to run in <b>Offline Smart Mode</b>. Our built-in heuristic LLM emulator guarantees 100% demo reliability without any external dependency.
          </p>
        </div>

        {/* Feature Notice for Interview */}
        <div style={{
          background: 'rgba(6, 182, 212, 0.06)',
          border: '1px solid rgba(6, 182, 212, 0.2)',
          borderRadius: '14px',
          padding: '14px',
          marginBottom: 24,
          display: 'flex', gap: 12, alignItems: 'flex-start'
        }}>
          <Shield size={18} color="#22d3ee" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: '0.78rem', lineHeight: 1.5, color: '#94a3b8' }}>
            <strong style={{ color: '#22d3ee' }}>GenAI Trainee Architecture:</strong> Bridges mathematical K-Means centroids with prompt-engineered LLM reasoning, structured JSON schemas, omnichannel campaign generation, and data-grounded AI copilot.
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          {apiKey && (
            <button
              onClick={handleClear}
              style={{
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8',
                padding: '12px 18px',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Reset to Smart Engine
            </button>
          )}

          <button
            onClick={handleSave}
            style={{
              background: savedStatus ? '#10b981' : 'linear-gradient(135deg, #4f46e5, #06b6d4)',
              border: 'none',
              color: 'white',
              padding: '12px 28px',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              transition: '0.3s',
              boxShadow: '0 4px 15px rgba(79, 70, 229, 0.3)'
            }}
          >
            {savedStatus ? (
              <><CheckCircle size={16} /> Saved Successfully!</>
            ) : (
              <><Sparkles size={16} /> Apply Settings</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
