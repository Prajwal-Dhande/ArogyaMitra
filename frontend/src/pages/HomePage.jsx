import { useNavigate } from 'react-router-dom'
import {
  Stethoscope,
  MapPin,
  Phone,
  Mic,
  Heart,
  Shield,
  Users,
  Zap,
  ChevronRight,
  Globe,
  Brain,
  Clock,
} from 'lucide-react'
import './HomePage.css'

const quickActions = [
  {
    id: 'symptom-check',
    icon: Stethoscope,
    title: 'Symptom Check',
    subtitle: 'AI-powered health assessment',
    gradient: 'linear-gradient(135deg, #10b981, #059669)',
    path: '/chat',
  },
  {
    id: 'find-hospital',
    icon: MapPin,
    title: 'Find Hospital',
    subtitle: 'Nearest PHC & clinics',
    gradient: 'linear-gradient(135deg, #3b82f6, #2563eb)',
    path: '/emergency',
  },
  {
    id: 'emergency-sos',
    icon: Phone,
    title: 'Emergency SOS',
    subtitle: 'Immediate help',
    gradient: 'linear-gradient(135deg, #ef4444, #dc2626)',
    path: '/emergency',
  },
  {
    id: 'voice-consult',
    icon: Mic,
    title: 'Voice Consult',
    subtitle: 'Speak in your language',
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    path: '/chat',
  },
]

const features = [
  {
    icon: Brain,
    title: 'AI Triage',
    desc: 'Smart symptom analysis with WHO-backed medical knowledge base',
  },
  {
    icon: Globe,
    title: 'Multilingual',
    desc: 'Hindi, Marathi, Tamil, Telugu & 10+ regional languages supported',
  },
  {
    icon: Shield,
    title: 'Safe & Private',
    desc: 'No diagnosis claims — only triage guidance with professional referrals',
  },
  {
    icon: Clock,
    title: 'Offline Ready',
    desc: 'Works even with poor connectivity — syncs when back online',
  },
]

const healthTips = [
  { emoji: '💧', tip: 'Drink 8-10 glasses of water daily to stay hydrated' },
  { emoji: '🥗', tip: 'Include green vegetables in at least one meal today' },
  { emoji: '🚶', tip: '30 minutes of walking can reduce heart disease risk by 35%' },
  { emoji: '😴', tip: '7-8 hours of sleep strengthens your immune system' },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-effects">
          <div className="hero-orb hero-orb--1"></div>
          <div className="hero-orb hero-orb--2"></div>
          <div className="hero-grid-lines"></div>
        </div>
        <div className="hero-content animate-slide-up">
          <div className="hero-badge">
            <Zap size={14} />
            <span>AI-Powered Healthcare</span>
          </div>
          <h1 className="hero-title">
            Your Health, <br />
            <span className="gradient-text">Our Priority</span>
          </h1>
          <p className="hero-subtitle">
            AI agents bringing quality healthcare to every village. Get instant
            symptom assessment, find nearby hospitals, and speak in your language.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/chat')}>
              <Stethoscope size={18} />
              Start Health Check
            </button>
            <button className="btn btn-outline btn-lg" onClick={() => navigate('/emergency')}>
              <Phone size={18} />
              Emergency SOS
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-value">4</span>
              <span className="stat-label">AI Agents</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">10+</span>
              <span className="stat-label">Languages</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-value">24/7</span>
              <span className="stat-label">Available</span>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions">
        <h2 className="section-title">Quick Actions</h2>
        <div className="action-grid stagger-children">
          {quickActions.map((action) => (
            <button
              key={action.id}
              id={action.id}
              className="action-card glass-card"
              onClick={() => navigate(action.path)}
            >
              <div className="action-icon" style={{ background: action.gradient }}>
                <action.icon size={24} />
              </div>
              <div className="action-info">
                <h3>{action.title}</h3>
                <p>{action.subtitle}</p>
              </div>
              <ChevronRight size={18} className="action-arrow" />
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <h2 className="section-title">Why ArogyaMitra?</h2>
        <div className="features-grid stagger-children">
          {features.map((feature, i) => (
            <div key={i} className="feature-card glass-card">
              <div className="feature-icon-wrap">
                <feature.icon size={22} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Health Tips */}
      <section className="tips-section">
        <h2 className="section-title">
          <Heart size={20} className="title-icon" />
          Daily Health Tips
        </h2>
        <div className="tips-scroll">
          {healthTips.map((tip, i) => (
            <div key={i} className="tip-card glass-card">
              <span className="tip-emoji">{tip.emoji}</span>
              <p>{tip.tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Agent Showcase */}
      <section className="agents-section">
        <h2 className="section-title">
          <Users size={20} className="title-icon" />
          Meet Your AI Agents
        </h2>
        <div className="agents-list stagger-children">
          {[
            {
              name: 'Triage Agent',
              role: 'Symptom Assessment',
              desc: 'Analyzes your symptoms using WHO/ICMR medical knowledge base and assigns severity scores.',
              color: 'var(--primary-400)',
              emoji: '🏥',
            },
            {
              name: 'Voice Agent',
              role: 'Language Translation',
              desc: 'Understands Hindi, Marathi, Tamil & more. Speak naturally — AI translates for you.',
              color: 'var(--accent-400)',
              emoji: '🗣️',
            },
            {
              name: 'Resource Agent',
              role: 'Hospital Locator',
              desc: 'Finds nearest PHCs, hospitals, and ASHA workers with real-time distance calculation.',
              color: '#3b82f6',
              emoji: '📍',
            },
            {
              name: 'Diet Agent',
              role: 'Health Guidance',
              desc: 'Provides dietary advice and general health tips based on your medical profile.',
              color: '#a855f7',
              emoji: '💊',
            },
          ].map((agent, i) => (
            <div key={i} className="agent-card glass-card">
              <div className="agent-avatar">{agent.emoji}</div>
              <div className="agent-info">
                <div className="agent-header">
                  <h3 style={{ color: agent.color }}>{agent.name}</h3>
                  <span className="agent-role">{agent.role}</span>
                </div>
                <p>{agent.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
