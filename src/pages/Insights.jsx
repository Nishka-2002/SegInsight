import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  Sparkles, TrendingUp, Target, Gift, MessageSquare, ArrowRight,
  RefreshCw, Copy, Check, Megaphone, Mail, Smartphone, DollarSign,
  Users, UserCheck, ShieldAlert, Cpu, FileText, ChevronRight, Zap, CheckCircle2,
  AlertCircle
} from 'lucide-react'
import {
  fetchAIPersonas, generateAICampaign, fetchSyntheticProfiles,
  fetchExecutiveMemo, getStoredAISettings
} from '../services/genaiApi'

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']

const CAMPAIGN_GOALS = [
  "Weekend Flash Sale Activation",
  "VIP Exclusive Early Access Drop",
  "Dormant Customer Win-Back Sequence",
  "New Product Category Launch",
  "Tiered Loyalty Rewards Milestone"
]

export default function Insights() {
  const navigate = useNavigate()
  
  // Active Tab: 'personas' | 'campaign' | 'synthetic' | 'memo'
  const [activeTab, setActiveTab] = useState('personas')

  // Cluster data from localStorage
  const [rawClusters, setRawClusters] = useState([])
  const [rawSummary, setRawSummary] = useState(null)
  const [stats, setStats] = useState({ total: 0, avgScore: 0 })

  // AI Personas State
  const [aiPersonas, setAiPersonas] = useState([])
  const [personasLoading, setPersonasLoading] = useState(false)
  const [personasMeta, setPersonasMeta] = useState(null)

  // Campaign Studio State
  const [selectedClusterForCampaign, setSelectedClusterForCampaign] = useState(0)
  const [selectedGoal, setSelectedGoal] = useState(CAMPAIGN_GOALS[0])
  const [brandName, setBrandName] = useState("SegInsight Retail")
  const [campaignData, setCampaignData] = useState(null)
  const [campaignLoading, setCampaignLoading] = useState(false)
  const [copiedKey, setCopiedKey] = useState('')

  // Synthetic Customer State
  const [syntheticCluster, setSyntheticCluster] = useState(0)
  const [syntheticProfiles, setSyntheticProfiles] = useState([])
  const [syntheticLoading, setSyntheticLoading] = useState(false)

  // Executive Memo State
  const [memoText, setMemoText] = useState('')
  const [memoLoading, setMemoLoading] = useState(false)
  const [memoCopied, setMemoCopied] = useState(false)

  // Load and validate cluster data
  useEffect(() => {
    const storedClusters = localStorage.getItem("clusters")
    const storedSummary = localStorage.getItem("summary")

    if (!storedClusters || !storedSummary) {
      console.warn("No data found, redirecting...")
      navigate('/dashboard')
      return
    }

    try {
      const parsedClusters = JSON.parse(storedClusters)
      const parsedSummary = JSON.parse(storedSummary)
      setRawClusters(parsedClusters)
      setRawSummary(parsedSummary)

      const total = parsedClusters.length
      const counts = {}
      parsedClusters.forEach(val => {
        counts[val] = (counts[val] || 0) + 1
      })

      // Calculate average score
      let totalScore = 0
      Object.keys(parsedSummary).forEach(k => {
        totalScore += parsedSummary[k]["Spending Score (1-100)"] || 0
      })
      const avg = Object.keys(parsedSummary).length > 0
        ? (totalScore / Object.keys(parsedSummary).length).toFixed(1)
        : 0

      setStats({ total, avgScore: avg })

      // Trigger GenAI Personas generation
      loadAIPersonas(parsedSummary, total, counts)

    } catch (err) {
      console.error("Critical error parsing cluster data:", err)
    }
  }, [navigate])

  // Fetch or generate AI Personas
  const loadAIPersonas = async (summary, total, counts) => {
    setPersonasLoading(true)
    try {
      const res = await fetchAIPersonas(summary, total, counts)
      setAiPersonas(res.data || [])
      setPersonasMeta(res.metadata || null)
    } catch (err) {
      console.error("Failed to load AI personas:", err)
    } finally {
      setPersonasLoading(false)
    }
  }

  // Handle Campaign Generation
  const handleGenerateCampaign = async (clusterIdOverride) => {
    const cid = clusterIdOverride !== undefined ? clusterIdOverride : selectedClusterForCampaign
    const persona = aiPersonas.find(p => p.cluster_id === cid) || {}
    
    setCampaignLoading(true)
    try {
      const res = await generateAICampaign(cid, persona, selectedGoal, brandName)
      setCampaignData(res.campaign)
      setActiveTab('campaign')
    } catch (err) {
      alert("Campaign generation error: " + err.message)
    } finally {
      setCampaignLoading(false)
    }
  }

  // Handle Synthetic Profiles Generation
  const handleGenerateSynthetic = async (cid) => {
    const targetId = cid !== undefined ? cid : syntheticCluster
    const persona = aiPersonas.find(p => p.cluster_id === targetId) || {}

    setSyntheticLoading(true)
    try {
      const res = await fetchSyntheticProfiles(targetId, persona)
      setSyntheticProfiles(res.profiles || [])
      setSyntheticCluster(targetId)
      setActiveTab('synthetic')
    } catch (err) {
      alert("Synthetic profile generation error: " + err.message)
    } finally {
      setSyntheticLoading(false)
    }
  }

  // Handle Executive Memo Generation
  const handleGenerateMemo = async () => {
    if (!rawSummary) return
    setMemoLoading(true)
    try {
      const res = await fetchExecutiveMemo(rawSummary, stats.total)
      setMemoText(res.memo || '')
    } catch (err) {
      alert("Memo generation error: " + err.message)
    } finally {
      setMemoLoading(false)
    }
  }

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(''), 2000)
  }

  // Distribution chart data
  const pieData = aiPersonas.map((p, i) => {
    const count = rawClusters.filter(c => c === p.cluster_id).length
    return {
      name: p.archetype || `Cluster ${p.cluster_id}`,
      value: count,
      color: COLORS[i % COLORS.length]
    }
  })

  return (
    <div className="insights-root">
      <style>{`
        .insights-root { background: #05050a; color: #fff; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .insights-container { max-width: 1240px; margin: 0 auto; padding: 36px 20px 80px; }
        .glass-panel { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 24px; backdrop-filter: blur(12px); }
        .tab-btn {
          padding: 10px 18px; border-radius: 12px; font-weight: 700; font-size: 0.85rem;
          cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08); background: rgba(255, 255, 255, 0.02);
          color: #94a3b8; transition: all 0.2s;
        }
        .tab-btn:hover { background: rgba(255, 255, 255, 0.06); color: #fff; }
        .tab-btn.active {
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.2), rgba(6, 182, 212, 0.2));
          border-color: #6366f1; color: #fff; box-shadow: 0 0 15px rgba(79, 70, 229, 0.25);
        }
        .persona-card {
          background: rgba(255, 255, 255, 0.025); border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px; padding: 28px; margin-bottom: 24px; transition: 0.25s;
          position: relative; overflow: hidden;
        }
        .persona-card:hover {
          border-color: rgba(99, 102, 241, 0.4);
          box-shadow: 0 10px 30px rgba(0,0,0,0.4);
        }
        .pill-badge {
          display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px;
          border-radius: 20px; font-size: 0.72rem; font-weight: 700;
        }
        .btn-action {
          padding: 8px 14px; border-radius: 10px; font-size: 0.78rem; font-weight: 700;
          cursor: pointer; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05);
          color: white; display: inline-flex; align-items: center; gap: 6px; transition: 0.2s;
        }
        .btn-action:hover {
          background: rgba(99, 102, 241, 0.2); border-color: #6366f1;
        }
        .copy-pill {
          cursor: pointer; padding: 4px 10px; border-radius: 8px; font-size: 0.72rem;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8; display: inline-flex; align-items: center; gap: 4px; transition: 0.2s;
        }
        .copy-pill:hover { color: #fff; background: rgba(255,255,255,0.1); }
      `}</style>

      <Navbar variant="insights" />

      <div className="insights-container">
        {/* Header with Title & Metadata */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span className="pill-badge" style={{ background: 'rgba(79, 70, 229, 0.15)', color: '#818cf8', border: '1px solid rgba(79, 70, 229, 0.3)' }}>
                <Sparkles size={12} /> GenAI Intelligence Studio
              </span>
              {personasMeta && (
                <span className="pill-badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.3)' }}>
                  <Cpu size={12} /> {personasMeta.provider} ({personasMeta.model})
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 6px', letterSpacing: '-0.8px' }}>
              Customer Personas & GenAI Studio
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
              Translating unsupervised K-Means clusters into psychographic profiles and high-converting marketing campaigns.
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="tab-btn"
              onClick={() => {
                if (rawSummary) loadAIPersonas(rawSummary, stats.total, {})
              }}
              disabled={personasLoading}
              title="Regenerate personas with fresh LLM inference"
            >
              <RefreshCw size={14} className={personasLoading ? 'spinner' : ''} />
              {personasLoading ? 'Generating...' : 'Regenerate AI Personas'}
            </button>
            <button
              className="tab-btn"
              style={{ background: '#6366f1', color: 'white', border: 'none' }}
              onClick={() => navigate('/dashboard')}
            >
              Reports Dashboard <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Studio Navigation Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 30, overflowX: 'auto', paddingBottom: 6 }}>
          <button
            className={`tab-btn ${activeTab === 'personas' ? 'active' : ''}`}
            onClick={() => setActiveTab('personas')}
          >
            <Users size={16} /> 1. AI Personas & Centroids
          </button>
          <button
            className={`tab-btn ${activeTab === 'campaign' ? 'active' : ''}`}
            onClick={() => setActiveTab('campaign')}
          >
            <Megaphone size={16} /> 2. AI Campaign Studio
          </button>
          <button
            className={`tab-btn ${activeTab === 'synthetic' ? 'active' : ''}`}
            onClick={() => setActiveTab('synthetic')}
          >
            <UserCheck size={16} /> 3. Synthetic Customer Simulator
          </button>
          <button
            className={`tab-btn ${activeTab === 'memo' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('memo')
              if (!memoText) handleGenerateMemo()
            }}
          >
            <FileText size={16} /> 4. C-Suite Executive Memo
          </button>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: AI PERSONAS & CLUSTERS */}
        {/* ============================================================== */}
        {activeTab === 'personas' && (
          <div>
            {/* Top Stat Row & Distribution */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, marginBottom: 32 }}>
              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '14px',
                  background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8'
                }}>
                  <Users size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Total Records</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900 }}>{stats.total}</div>
                </div>
              </div>

              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '14px',
                  background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee'
                }}>
                  <TrendingUp size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Avg Spending Score</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900 }}>{stats.avgScore} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/ 100</span></div>
                </div>
              </div>

              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                <div style={{
                  width: 50, height: 50, borderRadius: '14px',
                  background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399'
                }}>
                  <Sparkles size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Active AI Archetypes</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900 }}>{aiPersonas.length || Object.keys(rawSummary || {}).length}</div>
                </div>
              </div>
            </div>

            {/* Persona Cards List */}
            {personasLoading ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3, marginBottom: 16 }} />
                <h3 style={{ margin: '0 0 8px' }}>Synthesizing Consumer Personas with GenAI...</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Evaluating cluster income brackets, spending velocities, and psychographic decision drivers.
                </p>
              </div>
            ) : (
              aiPersonas.map((persona, idx) => {
                const color = COLORS[idx % COLORS.length]
                const clusterCount = rawClusters.filter(c => c === persona.cluster_id).length
                const pct = stats.total > 0 ? ((clusterCount / stats.total) * 100).toFixed(1) : 0

                return (
                  <div key={persona.cluster_id} className="persona-card" style={{ borderLeft: `6px solid ${color}` }}>
                    {/* Top Row: Title, Tagline, Count */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 20 }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                          <h2 style={{ margin: 0, fontSize: '1.6rem', fontWeight: 800 }}>
                            {persona.archetype}
                          </h2>
                          <span className="pill-badge" style={{ background: `${color}20`, color: color, border: `1px solid ${color}40` }}>
                            Cluster {persona.cluster_id}
                          </span>
                        </div>
                        <p style={{ color: '#cbd5e1', fontSize: '0.95rem', margin: 0 }}>
                          {persona.tagline}
                        </p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '2.2rem', fontWeight: 950, color: color, lineHeight: 1 }}>{pct}%</div>
                        <small style={{ color: '#64748b', fontWeight: 600 }}>{clusterCount} Customers</small>
                      </div>
                    </div>

                    {/* Middle Section: Traits & Radar Chart */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 22 }}>
                      {/* Radar Chart */}
                      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '16px', padding: '10px' }}>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, padding: '4px 10px', textTransform: 'uppercase' }}>
                          Psychographic Attribute Radar
                        </div>
                        <ResponsiveContainer width="100%" height={210}>
                          <RadarChart data={persona.traits || []}>
                            <PolarGrid stroke="rgba(255,255,255,0.08)" />
                            <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <Radar name={persona.archetype} dataKey="value" stroke={color} fill={color} fillOpacity={0.45} />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Behavioral & Psychology Metrics */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Target size={14} color={color} /> Core Desire
                          </div>
                          <div style={{ fontSize: '0.88rem', color: '#e2e8f0', fontWeight: 500 }}>
                            {persona.core_desire || "Uncompromised quality and seamless shopping experience"}
                          </div>
                        </div>

                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '14px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.05)' }}>
                          <div style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <AlertCircle size={14} color="#f87171" /> Buying Friction / Hesitation
                          </div>
                          <div style={{ fontSize: '0.88rem', color: '#e2e8f0', fontWeight: 500 }}>
                            {persona.biggest_friction || "Price sensitivity or lack of social proof"}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Churn Risk</div>
                            <div style={{
                              fontSize: '0.95rem', fontWeight: 800, marginTop: 4,
                              color: persona.churn_risk === 'High' ? '#f87171' : persona.churn_risk === 'Moderate' ? '#fbbf24' : '#34d399'
                            }}>
                              {persona.churn_risk || "Low"}
                            </div>
                          </div>

                          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Price Elasticity</div>
                            <div style={{ fontSize: '0.95rem', fontWeight: 800, marginTop: 4, color: '#38bdf8' }}>
                              {persona.price_sensitivity || "Moderate"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tactical Do's and Don'ts */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 20 }}>
                      <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '14px', borderRadius: '14px' }}>
                        <div style={{ color: '#34d399', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <CheckCircle2 size={14} /> Tactical Marketing Do's
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                          {(persona.tactical_dos || ["Leverage personalized recommendations"]).map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '14px', borderRadius: '14px' }}>
                        <div style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <ShieldAlert size={14} /> Tactical Marketing Don'ts
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: '0.82rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                          {(persona.tactical_donts || ["Avoid generic blast campaigns"]).map((d, i) => (
                            <li key={i}>{d}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Action Triggers */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap', gap: 10 }}>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {(persona.optimal_channels || ["Email", "SMS"]).map((ch, i) => (
                          <span key={i} style={{ fontSize: '0.73rem', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '8px', color: '#94a3b8' }}>
                            {ch}
                          </span>
                        ))}
                      </div>

                      <div style={{ display: 'flex', gap: 10 }}>
                        <button
                          className="btn-action"
                          onClick={() => handleGenerateSynthetic(persona.cluster_id)}
                        >
                          <UserCheck size={14} /> Simulate Customers
                        </button>
                        <button
                          className="btn-action"
                          style={{ background: 'linear-gradient(135deg, #4f46e5, #06b6d4)', borderColor: '#6366f1' }}
                          onClick={() => {
                            setSelectedClusterForCampaign(persona.cluster_id)
                            handleGenerateCampaign(persona.cluster_id)
                          }}
                        >
                          <Megaphone size={14} /> Launch AI Campaign Studio <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: AI CAMPAIGN STUDIO */}
        {/* ============================================================== */}
        {activeTab === 'campaign' && (
          <div>
            {/* Control Bar */}
            <div className="glass-panel" style={{ marginBottom: 28 }}>
              <h3 style={{ margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.1rem' }}>
                <Megaphone size={18} color="#818cf8" />
                Configure Omnichannel AI Campaign
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, alignItems: 'flex-end' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Target Customer Segment
                  </label>
                  <select
                    value={selectedClusterForCampaign}
                    onChange={(e) => setSelectedClusterForCampaign(parseInt(e.target.value))}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                      color: 'white', fontSize: '0.85rem', outline: 'none'
                    }}
                  >
                    {aiPersonas.map(p => (
                      <option key={p.cluster_id} value={p.cluster_id}>
                        Cluster {p.cluster_id}: {p.archetype}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Campaign Objective
                  </label>
                  <select
                    value={selectedGoal}
                    onChange={(e) => setSelectedGoal(e.target.value)}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                      color: 'white', fontSize: '0.85rem', outline: 'none'
                    }}
                  >
                    {CAMPAIGN_GOALS.map((g, i) => (
                      <option key={i} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Brand Name
                  </label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    style={{
                      width: '100%', padding: '11px 14px', borderRadius: '12px',
                      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                      color: 'white', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>

                <button
                  onClick={() => handleGenerateCampaign()}
                  disabled={campaignLoading}
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                    border: 'none', color: 'white', padding: '12px 20px', borderRadius: '12px',
                    fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', height: '44px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)'
                  }}
                >
                  {campaignLoading ? (
                    <>
                      <span className="spinner" style={{ width: 16, height: 16 }} />
                      Generating Copy...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} /> Generate Campaign
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Campaign Output */}
            {campaignLoading && (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '70px 20px' }}>
                <span className="spinner" style={{ width: 36, height: 36, borderWidth: 3, marginBottom: 18 }} />
                <h3>Drafting Multi-Channel Copy with Generative AI...</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Aligning subject lines, persuasion hooks, and discount economics with the persona's psychographics.
                </p>
              </div>
            )}

            {!campaignLoading && !campaignData && (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '80px 20px' }}>
                <Megaphone size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                <h3>No Campaign Generated Yet</h3>
                <p style={{ color: '#94a3b8', maxWidth: '460px', margin: '0 auto 20px' }}>
                  Select your target customer segment and click "Generate Campaign" to produce high-converting email, SMS, and ad copy.
                </p>
                <button
                  className="tab-btn"
                  style={{ background: '#6366f1', color: '#fff', border: 'none' }}
                  onClick={() => handleGenerateCampaign()}
                >
                  <Sparkles size={16} /> Generate Demo Campaign
                </button>
              </div>
            )}

            {!campaignLoading && campaignData && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {/* Strategic Rationale Banner */}
                <div style={{
                  background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.25)',
                  borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', flexWrap: 'wrap', gap: 14
                }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#818cf8', letterSpacing: '0.5px' }}>
                      CAMPAIGN CONCEPT
                    </span>
                    <h2 style={{ margin: '4px 0 6px', fontSize: '1.4rem', fontWeight: 800 }}>
                      {campaignData.campaign_name}
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#cbd5e1' }}>
                      {campaignData.strategic_rationale}
                    </p>
                  </div>
                </div>

                {/* Grid of Multi-Channel Deliverables */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
                  {/* 1. EMAIL CAMPAIGN */}
                  <div className="glass-panel">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1rem', fontWeight: 800 }}>
                        <Mail size={18} color="#818cf8" /> Email Deliverable
                      </div>
                      <button
                        className="copy-pill"
                        onClick={() => copyToClipboard(
                          `Subject: ${campaignData.email?.subject_line}\n\n${campaignData.email?.headline}\n\n${campaignData.email?.body_copy}\n\nCTA: ${campaignData.email?.cta_button}`,
                          'email'
                        )}
                      >
                        {copiedKey === 'email' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                        {copiedKey === 'email' ? 'Copied' : 'Copy Email'}
                      </button>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Subject Line</div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', marginTop: 3 }}>
                        {campaignData.email?.subject_line}
                      </div>
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Preheader Preview</div>
                      <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: 3, fontStyle: 'italic' }}>
                        {campaignData.email?.preheader}
                      </div>
                    </div>

                    <div style={{
                      background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '16px',
                      border: '1px solid rgba(255,255,255,0.05)', marginBottom: 16
                    }}>
                      <div style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: 10, color: '#e2e8f0' }}>
                        {campaignData.email?.headline}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                        {campaignData.email?.body_copy}
                      </div>
                      <div style={{ marginTop: 16, textAlign: 'center' }}>
                        <button style={{
                          background: '#6366f1', color: 'white', border: 'none',
                          padding: '10px 24px', borderRadius: '10px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer'
                        }}>
                          {campaignData.email?.cta_button || "Claim Offer Now"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 2. SMS & SOCIAL AD COPY */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {/* SMS / WhatsApp */}
                    <div className="glass-panel">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', fontWeight: 800 }}>
                          <Smartphone size={16} color="#22d3ee" /> SMS & WhatsApp Blast
                        </div>
                        <button
                          className="copy-pill"
                          onClick={() => copyToClipboard(campaignData.sms?.message, 'sms')}
                        >
                          {copiedKey === 'sms' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                          {copiedKey === 'sms' ? 'Copied' : 'Copy SMS'}
                        </button>
                      </div>

                      <div style={{
                        background: '#0d1322', borderRadius: '14px', padding: '16px',
                        border: '1px solid rgba(6, 182, 212, 0.2)', position: 'relative'
                      }}>
                        <div style={{ fontSize: '0.88rem', color: '#f8fafc', lineHeight: 1.5 }}>
                          💬 {campaignData.sms?.message}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 10, textAlign: 'right' }}>
                          Char count: {campaignData.sms?.char_count || campaignData.sms?.message?.length || 0} / 160
                        </div>
                      </div>
                    </div>

                    {/* Social Media Ad Copy */}
                    <div className="glass-panel">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', fontWeight: 800 }}>
                          <Megaphone size={16} color="#ec4899" /> Social & Feed Ad Copy
                        </div>
                        <button
                          className="copy-pill"
                          onClick={() => copyToClipboard(
                            `Hook: ${campaignData.social_ad?.hook}\n\nCaption: ${campaignData.social_ad?.caption}\n\nBrief: ${campaignData.social_ad?.creative_brief}`,
                            'social'
                          )}
                        >
                          {copiedKey === 'social' ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                          {copiedKey === 'social' ? 'Copied' : 'Copy Ad'}
                        </button>
                      </div>

                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>3-Second Hook</div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ec4899', marginTop: 2 }}>
                          "{campaignData.social_ad?.hook}"
                        </div>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Caption</div>
                        <div style={{ fontSize: '0.84rem', color: '#cbd5e1', lineHeight: 1.5, marginTop: 2 }}>
                          {campaignData.social_ad?.caption}
                        </div>
                      </div>

                      <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Designer Creative Brief</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                          🎨 {campaignData.social_ad?.creative_brief}
                        </div>
                      </div>
                    </div>

                    {/* Pricing & Discount Strategy */}
                    <div className="glass-panel" style={{ background: 'rgba(16, 185, 129, 0.05)', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem', fontWeight: 800, color: '#34d399', marginBottom: 10 }}>
                        <DollarSign size={16} /> Economic Rationale & Offer Strategy
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>
                        {campaignData.pricing_and_discount?.recommended_discount}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                        Psychological trigger: <b>{campaignData.pricing_and_discount?.psychological_trigger}</b>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: SYNTHETIC CUSTOMER SIMULATOR */}
        {/* ============================================================== */}
        {activeTab === 'synthetic' && (
          <div>
            <div className="glass-panel" style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h3 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <UserCheck size={18} color="#22d3ee" /> Synthetic Customer Lab (Data Augmentation)
                </h3>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
                  LLM-synthesized individual test profiles modeled after the cluster's mathematical and psychological distribution.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <select
                  value={syntheticCluster}
                  onChange={(e) => {
                    const cid = parseInt(e.target.value)
                    setSyntheticCluster(cid)
                    handleGenerateSynthetic(cid)
                  }}
                  style={{
                    padding: '10px 14px', borderRadius: '12px',
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
                    color: 'white', fontSize: '0.85rem', outline: 'none'
                  }}
                >
                  {aiPersonas.map(p => (
                    <option key={p.cluster_id} value={p.cluster_id}>
                      Cluster {p.cluster_id}: {p.archetype}
                    </option>
                  ))}
                </select>

                <button
                  className="tab-btn"
                  onClick={() => handleGenerateSynthetic()}
                  disabled={syntheticLoading}
                >
                  <RefreshCw size={14} className={syntheticLoading ? 'spinner' : ''} />
                  {syntheticLoading ? 'Synthesizing...' : 'Re-generate Profiles'}
                </button>
              </div>
            </div>

            {syntheticLoading ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '70px 20px' }}>
                <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3, marginBottom: 16 }} />
                <h3>Synthesizing Individual Personas with Generative AI...</h3>
              </div>
            ) : syntheticProfiles.length === 0 ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '80px 20px' }}>
                <UserCheck size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                <h3>No Synthetic Profiles Loaded</h3>
                <button
                  className="tab-btn"
                  style={{ background: '#6366f1', color: '#fff', border: 'none', marginTop: 12 }}
                  onClick={() => handleGenerateSynthetic(0)}
                >
                  <Sparkles size={16} /> Generate Synthetic Profiles for Cluster 0
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
                {syntheticProfiles.map((prof, i) => (
                  <div key={i} className="glass-panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      {/* Avatar & Header */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                        <div style={{
                          fontSize: '1.8rem', width: 52, height: 52, borderRadius: '16px',
                          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                          {prof.avatar_emoji || "👤"}
                        </div>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>{prof.name}</h3>
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                            {prof.occupation} • Age {prof.age}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{prof.location}</div>
                        </div>
                      </div>

                      {/* Financial Metrics */}
                      <div style={{
                        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
                        background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '12px',
                        marginBottom: 16, border: '1px solid rgba(255,255,255,0.04)'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Annual Income</div>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#34d399' }}>${prof.annual_income_k}k / yr</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Spending Score</div>
                          <div style={{ fontSize: '1rem', fontWeight: 800, color: '#22d3ee' }}>{prof.spending_score} / 100</div>
                        </div>
                      </div>

                      {/* Quote */}
                      <div style={{
                        fontStyle: 'italic', fontSize: '0.84rem', color: '#e2e8f0',
                        marginBottom: 16, padding: '10px 14px', background: 'rgba(255,255,255,0.02)',
                        borderLeft: '3px solid #818cf8', borderRadius: '0 8px 8px 0'
                      }}>
                        "{prof.customer_quote}"
                      </div>

                      {/* Favorite Brands */}
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, marginBottom: 4 }}>
                          Affinity Brands
                        </div>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {(prof.favorite_brands || []).map((b, bi) => (
                            <span key={bi} style={{ fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: '6px' }}>
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Reaction to Discount */}
                    <div style={{
                      marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)',
                      fontSize: '0.78rem', color: '#cbd5e1'
                    }}>
                      <span style={{ color: '#fbbf24', fontWeight: 700 }}>Simulated Offer Reaction: </span>
                      {prof.likely_reaction_to_discount}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: C-SUITE EXECUTIVE MEMO */}
        {/* ============================================================== */}
        {activeTab === 'memo' && (
          <div>
            <div className="glass-panel" style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
              <div>
                <h3 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={18} color="#818cf8" /> C-Suite Strategic Intelligence Briefing
                </h3>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                  Board-level strategic synthesis analyzing cluster economics, margin preservation, and 90-day execution roadmaps.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  className="tab-btn"
                  onClick={handleGenerateMemo}
                  disabled={memoLoading}
                >
                  <RefreshCw size={14} className={memoLoading ? 'spinner' : ''} />
                  {memoLoading ? 'Drafting Memo...' : 'Regenerate Briefing'}
                </button>
                {memoText && (
                  <button
                    className="tab-btn"
                    style={{ background: '#6366f1', color: '#fff', border: 'none' }}
                    onClick={() => {
                      copyToClipboard(memoText, 'memo')
                      setMemoCopied(true)
                      setTimeout(() => setMemoCopied(false), 2000)
                    }}
                  >
                    {memoCopied ? <Check size={14} /> : <Copy size={14} />}
                    {memoCopied ? 'Copied Markdown' : 'Copy Full Memo'}
                  </button>
                )}
              </div>
            </div>

            {memoLoading ? (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '80px 20px' }}>
                <span className="spinner" style={{ width: 34, height: 34, borderWidth: 3, marginBottom: 16 }} />
                <h3>Drafting Board-Level Executive Briefing...</h3>
              </div>
            ) : memoText ? (
              <div className="glass-panel" style={{ padding: '36px', lineHeight: 1.7, fontSize: '0.92rem' }}>
                <div style={{ whiteSpace: 'pre-line' }}>{memoText}</div>
              </div>
            ) : (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px' }}>
                <FileText size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                <p>Click Generate to draft your executive memo.</p>
                <button className="tab-btn" style={{ background: '#6366f1', color: 'white', border: 'none' }} onClick={handleGenerateMemo}>
                  <Sparkles size={16} /> Draft Executive Memo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}