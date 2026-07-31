import { useState, useRef, useEffect } from 'react'
import {
  Send,
  Mic,
  MicOff,
  Bot,
  User,
  AlertCircle,
  MapPin,
  Pill,
  Stethoscope,
  Globe,
  Loader2,
  Volume2,
  ChevronDown,
} from 'lucide-react'
import './ChatPage.css'

const LANGUAGES = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
]

const AGENT_META = {
  orchestrator: { icon: Bot, color: '#94a3b8', label: 'ArogyaMitra' },
  triage: { icon: Stethoscope, color: '#10b981', label: 'Triage Agent' },
  voice: { icon: Globe, color: '#f59e0b', label: 'Voice Agent' },
  resource: { icon: MapPin, color: '#3b82f6', label: 'Resource Agent' },
  diet: { icon: Pill, color: '#a855f7', label: 'Diet Agent' },
}

const WELCOME_MSG = {
  id: 'welcome',
  role: 'assistant',
  agent: 'orchestrator',
  content:
    "🙏 नमस्ते! मैं **आरोग्यमित्र (ArogyaMitra)** हूँ, आपका AI स्वास्थ्य सहायक।\n\nमैं इन चीज़ों में आपकी मदद कर सकता हूँ:\n• **लक्षण जांच (Symptom Check)** — मुझे बताएं कि आपको कैसा महसूस हो रहा है\n• **अस्पताल खोजें (Find Hospital)** — अपने आस-पास के अस्पताल या क्लिनिक खोजें\n• **स्वास्थ्य सलाह (Health Advice)** — आहार और स्वास्थ्य से जुड़ी जानकारी\n\nआप अपनी भाषा में टाइप कर सकते हैं।\n\n**आज आपको कैसा महसूस हो रहा है?**",
  timestamp: new Date().toISOString(),
  severity: null,
}

// Simulated AI responses for demo
const DEMO_RESPONSES = [
  {
    agent: 'triage',
    content:
      "I understand you're experiencing **fever and headache**. Let me ask a few more questions to better assess your condition:\n\n1. 🌡️ What is your approximate temperature?\n2. ⏰ How long have you had these symptoms?\n3. 💊 Are you taking any medications currently?\n4. 🤢 Do you have any other symptoms like cough, body ache, or nausea?\n\nPlease share these details so I can provide a better assessment.",
    severity: 'moderate',
  },
  {
    agent: 'triage',
    content:
      "Based on your symptoms, here's my assessment:\n\n**Severity: 🟡 Moderate**\n\nYour symptoms suggest a possible **viral fever** or **seasonal flu**. Here are my recommendations:\n\n✅ **Immediate Steps:**\n• Rest and stay hydrated (ORS solution recommended)\n• Take Paracetamol for fever (as per standard dosage)\n• Monitor temperature every 4 hours\n\n⚠️ **Visit a doctor if:**\n• Fever persists beyond 3 days\n• Temperature exceeds 103°F\n• You develop rash or breathing difficulty\n\n> ⚕️ *Disclaimer: This is a triage assessment, not a medical diagnosis. Please consult a qualified doctor for proper treatment.*\n\nShall I find the **nearest hospital** for you?",
    severity: 'moderate',
  },
  {
    agent: 'resource',
    content:
      "I found **3 healthcare facilities** near your location:\n\n🏥 **1. Primary Health Centre, Wardha**\n📍 2.3 km away | ⏰ Open 24/7\n📞 07152-243567\n\n🏥 **2. District Hospital, Wardha**\n📍 5.1 km away | ⏰ Open 24/7\n📞 07152-245890\n\n🏥 **3. Rural Hospital, Pulgaon**\n📍 8.7 km away | ⏰ 8 AM - 8 PM\n📞 07153-220134\n\n👩‍⚕️ **ASHA Worker:** Sunita Devi\n📞 +91 98765-43210\n\nWould you like directions to any of these?",
    severity: null,
  },
  {
    agent: 'diet',
    content:
      "Here are **dietary recommendations** for recovery from fever:\n\n🥣 **Foods to Eat:**\n• Khichdi (light, easy to digest)\n• Moong dal soup\n• Coconut water\n• Seasonal fruits (banana, pomegranate)\n• Tulsi tea with honey\n\n🚫 **Foods to Avoid:**\n• Oily/fried foods\n• Cold drinks and ice cream\n• Heavy grains like rajma, chana\n\n💧 **Hydration Target:** 3-4 liters/day\n• ORS after every loose motion\n• Lemon water with salt and sugar\n\n> 🥗 *These suggestions are general wellness advice. For specific dietary needs, consult your doctor.*",
    severity: null,
  },
]

