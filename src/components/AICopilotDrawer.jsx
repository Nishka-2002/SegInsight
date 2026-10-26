import { useState, useRef, useEffect } from 'react'
import {
  Sparkles, Send, X, Bot, User, RefreshCw, ChevronRight,
  TrendingUp, ShieldAlert, DollarSign, Megaphone, Check
} from 'lucide-react'
import { sendCopilotChat, getStoredAISettings } from '../services/genaiApi'

const SUGGESTED_CHIPS = [
  { label: "Analyze churn risk across clusters", icon: <ShieldAlert size={13} /> },
  { label: "Which cluster has highest revenue upside?", icon: <DollarSign size={13} /> },
  { label: "Draft a 3-part re-engagement email sequence", icon: <Megaphone size={13} /> },
  { label: "Simulate impact of a 10% price bump on VIPs", icon: <TrendingUp size={13} /> },
]

export default function AICopilotDrawer({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: (
        "Hello! I am your **SegInsight AI Copilot**, an intelligence layer grounded directly in your K-Means customer segmentation data.\n\n" +
        "You can ask me to:\n" +
        "- Analyze revenue potential and churn vulnerabilities\n" +
        "- Draft personalized omnichannel marketing copy\n" +
        "- Simulate customer reactions to pricing or new tier changes\n" +
        "- Compare segment psychographics and tactical Do's & Don'ts"
      ),
      meta: { provider: "SegInsight GenAI", model: "Active Engine" }
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) scrollToBottom()
  }, [messages, isOpen])

  const handleSend = async (userText) => {
    const textToSend = userText || input
    if (!textToSend.trim() || loading) return

    const newMessages = [...messages, { role: 'user', content: textToSend }]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    // Pull current cluster context from localStorage
    let clusterContext = {}
    try {
      const storedSummary = localStorage.getItem("summary")
      const storedClusters = localStorage.getItem("clusters")
      if (storedSummary) clusterContext.summary = JSON.parse(storedSummary)
      if (storedClusters) clusterContext.total_customers = JSON.parse(storedClusters).length
    } catch (e) {
      console.warn("Could not parse cluster context:", e)
    }

    try {
      const response = await sendCopilotChat(
        newMessages.map(m => ({ role: m.role, content: m.content })),
        clusterContext
      )
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: response.reply,
          meta: response.metadata
        }
      ])
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: `⚠️ Error generating response: ${err.message}. Please check your connection or AI settings.`,
          isError: true
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Chat cleared. What would you like to explore in your customer segmentation data?",
        meta: { provider: "SegInsight GenAI", model: "Active Engine" }
      }
    ])
  }

  if (!isOpen) return null

  const settings = getStoredAISettings()

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0, bottom: 0,
      width: '100%', maxWidth: '440px',
      background: '#090914',
      borderLeft: '1px solid rgba(99, 102, 241, 0.25)',
      boxShadow: '-15px 0 45px rgba(0, 0, 0, 0.7)',
      zIndex: 9998,
      display: 'flex', flexDirection: 'column',
      fontFamily: "'Inter', sans-serif",
      color: '#f8fafc',
      animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .copilot-chip:hover {
          background: rgba(99, 102, 241, 0.18) !important;
          border-color: rgba(99, 102, 241, 0.5) !important;
          transform: translateY(-1px);
        }
        .copilot-msg h3 { font-size: 0.95rem; margin: 8px 0 4px; color: #818cf8; }
        .copilot-msg p { margin: 6px 0; line-height: 1.55; }
        .copilot-msg ul { padding-left: 18px; margin: 6px 0; }
        .copilot-msg li { margin-bottom: 4px; }
      `}</style>

      {/* Drawer Header */}
      <div style={{
        padding: '18px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 15px rgba(79, 70, 229, 0.4)'
          }}>
            <Bot size={20} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
              SegInsight AI Copilot
              <span style={{
                fontSize: '0.65rem', padding: '2px 7px', borderRadius: '10px',
                background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee',
                border: '1px solid rgba(6, 182, 212, 0.3)', fontWeight: 700
              }}>
                GENAI
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
              Provider: {settings.apiKey ? (settings.provider === 'gemini' ? 'Google Gemini' : 'OpenAI') : 'Smart AI Engine'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleClear}
            title="Clear Chat"
            style={{
              background: 'transparent', border: 'none', color: '#64748b',
              cursor: 'pointer', padding: '6px', borderRadius: '8px', transition: '0.2s'
            }}
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)', border: 'none', color: '#94a3b8',
              cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '20px',
        display: 'flex', flexDirection: 'column', gap: 16
      }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex', gap: 10,
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: m.role === 'user' ? '85%' : '95%'
            }}
          >
            {m.role === 'assistant' && (
              <div style={{
                width: 28, height: 28, borderRadius: '8px',
                background: 'rgba(79, 70, 229, 0.2)', border: '1px solid rgba(79, 70, 229, 0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Sparkles size={14} color="#818cf8" />
              </div>
            )}

            <div>
              <div
                className="copilot-msg"
                style={{
                  padding: '12px 16px',
                  borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: m.role === 'user'
                    ? 'linear-gradient(135deg, #4f46e5, #4338ca)'
                    : 'rgba(255, 255, 255, 0.04)',
                  border: m.role === 'user'
                    ? 'none'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.84rem',
                  lineHeight: 1.55,
                  color: m.isError ? '#f87171' : '#e2e8f0',
                  whiteSpace: 'pre-line'
                }}
              >
                {m.content}
              </div>

              {m.meta && (
                <div style={{ fontSize: '0.65rem', color: '#64748b', marginTop: 4, paddingLeft: 4 }}>
                  Powered by {m.meta.provider || "SegInsight"} ({m.meta.model || "v2"})
                </div>
              )}
            </div>

            {m.role === 'user' && (
              <div style={{
                width: 28, height: 28, borderRadius: '8px',
                background: 'rgba(6, 182, 212, 0.2)', border: '1px solid rgba(6, 182, 212, 0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <User size={14} color="#22d3ee" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: 10, alignSelf: 'flex-start' }}>
            <div style={{
              width: 28, height: 28, borderRadius: '8px',
              background: 'rgba(79, 70, 229, 0.2)', border: '1px solid rgba(79, 70, 229, 0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Sparkles size={14} color="#818cf8" />
            </div>
            <div style={{
              padding: '12px 18px', borderRadius: '18px 18px 18px 4px',
              background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '0.82rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 8
            }}>
              <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} />
              Reasoning through cluster metrics...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Chips */}
      <div style={{
        padding: '8px 16px 12px',
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex', gap: 6, overflowX: 'auto',
        scrollbarWidth: 'none'
      }}>
        {SUGGESTED_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            className="copilot-chip"
            onClick={() => handleSend(chip.label)}
            disabled={loading}
            style={{
              padding: '6px 11px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '20px',
              color: '#94a3b8',
              fontSize: '0.73rem',
              display: 'inline-flex', alignItems: 'center', gap: 5,
              whiteSpace: 'nowrap', cursor: 'pointer', transition: '0.2s'
            }}
          >
            {chip.icon} {chip.label}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div style={{
        padding: '14px 16px 18px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(255, 255, 255, 0.02)'
      }}>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          style={{ display: 'flex', gap: 8 }}
        >
          <input
            type="text"
            placeholder="Ask AI Copilot about your segments..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={{
              flex: 1,
              padding: '12px 14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: '12px',
              color: 'white',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              width: 44, height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
              border: 'none',
              color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
              opacity: !input.trim() || loading ? 0.5 : 1,
              transition: '0.2s',
              boxShadow: '0 0 15px rgba(79, 70, 229, 0.3)'
            }}
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}
