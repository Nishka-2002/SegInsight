import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts'
import {
  ArrowRight, Database, Hash, AlertTriangle,
  CheckCircle2, Settings, TrendingUp
} from 'lucide-react'

// ---------------- TOOLTIP ----------------
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#1a1a2e',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: '0.8rem',
    }}>
      <div style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ color: '#818cf8', fontWeight: 700 }}>
        {payload[0].value} records
      </div>
    </div>
  )
}

export default function DataOverview() {
  const navigate = useNavigate()

  // ---------------- GET DATA FROM UPLOAD PAGE ----------------
  const [clusters, setClusters] = useState([])
  const [summary, setSummary] = useState(null)
  const [recommendations, setRecommendations] = useState(null)

  useEffect(() => {
    const storedClusters = JSON.parse(localStorage.getItem("clusters"))
    const storedSummary = JSON.parse(localStorage.getItem("summary"))
    const storedRecs = JSON.parse(localStorage.getItem("recommendations"))

    if (storedClusters) setClusters(storedClusters)
    if (storedSummary) setSummary(storedSummary)
    if (storedRecs) setRecommendations(storedRecs)
  }, [])

  // ---------------- SAFETY CHECK ----------------
  if (!clusters || clusters.length === 0) {
    return (
      <div className="page-wrapper">
        <Navbar variant="overview" />
        <div style={{ padding: 40 }}>
          <h2>⚠ No dataset found</h2>
          <p>Please upload a CSV file first.</p>
          <button onClick={() => navigate('/upload')}>
            Go to Upload
          </button>
        </div>
      </div>
    )
  }

  // ---------------- STATS (DYNAMIC) ----------------
  const stats = [
    { label: 'Total Records', value: clusters.length, icon: <Database size={18} />, color: '#818cf8' },
    { label: 'Clusters Found', value: new Set(clusters).size, icon: <Hash size={18} />, color: '#22d3ee' },
    { label: 'Missing Values', value: 'Handled', icon: <AlertTriangle size={18} />, color: '#fbbf24' },
    { label: 'Model Status', value: 'Ready', icon: <CheckCircle2 size={18} />, color: '#34d399' },
  ]

  // ---------------- CHART DATA ----------------
  const clusterCounts = Object.entries(
    clusters.reduce((acc, c) => {
      acc[c] = (acc[c] || 0) + 1
      return acc
    }, {})
  ).map(([cluster, count]) => ({
    range: `C${cluster}`,
    count
  }))

  const scoreDistData = clusterCounts

  const ageDistData = clusterCounts

  return (
    <div className="page-wrapper">
      <Navbar variant="overview" />

      <div className="container" style={{ paddingTop: 36, paddingBottom: 60 }}>

        {/* HEADER */}
        <div style={{ marginBottom: 32 }}>
          <span className="badge badge-primary">Step 2 of 4</span>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
            Data Overview & Segmentation
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Review clustering results from your uploaded dataset.
          </p>
        </div>

        {/* KPI CARDS */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 16,
          marginBottom: 28
        }}>
          {stats.map(s => (
            <div key={s.label} className="card" style={{ display: 'flex', gap: 14 }}>
              <div style={{
                width: 44,
                height: 44,
                borderRadius: 11,
                background: `${s.color}18`,
                border: `1px solid ${s.color}30`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: s.color
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* CLUSTER TABLE */}
        <div className="card" style={{ marginBottom: 24 }}>
          <h3>Cluster Predictions</h3>
          {clusters.map((c, i) => (
            <p key={i}>Customer {i + 1} → Cluster {c}</p>
          ))}
        </div>

        {/* INSIGHTS */}
        {summary && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3>Insights</h3>
            {Object.keys(summary).map(cluster => (
              <div key={cluster}>
                <p>
                  Cluster {cluster} →
                  Income: {summary[cluster]["Annual Income (k$)"]?.toFixed(2)} |
                  Spending: {summary[cluster]["Spending Score (1-100)"]?.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* RECOMMENDATIONS */}
        {recommendations && (
          <div className="card" style={{ marginBottom: 24 }}>
            <h3>Marketing Recommendations</h3>
            {Object.keys(recommendations).map(cluster => (
              <p key={cluster}>
                Cluster {cluster}: {recommendations[cluster]}
              </p>
            ))}
          </div>
        )}

        {/* CONTINUE */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-primary btn-lg" onClick={() => navigate('/segmentation')}>
            Proceed to Clustering & GenAI <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  )
}
