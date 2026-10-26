import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { Star, Send, CheckCircle2, MessageSquare } from 'lucide-react'

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']
const ratingColors = ['', '#ef4444', '#f59e0b', '#06b6d4', '#10b981', '#4f46e5']

export default function Feedback() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', rating: 0, comment: '' })
  const [hovered, setHovered] = useState(0)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.rating) return

    setLoading(true)

    try {
      const res = await fetch("http://localhost:8000/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name || "Anonymous",
          email: form.email || "N/A",
          rating: Number(form.rating), 
          comments: form.comment // ✅ Sending 'comments' to match Python schema
        })
      })

      if (!res.ok) {
        const errDetail = await res.json()
        console.log("Backend error:", errDetail)
        throw new Error("Failed")
      }
      
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      alert("Submission failed. Check if FastAPI is running and CORS is enabled.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="feedback-page">
      <style>{`
        .feedback-page { background: #05050a; color: white; min-height: 100vh; font-family: 'Inter', sans-serif; }
        .center-wrap { min-height: calc(100vh - 80px); display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 40px; width: 100%; max-width: 500px; backdrop-filter: blur(10px); }
        .form-group { display: flex; flex-direction: column; gap: 15px; margin-top: 25px; }
        input, textarea { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 12px 15px; color: white; outline: none; transition: 0.3s; width: 100%; box-sizing: border-box; }
        input:focus, textarea:focus { border-color: #6366f1; background: rgba(255,255,255,0.08); }
        .stars { display: flex; gap: 8px; justify-content: center; margin: 10px 0; }
        .btn-send { background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border: none; padding: 15px; border-radius: 12px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: 0.3s; }
        .btn-send:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(99, 102, 241, 0.4); }
        .btn-send:disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>

      <Navbar variant="feedback" />

      <div className="center-wrap">
        {!submitted ? (
          <div className="card">
            <div style={{ textAlign: 'center' }}>
              <MessageSquare size={32} color="#6366f1" style={{ marginBottom: 15 }} />
              <h2 style={{ fontSize: '1.8rem', margin: '0 0 10px 0' }}>Feedback</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>How was your experience with the clustering results?</p>
            </div>

            <form onSubmit={handleSubmit} className="form-group">
              <input 
                placeholder="Your Name" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})} 
              />
              <input 
                type="email" 
                placeholder="Email (Optional)" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})} 
              />

              <div style={{ textAlign: 'center' }}>
                <p style={{ color: ratingColors[hovered || form.rating] || '#94a3b8', fontSize: '0.9rem', fontWeight: 600, height: '20px' }}>
                  {ratingLabels[hovered || form.rating]}
                </p>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map(n => (
                    <Star
                      key={n}
                      size={32}
                      style={{ cursor: 'pointer' }}
                      onMouseEnter={() => setHovered(n)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setForm({...form, rating: n})}
                      fill={(hovered || form.rating) >= n ? ratingColors[hovered || form.rating] : 'none'}
                      stroke={(hovered || form.rating) >= n ? ratingColors[hovered || form.rating] : '#4b5563'}
                    />
                  ))}
                </div>
              </div>

              <textarea 
                placeholder="What could we improve?" 
                rows="3" 
                value={form.comment} 
                onChange={e => setForm({...form, comment: e.target.value})} 
              />

              <button className="btn-send" type="submit" disabled={loading || !form.rating}>
                {loading ? "Sending..." : <><Send size={18}/> Send Feedback</>}
              </button>
            </form>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center' }}>
            <CheckCircle2 size={50} color="#10b981" style={{ marginBottom: 20 }} />
            <h2 style={{ fontSize: '1.8rem' }}>Thank You!</h2>
            <p style={{ color: '#94a3b8', marginBottom: 25 }}>Your feedback helps us refine the K-Means engine.</p>
            <button className="btn-send" onClick={() => navigate('/')}>Return Home</button>
          </div>
        )}
      </div>
    </div>
  )
}