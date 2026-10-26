import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  BarChart2, Users, Target, TrendingUp, Zap, Shield,
  ArrowRight, ChevronRight, Database, BrainCircuit, PieChart, Sparkles
} from 'lucide-react'

const features = [
  {
    icon: <BrainCircuit size={22} />,
    title: 'K-Means ML Segmentation',
    desc: 'Unsupervised clustering groups customers mathematically by income, spending score, and behavioral velocity.',
    gradient: 'var(--gradient-1)',
  },
  {
    icon: <Sparkles size={22} />,
    title: 'GenAI Persona Synthesis',
    desc: 'LLMs transform raw cluster centroids into deep psychographic customer archetypes with core desires and friction points.',
    gradient: 'var(--gradient-4)',
  },
  {
    icon: <Target size={22} />,
    title: 'Omnichannel Campaign Studio',
    desc: 'Generates tailored email copy, SMS/WhatsApp blasts, social ad hooks, and pricing elasticity strategies in 1 click.',
    gradient: 'var(--gradient-3)',
  },
  {
    icon: <Users size={22} />,
    title: 'Synthetic Customer Simulator',
    desc: 'Augments customer data with realistic LLM-generated test customer profiles to simulate campaign reception.',
    gradient: 'var(--gradient-2)',
  },
  {
    icon: <TrendingUp size={22} />,
    title: 'SegInsight AI Copilot',
    desc: 'Interactive chat assistant grounded directly in your cluster metrics for real-time strategy exploration.',
    gradient: 'var(--gradient-1)',
  },
  {
    icon: <Shield size={22} />,
    title: 'C-Suite Executive Briefings',
    desc: 'Generates board-level strategic memoranda summarizing cluster economics and 90-day execution roadmaps.',
    gradient: 'var(--gradient-4)',
  },
]

const steps = [
  { num: '01', label: 'Upload Dataset', desc: 'Import your customer CSV or launch with 1-click demo data.' },
  { num: '02', label: 'K-Means Clustering', desc: 'Compute centroids across income and spending metrics.' },
  { num: '03', label: 'GenAI Synthesis', desc: 'Synthesize rich consumer personas with Google Gemini or OpenAI.' },
  { num: '04', label: 'Activate Campaigns', desc: 'Generate multi-channel copy and consult the AI Copilot.' },
]

const stats = [
  { value: '100%', label: 'LLM Grounded' },
  { value: '5+',   label: 'AI Personas' },
  { value: '4x',   label: 'Omnichannel Formats' },
  { value: '0-Key', label: 'Smart Fallback' },
]

