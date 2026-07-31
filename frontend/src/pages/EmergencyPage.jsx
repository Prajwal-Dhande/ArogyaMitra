import { useState, useEffect } from 'react'
import {
  AlertTriangle,
  Phone,
  MapPin,
  Navigation,
  Heart,
  Siren,
  Clock,
  Shield,
  ChevronRight,
} from 'lucide-react'
import './EmergencyPage.css'

const EMERGENCY_NUMBERS = [
  { name: 'Ambulance', number: '108', icon: Siren, color: '#ef4444' },
  { name: 'Emergency', number: '112', icon: Phone, color: '#f59e0b' },
  { name: 'Health Helpline', number: '104', icon: Heart, color: '#10b981' },
  { name: 'Women Helpline', number: '1091', icon: Shield, color: '#8b5cf6' },
]

const NEARBY_HOSPITALS = [
  {
    name: 'Government Medical College and Hospital (GMCH), Nagpur',
    distance: '3.5 km',
    time: '12 min',
    type: 'Government Hospital',
    open: true,
    phone: '0712-2743588',
  },
  {
    name: 'AIIMS Nagpur',
    distance: '8.2 km',
    time: '20 min',
    type: 'Super Specialty Hospital',
    open: true,
    phone: '0712-2352010',
  },
  {
    name: 'Mayo Hospital (IGGMCH), Nagpur',
    distance: '5.4 km',
    time: '15 min',
    type: 'Government Hospital',
    open: true,
    phone: '0712-2725424',
  },
]

const FIRST_AID_TIPS = [
  {
    title: 'Heart Attack',
    steps: ['Call 108 immediately', 'Chew an aspirin if available', 'Sit upright, stay calm', 'Loosen tight clothing'],
    emoji: '❤️‍🔥',
  },
  {
    title: 'Snake Bite',
    steps: ['Keep victim calm & still', 'Remove jewelry near bite', 'Do NOT cut or suck wound', 'Rush to nearest hospital'],
    emoji: '🐍',
  },
  {
    title: 'Burns',
    steps: ['Cool with running water 10 min', 'Do NOT apply ice directly', 'Cover with clean cloth', 'Seek medical help for severe burns'],
    emoji: '🔥',
  },
  {
    title: 'Choking',
    steps: ['5 back blows between shoulder blades', 'Follow with 5 abdominal thrusts', 'Alternate until object cleared', 'Call 108 if unresponsive'],
    emoji: '😮‍💨',
  },
]