export default function ChatPage() {
  const [messages, setMessages] = useState([WELCOME_MSG])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedLang, setSelectedLang] = useState('hi')
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [patientProfile, setPatientProfile] = useState({})
  const [demoIndex, setDemoIndex] = useState(0)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const chatContainerRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    // Fetch profile on mount
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    fetch(`${API_URL}/api/health/profile`)
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setPatientProfile(data);
          // Auto-set language based on profile if available
          if (data.preferredLanguage) {
            const langCodeMap = {
              'English': 'en', 'Hindi': 'hi', 'Marathi': 'mr', 'Tamil': 'ta', 'Telugu': 'te'
            };
            if (langCodeMap[data.preferredLanguage]) {
              setSelectedLang(langCodeMap[data.preferredLanguage]);
            }
          }
        }
      })
      .catch(err => console.error('Failed to load profile for chat:', err));
  }, []);

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(`${API_URL}/api/chat/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMsg.content,
          sessionId: 'default_session',
          language: selectedLang,
          patientProfile: patientProfile
        })
      });
      const data = await res.json();
      
      const aiMsg = {
        id: Date.now().toString(),
        role: 'assistant',
        agent: data.agent || 'orchestrator',
        content: data.response || "Sorry, I couldn't process that.",
        timestamp: data.timestamp || new Date().toISOString(),
        severity: data.severity,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      console.error('API Error:', error);
      const errorMsg = {
        id: Date.now().toString(),
        role: 'assistant',
        agent: 'orchestrator',
        content: "⚠️ **Connection Error**: I couldn't reach the server. Please ensure the backend is running.",
        timestamp: new Date().toISOString(),
        severity: null,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const renderMarkdown = (text) => {
    // Simple markdown rendering
    let html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>')
      .replace(/^• (.*?)$/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.*?)$/gm, '<li>$2</li>')
      .replace(/\n/g, '<br/>')

    return <div dangerouslySetInnerHTML={{ __html: html }} />
  }

  const getSeverityBadge = (severity) => {
    if (!severity) return null
    const config = {
      emergency: { class: 'badge-emergency', label: '🔴 Emergency', icon: AlertCircle },
      moderate: { class: 'badge-moderate', label: '🟡 Moderate', icon: AlertCircle },
      mild: { class: 'badge-mild', label: '🟢 Mild', icon: AlertCircle },
    }
    const cfg = config[severity]
    if (!cfg) return null
    return <span className={`badge ${cfg.class}`}>{cfg.label}</span>
  }

  const selectedLangObj = LANGUAGES.find((l) => l.code === selectedLang)

  return (
    <div className="chat-page">
      {/* Chat Header Bar */}
      <div className="chat-header glass-card">
        <div className="chat-header-left">
          <div className="chat-agent-avatar">
            <Bot size={20} />
          </div>
          <div>
            <h3>ArogyaMitra AI</h3>
            <span className="chat-status">
              {isLoading ? (
                <>
                  <Loader2 size={12} className="spin" /> Thinking...
                </>
              ) : (
                <>
                  <span className="status-dot-sm"></span> Ready to help
                </>
              )}
            </span>
          </div>
        </div>

        {/* Language Selector */}
        <div className="lang-selector">
          <button
            className="lang-btn"
            onClick={() => setShowLangMenu(!showLangMenu)}
            id="lang-selector"
          >
            <span>{selectedLangObj?.flag}</span>
            <span className="lang-code">{selectedLangObj?.label}</span>
            <ChevronDown size={14} />
          </button>
          {showLangMenu && (
            <div className="lang-menu glass-card animate-scale-in">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  className={`lang-option ${selectedLang === lang.code ? 'lang-option--active' : ''}`}
                  onClick={() => {
                    setSelectedLang(lang.code)
                    setShowLangMenu(false)
                  }}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages" ref={chatContainerRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${msg.role === 'user' ? 'message--user' : 'message--assistant'} animate-slide-up`}
          >
            {msg.role === 'assistant' && (
              <div className="message-avatar">
                {(() => {
                  const meta = AGENT_META[msg.agent] || AGENT_META.orchestrator
                  const Icon = meta.icon
                  return (
                    <div className="avatar-icon" style={{ background: `${meta.color}22`, color: meta.color }}>
                      <Icon size={16} />
                    </div>
                  )
                })()}
              </div>
            )}
            <div className={`message-bubble ${msg.role === 'user' ? 'bubble--user' : 'bubble--assistant'}`}>
              {msg.role === 'assistant' && msg.agent && (
                <div className="message-agent-label" style={{ color: AGENT_META[msg.agent]?.color }}>
                  {AGENT_META[msg.agent]?.label}
                  {msg.severity && getSeverityBadge(msg.severity)}
                </div>
              )}
              <div className="message-content">{renderMarkdown(msg.content)}</div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {msg.role === 'assistant' && (
                  <button className="btn-ghost btn-icon msg-action" title="Play audio">
                    <Volume2 size={14} />
                  </button>
                )}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="message-avatar">
                <div className="avatar-icon avatar-user">
                  <User size={16} />
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="message message--assistant animate-slide-up">
            <div className="message-avatar">
              <div className="avatar-icon" style={{ background: '#10b98122', color: '#10b981' }}>
                <Bot size={16} />
              </div>
            </div>
            <div className="message-bubble bubble--assistant">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="chat-input-area">
        <div className="input-bar glass-card">
          <textarea
            ref={inputRef}
            className="chat-input"
            placeholder="Describe your symptoms..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            id="chat-input"
          />
          <button
            className={`btn btn-icon send-btn ${input.trim() ? 'send-btn--active' : ''}`}
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            title="Send message"
            id="send-btn"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