export default function Home() {
  return (
    <div className="page-wrapper" style={{ background: 'var(--bg)' }}>
      <Navbar variant="home" />

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', paddingTop: '80px', paddingBottom: '100px' }}>
        {/* Background blobs */}
        <div style={{
          position: 'absolute', top: '-120px', left: '50%', transform: 'translateX(-50%)',
          width: 700, height: 700,
          background: 'radial-gradient(circle, rgba(79,70,229,0.14) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: 40, right: '-100px',
          width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <div style={{ marginBottom: 20 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: '0.8rem', fontWeight: 700, padding: '6px 16px',
              borderRadius: '24px', background: 'rgba(79,70,229,0.18)',
              color: '#818cf8', border: '1px solid rgba(79,70,229,0.35)'
            }}>
              <Sparkles size={13} color="#22d3ee" /> Machine Learning + Generative AI Architecture
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.4rem, 5.5vw, 4rem)',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-1.5px',
            marginBottom: 24,
            maxWidth: 880,
            margin: '0 auto 24px',
          }}>
            Bridge Customer Clustering with{' '}
            <span className="gradient-text">Generative AI Intelligence</span>
          </h1>

          <p style={{
            fontSize: '1.1rem', lineHeight: 1.7,
            color: 'var(--text-muted)',
            maxWidth: 680, margin: '0 auto 40px',
          }}>
            SegInsight pairs unsupervised K-Means clustering with state-of-the-art LLMs. Turn mathematical cluster centroids into deep psychographic personas, multi-channel marketing campaigns, and real-time AI copilot reasoning.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/upload" className="btn btn-primary btn-lg">
              Launch GenAI Platform <ArrowRight size={17} />
            </Link>
            <Link to="/about" className="btn btn-ghost btn-lg">
              Learn Architecture
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '80px 0', background: 'rgba(255,255,255,0.015)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
           <span 
  className="badge badge-cyan" 
  style={{ marginBottom: 12, fontSize: '0.9rem', padding: '8px 16px' }}
>
  How It Works
</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 10 }}>
              Four Steps to Clear Insights
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>
              From raw CSV to marketing strategy in minutes.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 20,
          }}>
            {steps.map((s, i) => (
              <div key={s.num} className="card card-hover" style={{ position: 'relative', overflow: 'hidden' }}>
                
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'var(--gradient-1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 16, fontSize: '1rem', fontWeight: 700, color: 'white',
                }}>{i + 1}</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.975rem' }}>{s.label}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <span 
  className="badge badge-primary" 
  style={{ marginBottom: 12, fontSize: '0.9rem', padding: '8px 16px' }}
>
  Features
</span>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 10 }}>
              Everything You Need
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto' }}>
              A complete toolkit for customer analytics and intelligent segmentation.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 20,
          }}>
            {features.map(f => (
              <div key={f.title} className="card card-hover">
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: f.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', marginBottom: 16,
                }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.975rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '72px 0' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(79,70,229,0.2) 0%, rgba(6,182,212,0.15) 100%)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '56px 40px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(circle at 50% 0%, rgba(79,70,229,0.15) 0%, transparent 60%)',
              pointerEvents: 'none',
            }} />
            <h2 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.5px', marginBottom: 14, position: 'relative' }}>
              Ready to Understand Your Customers?
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 30, maxWidth: 480, margin: '0 auto 30px', position: 'relative' }}>
              Upload your dataset today and discover actionable customer segments in minutes.
            </p>
            <Link to="/login" className="btn btn-primary btn-lg" style={{ position: 'relative' }}>
              Start Analyzing <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      <footer
  style={{
    borderTop: '1px solid var(--border-light)',
    padding: '60px 0 30px',
    color: 'var(--text-subtle)',
    fontSize: '0.9rem',
  }}
>
  <div className="container">

    {/* Footer Grid */}
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))',
        gap: 30,
        marginBottom: 40,
      }}
    >

      {/* Logo + About */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              background: 'var(--gradient-1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              color: 'white',
              fontWeight: 700,
            }}
          >
            SI
          </div>

          <span style={{ fontWeight: 700 }}>SegInsight</span>
        </div>

        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
          SegInsight is a machine learning powered platform that helps businesses
          discover customer segments and generate data-driven marketing strategies.
        </p>
      </div>

      {/* Quick Links */}
      <div>
        <h4 style={{ marginBottom: 12 }}>Quick Links</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/feedback">Feedback</Link>
        </div>
      </div>

      {/* Features */}
      <div>
        <h4 style={{ marginBottom: 12 }}>Platform</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span>Customer Segmentation</span>
          <span>Data Visualization</span>
          <span>Marketing Insights</span>
          <span>Export Reports</span>
        </div>
      </div>

      {/* Contact */}
      <div>
        <h4 style={{ marginBottom: 12 }}>Contact</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <span>Email: support@seginsight.com</span>
          <span>Location: India</span>
          <span>Built for Data-Driven Marketing</span>
        </div>
      </div>

    </div>

    {/* Bottom Bar */}
    <div
      style={{
        borderTop: '1px solid var(--border-light)',
        paddingTop: 20,
        display: 'flex',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 10,
      }}
    >
      <span>© {new Date().getFullYear()} SegInsight. All rights reserved.</span>

      <div style={{ display: 'flex', gap: 16 }}>
        <span>Privacy</span>
        <span>Terms</span>
        <span>Support</span>
      </div>
    </div>

  </div>
</footer>
    </div>
  )
}