export default function EmergencyPage() {
  const [sosActive, setSosActive] = useState(false)
  const [countdown, setCountdown] = useState(null)
  const [selectedTip, setSelectedTip] = useState(null)
  const [locationStatus, setLocationStatus] = useState('idle')

  const handleSOS = () => {
    if (sosActive) {
      setSosActive(false)
      setCountdown(null)
      return
    }

    setSosActive(true)
    setCountdown(5)
    setLocationStatus('locating')

    // Simulate location fetch
    setTimeout(() => setLocationStatus('found'), 1500)
  }

  useEffect(() => {
    if (countdown === null || countdown <= 0) return
    const timer = setTimeout(() => {
      setCountdown(countdown - 1)
    }, 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  useEffect(() => {
    if (countdown === 0) {
      console.log('SOS Activated — calling ambulance 108')
      window.location.href = 'tel:108'
      
      // Reset state after a brief delay
      setTimeout(() => {
        setSosActive(false)
        setCountdown(null)
      }, 2000)
    }
  }, [countdown])

  return (
    <div className="emergency-page">
      {/* SOS Button */}
      <section className="sos-section">
        <div className={`sos-container ${sosActive ? 'sos-container--active' : ''}`}>
          <button
            className={`sos-button ${sosActive ? 'sos-button--active' : ''}`}
            onClick={handleSOS}
            id="sos-trigger"
          >
            <div className="sos-ring sos-ring--1"></div>
            <div className="sos-ring sos-ring--2"></div>
            <div className="sos-ring sos-ring--3"></div>
            <div className="sos-inner">
              {sosActive ? (
                <>
                  <span className="sos-countdown">{countdown}</span>
                  <span className="sos-label-sm">Tap to cancel</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={36} />
                  <span className="sos-label">SOS</span>
                </>
              )}
            </div>
          </button>
        </div>
        <p className="sos-desc">
          {sosActive
            ? countdown === 0 
                ? 'Call Initiated! Redirecting...'
                : `Calling ambulance in ${countdown} seconds...`
            : 'Tap for emergency — auto-calls ambulance 108 with your location'}
        </p>
        {sosActive && locationStatus === 'found' && (
          <div className="location-badge animate-scale-in">
            <Navigation size={14} />
            <span>Location shared: 20.7332°N, 78.6060°E</span>
          </div>
        )}
      </section>

      {/* Emergency Numbers */}
      <section className="emergency-numbers">
        <h2 className="section-title">
          <Phone size={20} className="title-icon" />
          Emergency Numbers
        </h2>
        <div className="numbers-grid stagger-children">
          {EMERGENCY_NUMBERS.map((item) => (
            <a
              key={item.number}
              href={`tel:${item.number}`}
              className="number-card glass-card"
              id={`call-${item.number}`}
            >
              <div className="number-icon" style={{ background: `${item.color}18`, color: item.color }}>
                <item.icon size={22} />
              </div>
              <div className="number-info">
                <span className="number-name">{item.name}</span>
                <span className="number-value">{item.number}</span>
              </div>
              <Phone size={16} className="call-icon" style={{ color: item.color }} />
            </a>
          ))}
        </div>
      </section>

      {/* Nearest Hospitals */}
      <section className="hospitals-section">
        <h2 className="section-title">
          <MapPin size={20} className="title-icon" />
          Nearest Hospitals
        </h2>
        <div className="hospitals-list stagger-children">
          {NEARBY_HOSPITALS.map((hospital, i) => (
            <div key={i} className="hospital-card glass-card">
              <div className="hospital-main">
                <div className="hospital-info">
                  <h3>{hospital.name}</h3>
                  <div className="hospital-meta">
                    <span className="hospital-type">{hospital.type}</span>
                    <span className={`hospital-status ${hospital.open ? 'status-open' : 'status-closed'}`}>
                      {hospital.open ? '● Open' : '● Closed'}
                    </span>
                  </div>
                </div>
                <div className="hospital-distance">
                  <span className="dist-value">{hospital.distance}</span>
                  <span className="dist-time">
                    <Clock size={12} /> {hospital.time}
                  </span>
                </div>
              </div>
              <div className="hospital-actions">
                <a href={`tel:${hospital.phone}`} className="btn btn-sm btn-outline">
                  <Phone size={14} /> Call
                </a>
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ', Maharashtra, India')}`, '_blank')}
                >
                  <Navigation size={14} /> Directions
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* First Aid Tips */}
      <section className="first-aid-section">
        <h2 className="section-title">
          <Heart size={20} className="title-icon" />
          First Aid Guide
        </h2>
        <div className="first-aid-grid stagger-children">
          {FIRST_AID_TIPS.map((tip, i) => (
            <button
              key={i}
              className={`first-aid-card glass-card ${selectedTip === i ? 'first-aid-card--expanded' : ''}`}
              onClick={() => setSelectedTip(selectedTip === i ? null : i)}
            >
              <div className="first-aid-header">
                <span className="first-aid-emoji">{tip.emoji}</span>
                <span className="first-aid-title">{tip.title}</span>
                <ChevronRight size={16} className={`expand-icon ${selectedTip === i ? 'expand-icon--open' : ''}`} />
              </div>
              {selectedTip === i && (
                <div className="first-aid-steps animate-slide-up">
                  {tip.steps.map((step, j) => (
                    <div key={j} className="step-item">
                      <span className="step-num">{j + 1}</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
