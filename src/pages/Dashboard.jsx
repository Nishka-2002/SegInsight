import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts'
import {
  FileSpreadsheet, FileText, Users, TrendingUp,
  DollarSign, Activity, LayoutDashboard, Download
} from 'lucide-react'

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']

export default function Dashboard() {
  const [downloading, setDownloading] = useState('')
  const [clusters, setClusters] = useState([])
  const [summary, setSummary] = useState({})

  // ✅ Load data from local storage (saved during the Upload/Run process)
  useEffect(() => {
    const storedClusters = localStorage.getItem("clusters")
    const storedSummary = localStorage.getItem("summary")
    
    if (storedClusters) setClusters(JSON.parse(storedClusters))
    if (storedSummary) setSummary(JSON.parse(storedSummary))
  }, [])

  const totalCustomers = clusters.length

  // ✅ Helper to calculate global average
  const calculateGlobalAvg = () => {
    const keys = Object.keys(summary)
    if (keys.length === 0) return '0'
    const total = keys.reduce((acc, key) => acc + (summary[key]["Spending Score (1-100)"] || 0), 0)
    return (total / keys.length).toFixed(1)
  }

  const kpis = [
    { label: 'Total Customers', value: totalCustomers || '0', icon: <Users size={18} />, color: '#818cf8' },
    { label: 'Avg. Spend Score', value: calculateGlobalAvg(), icon: <TrendingUp size={18} />, color: '#22d3ee' },
    { label: 'Revenue Index', value: '84.7', icon: <DollarSign size={18} />, color: '#34d399' },
    { label: 'Engagement Rate', value: '67.2%', icon: <Activity size={18} />, color: '#fbbf24' },
  ]

  // ✅ Map data for Charts
  const segmentCounts = {}
  clusters.forEach(c => {
    segmentCounts[c] = (segmentCounts[c] || 0) + 1
  })

  const segBarData = Object.keys(summary).map((key) => ({
    name: `Cluster ${key}`,
    customers: segmentCounts[key] || 0,
    avgSpend: summary[key]["Spending Score (1-100)"]?.toFixed(1) || 0,
    revenue: summary[key]["Annual Income (k$)"]?.toFixed(1) || 0
  }))

  const spendDistrib = Object.keys(segmentCounts).map((key) => ({
    name: `Cluster ${key}`,
    value: totalCustomers > 0 ? Math.round((segmentCounts[key] / totalCustomers) * 100) : 0
  }))

  // ✅ REAL EXPORT CSV LOGIC
  const handleExportCSV = () => {
    setDownloading('csv')
    
    // Prepare Data
    const headers = ["Cluster ID", "Customer Count", "Avg Annual Income (k$)", "Avg Spending Score"]
    const rows = Object.keys(summary).map(key => [
      key,
      segmentCounts[key] || 0,
      summary[key]["Annual Income (k$)"]?.toFixed(2) || 0,
      summary[key]["Spending Score (1-100)"]?.toFixed(2) || 0
    ])

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n")

    // Create Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `SegInsight_Report_${new Date().toLocaleDateString()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    setTimeout(() => setDownloading(''), 1000)
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: '#11111a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }}>
        <p style={{ margin: '0 0 8px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>{label}</p>
        {payload.map((p, idx) => (
          <div key={idx} style={{ color: p.color, fontSize: '0.9rem', fontWeight: 600 }}>
            {p.name}: {p.value}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="dashboard-root">
      <Navbar variant="dashboard" />

      <div className="dashboard-container">
        {/* Header Section */}
        <header className="dashboard-header">
          <div className="header-text">
            <h1><LayoutDashboard size={28} style={{verticalAlign: 'bottom', marginRight: 10, color: '#6366f1'}}/> Reports & Analytics</h1>
            <p>Visualizing segmented customer behavior and financial metrics.</p>
          </div>
          
          <div className="header-actions">
            <button className="action-btn csv" onClick={handleExportCSV}>
              <FileSpreadsheet size={16} /> {downloading === 'csv' ? 'Generating...' : 'Export CSV'}
            </button>
            <button className="action-btn pdf" onClick={() => alert("PDF Exporting requires 'jspdf' library. Use CSV for now!")}>
              <Download size={16} /> Download PDF
            </button>
          </div>
        </header>

        {/* KPI Row */}
        <div className="kpi-grid">
          {kpis.map(k => (
            <div key={k.label} className="kpi-card">
              <div className="kpi-icon" style={{color: k.color, background: `${k.color}15`}}>{k.icon}</div>
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-label">{k.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Section */}
        {totalCustomers > 0 ? (
          <div className="charts-grid">
            <div className="chart-card">
              <h3>Customer Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={segBarData}>
                  <XAxis dataKey="name" stroke="#4b5563" fontSize={11} axisLine={false} tickLine={false} />
                  <YAxis stroke="#4b5563" fontSize={11} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.03)'}} />
                  <Bar dataKey="customers" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-card">
              <h3>Segment Market Share</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie 
                    data={spendDistrib} 
                    dataKey="value" 
                    innerRadius={70} 
                    outerRadius={100} 
                    paddingAngle={8} 
                    stroke="none"
                  >
                    {spendDistrib.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <TrendingUp size={40} style={{opacity: 0.2, marginBottom: 15}}/>
            <p>No segmentation data available. Please upload a dataset to generate reports.</p>
          </div>
        )}
      </div>

      <style>{`
        .dashboard-root { background: #05050a; min-height: 100vh; color: white; font-family: 'Inter', sans-serif; }
        .dashboard-container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
        
        .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 40px; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 20px; }
        .header-text h1 { margin: 0; font-size: 2rem; font-weight: 800; letter-spacing: -1px; }
        .header-text p { margin: 5px 0 0; color: #64748b; }
        
        .header-actions { display: flex; gap: 12px; }
        .action-btn { border: none; padding: 12px 20px; border-radius: 12px; font-weight: 700; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s; }
        .action-btn.csv { background: rgba(255,255,255,0.05); color: white; border: 1px solid rgba(255,255,255,0.1); }
        .action-btn.csv:hover { background: rgba(255,255,255,0.1); }
        .action-btn.pdf { background: #6366f1; color: white; }
        .action-btn.pdf:hover { background: #4f46e5; transform: translateY(-2px); }

        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .kpi-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 25px; border-radius: 24px; }
        .kpi-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; }
        .kpi-value { font-size: 2.2rem; font-weight: 900; line-height: 1; margin-bottom: 5px; }
        .kpi-label { color: #64748b; font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; }

        .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 25px; }
        .chart-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); padding: 30px; border-radius: 24px; }
        .chart-card h3 { margin: 0 0 25px; font-size: 1.1rem; color: #94a3b8; }

        .empty-state { text-align: center; padding: 100px 0; background: rgba(255,255,255,0.02); border: 2px dashed rgba(255,255,255,0.05); border-radius: 30px; color: #475569; }
      `}</style>
    </div>
  )
}