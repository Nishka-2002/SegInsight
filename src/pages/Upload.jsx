import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload as UploadIcon, FileText, CheckCircle, Zap, Download, Sparkles, Database } from 'lucide-react'
import Navbar from '../components/Navbar'
import { loadSampleDemoDataset } from '../services/genaiApi'

export default function Upload() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)

  const handleUpload = async () => {
    if (!file) return alert("Please select a file")

    const formData = new FormData()
    formData.append("file", file)

    try {
      setLoading(true)
      const res = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData
      })

      if (!res.ok) throw new Error("Upload failed")

      const data = await res.json()
      localStorage.setItem("clusterData", JSON.stringify(data))
      localStorage.setItem("clusters", JSON.stringify(data.clusters || []))
      localStorage.setItem("recommendations", JSON.stringify(data.recommendations || {}))
      
      setLoading(false)
      navigate("/overview")
    } catch (err) {
      console.error(err)
      setLoading(false)
      alert("Upload failed. Make sure your CSV has 'Income' and 'Score' columns.")
    }
  }

  const handleQuickDemo = async () => {
    try {
      setDemoLoading(true)
      const data = await loadSampleDemoDataset()

      localStorage.setItem("clusterData", JSON.stringify(data))
      localStorage.setItem("clusters", JSON.stringify(data.clusters || []))
      localStorage.setItem("summary", JSON.stringify(data.summary || {}))
      localStorage.setItem("scatterData", JSON.stringify(data.scatter || []))
      localStorage.setItem("recommendations", JSON.stringify(data.recommendations || {}))

      setDemoLoading(false)
      navigate("/overview")
    } catch (err) {
      console.error(err)
      setDemoLoading(false)
      alert("Failed to load sample dataset: " + err.message)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#05050a',
      color: 'white',
      fontFamily: 'Inter, sans-serif'
    }}>
      <style>{`
        .upload-card {
          background: rgba(255, 255, 255, 0.03);
          border: 2px dashed rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 40px;
          text-align: center;
          transition: 0.3s;
        }
        .upload-card:hover {
          border-color: #4f46e5;
          background: rgba(79, 70, 229, 0.05);
        }
        .demo-card {
          background: linear-gradient(135deg, rgba(79, 70, 229, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 24px;
          padding: 30px;
          transition: 0.3s;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .demo-card:hover {
          border-color: #06b6d4;
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(6, 182, 212, 0.15);
        }
        .file-input { display: none; }
        .file-label {
          display: inline-block;
          padding: 12px 24px;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          margin-bottom: 20px;
          border: 1px solid rgba(255,255,255,0.1);
          transition: 0.2s;
        }
        .file-label:hover { background: rgba(255,255,255,0.1); }
        .btn-primary {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #4f46e5, #06b6d4);
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);
          transition: 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-primary:hover {
          transform: translateY(-1px);
          opacity: 0.95;
        }
        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <Navbar variant="upload" />

      <div style={{ padding: '60px 24px 80px', position: 'relative', maxWidth: '1100px', margin: '0 auto' }}>
        {/* Glow */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)',
          zIndex: 0, pointerEvents: 'none'
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px',
              borderRadius: '20px', background: 'rgba(6,182,212,0.15)',
              color: '#22d3ee', border: '1px solid rgba(6,182,212,0.3)', marginBottom: 12
            }}>
              <Sparkles size={12} /> GenAI Trainee Pipeline
            </span>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 12 }}>
              Customer Data Ingestion
            </h1>
            <p style={{ color: '#94a3b8', maxWidth: '580px', margin: '0 auto' }}>
              Upload your customer CSV dataset or load our benchmark Mall Customers dataset to perform K-Means clustering and Generative AI persona synthesis.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24 }}>
            {/* Quick Demo Card */}
            <div className="demo-card">
              <div>
                <div style={{
                  width: 50, height: 50, borderRadius: '14px',
                  background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 18, boxShadow: '0 0 20px rgba(79, 70, 229, 0.4)'
                }}>
                  <Zap size={24} color="white" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Instant Demo Mode</h3>
                  <span style={{
                    fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)',
                    padding: '2px 8px', borderRadius: '12px', fontWeight: 700
                  }}>
                    Recommended for Interview
                  </span>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 20 }}>
                  Pre-loads 200 customer records from the standard Mall Customers dataset with Annual Income, Spending Score, Age, and Gender. Runs clustering and pre-configures AI persona generation.
                </p>

                <div style={{
                  background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '14px',
                  marginBottom: 24, border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#94a3b8'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span>Records:</span> <strong style={{ color: '#fff' }}>200 Customers</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span>Features:</span> <strong style={{ color: '#fff' }}>Income & Spending Score</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Ready for:</span> <strong style={{ color: '#22d3ee' }}>K-Means + GenAI Studio</strong>
                  </div>
                </div>
              </div>

              <div>
                <button
                  className="btn-primary"
                  onClick={handleQuickDemo}
                  disabled={demoLoading}
                >
                  {demoLoading ? (
                    <>
                      <span className="spinner" style={{ width: 16, height: 16 }} />
                      Loading Dataset...
                    </>
                  ) : (
                    <>
                      <Zap size={16} /> 1-Click Instant Demo Launch
                    </>
                  )}
                </button>

                <div style={{ textAlign: 'center', marginTop: 12 }}>
                  <a
                    href="/Mall_Customers.csv"
                    download="Mall_Customers.csv"
                    style={{
                      fontSize: '0.78rem', color: '#64748b', textDecoration: 'none',
                      display: 'inline-flex', alignItems: 'center', gap: 4
                    }}
                  >
                    <Download size={12} /> Download Sample CSV File
                  </a>
                </div>
              </div>
            </div>

            {/* Manual Upload Card */}
            <div className="upload-card">
              <div style={{ marginBottom: 20 }}>
                <div style={{ 
                  width: 60, height: 60, background: 'rgba(79, 70, 229, 0.1)', 
                  borderRadius: '50%', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', margin: '0 auto 16px' 
                }}>
                  <UploadIcon size={26} color="#818cf8" />
                </div>
                
                <h3 style={{ margin: '0 0 6px', fontSize: '1.25rem', fontWeight: 800 }}>Upload Custom CSV</h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {file ? file.name : "Select or drag & drop your customer CSV file"}
                </p>
              </div>

              <input
                type="file"
                id="file-upload"
                className="file-input"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <label htmlFor="file-upload" className="file-label">
                {file ? "Change File" : "Browse Files"}
              </label>

              <button 
                className="btn-primary" 
                onClick={handleUpload} 
                disabled={loading || !file}
              >
                {loading ? "Analyzing Data..." : "Upload & Analyze"}
              </button>

              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 16 }}>
                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle size={13} color="#10b981" /> Column Auto-Mapping
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CheckCircle size={13} color="#10b981" /> Missing Value Handling
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
