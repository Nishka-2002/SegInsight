import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Sparkles, Bot, Settings2 } from 'lucide-react'
import GenAISettingsModal from './GenAISettingsModal'
import AICopilotDrawer from './AICopilotDrawer'
import { getStoredAISettings } from '../services/genaiApi'

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
    <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
      Seg<span style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Insight</span>
    </span>
    <span style={{
      fontSize: '0.62rem',
      fontWeight: 800,
      background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(6, 182, 212, 0.2))',
      color: '#22d3ee',
      border: '1px solid rgba(6, 182, 212, 0.35)',
      padding: '2px 7px',
      borderRadius: '20px',
      letterSpacing: '0.5px',
      textTransform: 'uppercase'
    }}>
      GenAI v2
    </span>
  </div>
)

const navStyles = `
  .navbar {
    position: sticky; top: 0; z-index: 100; height: 64px;
    background: rgba(10,10,20,0.85); backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center;
  }
  .navbar .container {
    display: flex; align-items: center;
    justify-content: space-between; width: 100%;
  }
  .nav-links {
    display: flex; align-items: center; gap: 6px; list-style: none;
  }
  .nav-links a, .nav-btn-logout {
    padding: 7px 14px; border-radius: 8px; font-size: 0.875rem;
    font-weight: 500; color: #94a3b8; transition: all 0.18s ease;
    display: inline-flex; align-items: center; gap: 6px;
    background: none; border: none; cursor: pointer; font-family: inherit;
  }
  .nav-links a:hover, .nav-btn-logout:hover {
    color: #f1f5f9; background: rgba(255,255,255,0.06);
  }
  .nav-links a.active { color: #818cf8; background: rgba(79,70,229,0.12); }
  
  .nav-ai-btn {
    padding: 6px 12px;
    border-radius: 10px;
    font-size: 0.78rem;
    font-weight: 700;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
    border: 1px solid rgba(99, 102, 241, 0.3);
    background: rgba(99, 102, 241, 0.1);
    color: #a5b4fc;
  }
  .nav-ai-btn:hover {
    background: rgba(99, 102, 241, 0.2);
    border-color: #6366f1;
    color: #fff;
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
  }

  .floating-copilot-trigger {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 999;
    background: linear-gradient(135deg, #4f46e5, #06b6d4);
    color: white;
    border: none;
    padding: 12px 20px;
    border-radius: 30px;
    font-weight: 700;
    font-size: 0.88rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 10px 25px rgba(79, 70, 229, 0.4), 0 0 15px rgba(6, 182, 212, 0.3);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .floating-copilot-trigger:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 15px 35px rgba(79, 70, 229, 0.5), 0 0 25px rgba(6, 182, 212, 0.4);
  }

  .hamburger {
    display: none; background: none; border: none;
    color: #f1f5f9; cursor: pointer; padding: 6px;
  }
  @media (max-width: 768px) {
    .hamburger { display: flex; flex-direction: column; gap: 4px; }
    .hamburger span { display: block; width: 22px; height: 2px; background: currentColor; border-radius: 2px; }
    .nav-links { display: none; }
    .nav-links.open {
      display: flex; flex-direction: column;
      position: absolute; top: 64px; left: 0; right: 0;
      background: rgba(10,10,20,0.98);
      border-bottom: 1px solid rgba(255,255,255,0.06);
      padding: 12px 16px 20px; gap: 6px; align-items: stretch;
    }
  }
`

export default function Navbar({ variant = 'home' }) {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [copilotOpen, setCopilotOpen] = useState(false)
  
  const isActive = (to) => pathname === to ? 'active' : ''
  const settings = getStoredAISettings()

  const navSets = {
    home:         [{ to: '/', label: 'Home' }, { to: '/about', label: 'About' }, { to: '/login', label: 'Login' }, { to: '/feedback', label: 'Feedback' }],
    upload:       [{ to: '/upload', label: 'Upload' }, { to: '/insights', label: 'AI Studio' }, { to: '/dashboard', label: 'Dashboard' }],
    overview:     [{ to: '/overview', label: 'Overview' }, { to: '/segmentation', label: 'Model' }, { to: '/insights', label: 'AI Studio' }, { to: '/dashboard', label: 'Dashboard' }],
    segmentation: [{ to: '/segmentation', label: 'Segmentation' }, { to: '/insights', label: 'AI Studio' }, { to: '/dashboard', label: 'Dashboard' }],
    insights:     [{ to: '/insights', label: 'AI Studio' }, { to: '/segmentation', label: 'Clustering' }, { to: '/dashboard', label: 'Dashboard' }],
    dashboard:    [{ to: '/dashboard', label: 'Dashboard' }, { to: '/insights', label: 'AI Studio' }],
    feedback:     [{ to: '/', label: 'Home' }, { to: '/dashboard', label: 'Dashboard' }],
    about:        [{ to: '/', label: 'Home' }, { to: '/insights', label: 'AI Studio' }],
  }

  const links = navSets[variant] || navSets.home
  const showLogout = !['home', 'about'].includes(variant)

  return (
    <>
      <style>{navStyles}</style>
      <nav className="navbar">
        <div className="container">
          <Link to="/"><Logo /></Link>

          <button className="hamburger" onClick={() => setOpen(!open)}>
            <span /><span /><span />
          </button>

          <ul className={`nav-links${open ? ' open' : ''}`}>
            {links.map(l => (
              <li key={l.to}>
                <Link to={l.to} className={isActive(l.to)} onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              </li>
            ))}

            {/* GenAI Settings Trigger Button */}
            <li>
              <button
                className="nav-ai-btn"
                onClick={() => setSettingsOpen(true)}
                title="Configure Google Gemini / OpenAI / Smart Fallback"
              >
                <Sparkles size={13} color="#22d3ee" />
                <span>
                  {settings.apiKey ? (settings.apiKey.startsWith('AIza') ? 'Gemini Live' : 'OpenAI Live') : 'Smart AI'}
                </span>
                <Settings2 size={12} style={{ opacity: 0.6 }} />
              </button>
            </li>

            {/* AI Copilot Trigger */}
            <li>
              <button
                className="nav-ai-btn"
                style={{
                  background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.25), rgba(6, 182, 212, 0.25))',
                  borderColor: 'rgba(6, 182, 212, 0.4)',
                  color: '#fff'
                }}
                onClick={() => setCopilotOpen(true)}
              >
                <Bot size={14} color="#38bdf8" />
                <span>AI Copilot</span>
              </button>
            </li>

            {showLogout && (
              <li>
                <Link to="/" className="nav-btn-logout" style={{ color: '#f87171' }} onClick={() => setOpen(false)}>
                  Logout
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Floating Copilot Launcher Button */}
      <button
        className="floating-copilot-trigger"
        onClick={() => setCopilotOpen(true)}
        title="Open SegInsight AI Copilot"
      >
        <Sparkles size={16} />
        <span>Ask AI Copilot</span>
      </button>

      {/* Modals & Drawers */}
      <GenAISettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <AICopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
      />
    </>
  )
}