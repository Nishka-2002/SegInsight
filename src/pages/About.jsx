import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import {
  Target, Globe, ArrowRight, CheckCircle2,
  BookOpen, Briefcase, Lightbulb
} from 'lucide-react'

const useCases = [
  { icon: <Briefcase size={16} />, title: 'Retail & E-commerce', desc: 'Identify high-value shoppers, cart abandoners, and loyalty candidates for targeted promotions.' },
  { icon: <Lightbulb size={16} />, title: 'Banking & Finance', desc: 'Group clients by risk profile, income, and spending to offer personalized financial products.' },
  { icon: <Globe size={16} />, title: 'Telecom & SaaS', desc: 'Reduce churn by detecting at-risk subscribers and deploying retention offers proactively.' },
  { icon: <Target size={16} />, title: 'Healthcare', desc: 'Segment patients by behavior and demographic to improve outreach and care plan efficiency.' },
]

const objectives = [
  'Bridge unsupervised machine learning (K-Means) with Generative AI (LLMs)',
  'Ground LLM reasoning directly in quantitative customer centroids without hallucinations',
  'Automate psychographic consumer persona synthesis from raw behavioral statistics',
  'Generate production-ready omnichannel marketing campaigns (Email, SMS, Social)',
  'Empower marketers with a conversational AI Copilot and synthetic customer simulator',
]

const timeline = [
  { phase: 'Layer 1', label: 'Unsupervised ML', desc: 'K-Means clustering computes mathematical centroids across income and spend' },
  { phase: 'Layer 2', label: 'Prompt Engineering', desc: 'System prompts & strict JSON schemas ground LLMs in cluster statistics' },
  { phase: 'Layer 3', label: 'GenAI Persona Lab', desc: 'Synthesizes deep consumer archetypes, core desires, and churn vulnerabilities' },
  { phase: 'Layer 4', label: 'Campaign Studio', desc: 'Multi-channel copy generation for Email, SMS, WhatsApp, and social ad hooks' },
  { phase: 'Layer 5', label: 'AI Copilot & Sim', desc: 'Conversational data exploration, synthetic customer generation & C-suite briefs' },
]

export default function About() {
  return (
    <div className="page-wrapper">
      <Navbar variant="about" />

      {/* Hero */}
      <section style={{ padding: '72px 0 56px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 400,
          background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative' }}>
          <span className="badge badge-primary" style={{ marginBottom: 14 }}>
            <BookOpen size={11} /> About SegInsight
          </span>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 18, maxWidth: 680, margin: '0 auto 18px' }}>
            Intelligent Customer Segmentation <span className="gradient-text">Made Simple</span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.75, maxWidth: 640, margin: '0 auto 32px' }}>
            SegInsight is a full-stack web application designed to perform customer segmentation using
            data analytics and machine learning techniques. It empowers businesses to analyze customer
            behavior, visualize distinct segments, and receive data-driven marketing recommendations.
          </p>
          <Link to="/login" className="btn btn-primary btn-lg">
            Try SegInsight <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Project Overview */}
      <section style={{ padding: '60px 0', background: 'rgba(255,255,255,0.015)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'center' }}>
            <div>
              <span className="badge badge-cyan" style={{ marginBottom: 14 }}>Project Overview</span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 16 }}>
                What is SegInsight?
              </h2>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 20 }}>
                SegInsight bridges the gap between raw customer data and actionable business intelligence.
                By applying K-Means clustering algorithms to customer datasets, it automatically identifies
                distinct behavioral groups — enabling teams to craft highly targeted campaigns.
              </p>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.8 }}>
                The platform walks users through a structured workflow: uploading data,
                preprocessing for quality, running the segmentation model, exploring cluster insights,
                and generating downloadable reports — all within a clean, intuitive interface.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {timeline.map((t) => (
                <div key={t.phase} style={{
                  display: 'flex', gap: 16, alignItems: 'flex-start',
                  padding: '14px 16px', borderRadius: 'var(--radius)',
                  background: 'var(--bg-card)', border: '1px solid var(--border-light)',
                }}>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, color: 'var(--primary-light)',
                    background: 'rgba(79,70,229,0.12)', border: '1px solid rgba(79,70,229,0.2)',
                    padding: '3px 8px', borderRadius: 6, flexShrink: 0, marginTop: 2,
                  }}>{t.phase}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: 3 }}>{t.label}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Objectives */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span className="badge badge-success" style={{ marginBottom: 14 }}>Objectives</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.5px' }}>Why SegInsight?</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
            {objectives.map((obj, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                padding: '16px 18px', borderRadius: 'var(--radius)',
                background: 'var(--bg-card)', border: '1px solid var(--border-light)',
              }}>
                <CheckCircle2 size={16} color="var(--success)" style={{ marginTop: 1 }} />
                <span style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-muted)' }}>{obj}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section style={{ padding: '60px 0', background: 'rgba(255,255,255,0.015)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <span className="badge badge-warning" style={{ marginBottom: 14 }}>Use Cases</span>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 10 }}>
              Industry Applications
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18 }}>
            {useCases.map(u => (
              <div key={u.title} className="card card-hover">
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(79,70,229,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14,
                }}>{u.icon}</div>
                <h3 style={{ fontWeight: 700, marginBottom: 8, fontSize: '0.95rem' }}>{u.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{u.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer (Updated) */}
      <footer
        style={{
          borderTop: '1px solid var(--border-light)',
          padding: '60px 0 30px',
          color: 'var(--text-subtle)',
          fontSize: '0.9rem',
        }}
      >
        <div className="container">

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))',
              gap: 30,
              marginBottom: 40,
            }}
          >

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

            <div>
              <h4 style={{ marginBottom: 12 }}>Quick Links</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/feedback">Feedback</Link>
              </div>
            </div>

            <div>
              <h4 style={{ marginBottom: 12 }}>Platform</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span>Customer Segmentation</span>
                <span>Data Visualization</span>
                <span>Marketing Insights</span>
                <span>Export Reports</span>
              </div>
            </div>

            <div>
              <h4 style={{ marginBottom: 12 }}>Contact</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span>Email: support@seginsight.com</span>
                <span>Location: India</span>
                <span>Built for Data-Driven Marketing</span>
              </div>
            </div>

          </div>

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