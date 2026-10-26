import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  ScatterChart, Scatter, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, CartesianGrid
} from 'recharts'
import {
  BrainCircuit, Play, CheckCircle2, ArrowRight,
  Settings, BarChart2, Layers, Clock, Sparkles
} from 'lucide-react'

const CLUSTER_COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6']

const steps = [
  { label: 'Loading Dataset', time: 350 },
  { label: 'Computing Centroids', time: 500 },
  { label: 'Running Iterations', time: 600 },
  { label: 'Converging Clusters', time: 500 },
  { label: 'Grounding GenAI Persona Embeddings', time: 400 },
]

export default function Segmentation() {
  const navigate = useNavigate()
  const [k, setK] = useState(4)
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)
  const [stepIdx, setStepIdx] = useState(-1)
  const [scatterData, setScatterData] = useState([])

  const runSegmentation = async () => {
    // 1. Clear old data immediately to prevent mismatches
    localStorage.removeItem("clusters");
    localStorage.removeItem("summary");
    
    setRunning(true);
    setDone(false);
    setStepIdx(0);

    // ... rest of your fetch logic ...
    try {
      const response = await fetch("http://127.0.0.1:8000/segment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ k: k })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Segmentation failed");

      // Animation logic
      let idx = 0;
      const advance = () => {
        if (idx < steps.length) {
          setStepIdx(idx);
          setTimeout(() => {
            idx++;
            advance();
          }, steps[idx].time);
        } else {
          // ✅ SAVE DATA FOR INSIGHTS PAGE
          localStorage.setItem("clusters", JSON.stringify(data.clusters));
          localStorage.setItem("summary", JSON.stringify(data.summary));
          localStorage.setItem("scatterData", JSON.stringify(data.scatter));

          setScatterData(data.scatter);
          setRunning(false);
          setDone(true);
          setStepIdx(-1);
        }
      };
      advance();

    } catch (err) {
      alert(err.message);
      setRunning(false);
    }
  };

  return (
    <div className="page-wrapper">
      <style>{`
        .page-wrapper { min-height: 100vh; background: #05050a; color: white; font-family: sans-serif; }
        .container { max-width: 1100px; margin: 0 auto; padding: 40px 24px; }
        .card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 20px; padding: 24px; backdrop-filter: blur(12px); }
        .badge-primary { background: rgba(79, 70, 229, 0.1); color: #818cf8; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; border: 1px solid rgba(79, 70, 229, 0.2); }
        .btn-primary { background: linear-gradient(135deg, #4f46e5, #06b6d4); color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; transition: 0.3s; }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-2px); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
        .k-btn { width: 44px; height: 44px; border-radius: 10px; cursor: pointer; font-weight: 700; transition: 0.2s; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05); color: #94a3b8; }
        .k-btn.active { background: #4f46e5; color: white; border-color: #4f46e5; box-shadow: 0 0 15px rgba(79, 70, 229, 0.4); }
        .status-box { margin-top: 20px; padding: 15px; background: rgba(0,0,0,0.2); border-radius: 12px; border-left: 3px solid #4f46e5; }
      `}</style>

      <Navbar variant="segmentation" />

      <div className="container">
        <div style={{ marginBottom: 40 }}>
          <span className="badge-primary">Step 3 of 4</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, marginTop: 12 }}>Customer Segmentation</h1>
          <p style={{ color: '#94a3b8' }}>Adjust the clusters and run the K-Means algorithm.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: 30 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <Settings size={18} color="#818cf8" />
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Parameters</h3>
              </div>
              
              <label style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: 10, display: 'block' }}>
                Target Clusters (K): <strong>{k}</strong>
              </label>
              
              <div style={{ display: 'flex', gap: 10, marginBottom: 25 }}>
                {[2, 3, 4, 5, 6].map(n => (
                  <button key={n} className={`k-btn ${k === n ? 'active' : ''}`} onClick={() => setK(n)}>
                    {n}
                  </button>
                ))}
              </div>

              <button className="btn-primary" onClick={runSegmentation} disabled={running}>
                {running ? "Processing..." : <><Play size={16} fill="white"/> Run Model</>}
              </button>

              {running && stepIdx !== -1 && (
                <div className="status-box">
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#818cf8' }}>SYSTEM LOG</div>
                  <div style={{ fontSize: '0.9rem', marginTop: 4 }}>{steps[stepIdx].label}...</div>
                </div>
              )}
            </div>

            <div className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <BrainCircuit size={18} color="#06b6d4" />
                <h3 style={{ margin: 0, fontSize: '0.9rem' }}>Model Info</h3>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Using <b>K-Means++</b> initialization with Euclidean distance metric. Max iterations capped at 300.
              </p>
            </div>
          </div>

          <div className="card" style={{ minHeight: 400, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {!done && !running && (
              <div style={{ textAlign: 'center', color: '#4b5563' }}>
                <BarChart2 size={48} style={{ marginBottom: 15, opacity: 0.2 }} />
                <p>Configure parameters and run the model to see visualization</p>
              </div>
            )}

            {done && (
              <>
                <h3 style={{ marginTop: 0, marginBottom: 20 }}>Cluster Distribution</h3>
                <ResponsiveContainer width="100%" height={350}>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis type="number" dataKey="x" name="Income" unit="k$" stroke="#64748b" />
                    <YAxis type="number" dataKey="y" name="Score" stroke="#64748b" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter name="Customers" data={scatterData}>
                      {scatterData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={CLUSTER_COLORS[entry.cluster % CLUSTER_COLORS.length]} />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#34d399' }}>
                    <CheckCircle2 size={16} /> Centroids Converged & Ready for LLM Reasoning
                  </div>
                  <button 
                    className="btn-primary" 
                    style={{ width: 'auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8 }}
                    onClick={() => navigate('/insights')}
                  >
                    <Sparkles size={16} /> Launch GenAI Persona & Campaign Studio <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}