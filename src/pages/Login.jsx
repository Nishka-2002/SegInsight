import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Home } from 'lucide-react'

export default function Login() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [regData, setRegData] = useState({ name: '', email: '', password: '' })

  // --- REPLACED LOGIC START ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`Welcome, ${data.user}!`);
        navigate('/upload');
      } else {
        alert(data.detail || "Login failed");
      }
    } catch (error) {
      alert("Could not connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Account created successfully! Please sign in.");
        setTab('login');
      } else {
        alert(data.detail || "Registration failed");
      }
    } catch (error) {
      alert("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };
  // --- REPLACED LOGIC END ---

  return (
    <div style={{
      minHeight: '100vh',
      background: '#05050a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'sans-serif'
    }}>
      <style>{`
        .card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; backdrop-filter: blur(12px); }
        .tab-btn { padding: 12px; border: none; background: transparent; color: #94a3b8; cursor: pointer; font-weight: 600; border-bottom: 2px solid transparent; transition: 0.3s; }
        .tab-btn.active { color: white; border-bottom: 2px solid #4f46e5; }
        .input-group { margin-bottom: 16px; position: relative; }
        input { width: 100%; padding: 12px 16px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: white; box-sizing: border-box; outline: none; transition: 0.2s; }
        input:focus { border-color: #4f46e5; background: rgba(255, 255, 255, 0.08); }
        .submit-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #4f46e5, #06b6d4); border: none; border-radius: 12px; color: white; font-weight: 700; cursor: pointer; margin-top: 10px; }
        .submit-btn:hover { opacity: 0.9; }
        .btn-ghost { color: white; text-decoration: none; display: flex; align-items: center; gap: 8px; font-size: 0.9rem; }
      `}</style>

      {/* Top Bar */}
      <div style={{
        height: 64, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center',
        padding: '0 32px', justifyContent: 'space-between', background: 'rgba(10,10,20,0.8)',
        backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 50,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'white' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#4f46e5,#06b6d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700,
          }}>SI</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>
            Seg<span style={{ background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Insight</span>
          </span>
        </Link>
        <Link to="/" className="btn-ghost">
          <Home size={14} /> Home
        </Link>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(79,70,229,0.15) 0%, transparent 65%)', zIndex: 0 }} />

        <div style={{ width: '100%', maxWidth: 420, zIndex: 1 }}>
          <div className="card" style={{ padding: 36 }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '0 0 8px 0' }}>{tab === 'login' ? 'Welcome back' : 'Create account'}</h1>
              <p style={{ color: '#94a3b8', margin: 0 }}>{tab === 'login' ? 'Sign in to continue your analysis' : 'Get started with SegInsight'}</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', marginBottom: 24, background: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4 }}>
              <button className={`tab-btn ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>Sign In</button>
              <button className={`tab-btn ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>Sign Up</button>
            </div>

            <form onSubmit={tab === 'login' ? handleLogin : handleRegister}>
              {tab === 'register' && (
                <div className="input-group">
                  <input 
                    type="text" 
                    placeholder="Full Name" 
                    value={regData.name} 
                    onChange={e => setRegData({...regData, name: e.target.value})} 
                    required 
                  />
                </div>
              )}
              
              <div className="input-group">
                <input 
                    type="email" 
                    placeholder="Email Address" 
                    value={tab === 'login' ? loginData.email : regData.email}
                    onChange={e => tab === 'login' ? setLoginData({...loginData, email: e.target.value}) : setRegData({...regData, email: e.target.value})}
                    required 
                />
              </div>

              <div className="input-group" style={{ position: 'relative' }}>
                <input 
                    type={showPass ? 'text' : 'password'} 
                    placeholder="Password" 
                    value={tab === 'login' ? loginData.password : regData.password}
                    onChange={e => tab === 'login' ? setLoginData({...loginData, password: e.target.value}) : setRegData({...regData, password: e.target.value})}
                    required 
                />
                <div onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: 12, cursor: 'pointer', color: '#64748b' }}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </div>
              </div>

              <button className="submit-btn" type="submit" disabled={loading}>
                {loading ? 'Processing...' : (tab === 'login' ? 'Sign In' : 'Create Account')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}