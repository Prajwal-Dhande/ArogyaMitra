import { useState, useEffect } from 'react'
import {
  User,
  Heart,
  Globe,
  Save,
  MapPin,
  Calendar,
  Droplets,
  Activity,
  FileText,
  Shield,
  CheckCircle,
  Download,
} from 'lucide-react'
import './ProfilePage.css'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const LANGUAGES_LIST = ['Hindi', 'English', 'Marathi', 'Tamil', 'Telugu', 'Bengali', 'Kannada', 'Gujarati']

export default function ProfilePage() {
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState({
    name: '',
    age: '',
    gender: '',
    phone: '',
    village: '',
    district: '',
    state: '',
    bloodGroup: '',
    language: 'Hindi',
    conditions: [],
    allergies: '',
    medications: '',
  })
  
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    }
  };

  const CONDITIONS = [
    'Diabetes',
    'Hypertension',
    'Asthma',
    'Heart Disease',
    'Thyroid',
    'Arthritis',
    'None',
  ]

  const handleChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const toggleCondition = (condition) => {
    setProfile((prev) => {
      const conditions = prev.conditions.includes(condition)
        ? prev.conditions.filter((c) => c !== condition)
        : [...prev.conditions, condition]
      return { ...prev, conditions }
    })
    setSaved(false)
  }

  useEffect(() => {
    // Fetch profile from backend on mount
    const API_URL = import.meta.env.VITE_API_URL || 'https://arogyamitra-2dj0.onrender.com';
    fetch(`${API_URL}/api/health/profile`)
      .then(res => res.json())
      .then(data => {
        if (data && Object.keys(data).length > 0) {
          setProfile({
            name: data.name || '',
            age: data.age || '',
            gender: data.gender || '',
            phone: data.phone || '',
            village: data.location?.village || '',
            district: data.location?.district || '',
            state: data.location?.state || '',
            bloodGroup: data.medicalInfo?.bloodGroup || '',
            language: data.preferredLanguage || 'Hindi',
            conditions: data.medicalInfo?.existingConditions || [],
            allergies: data.medicalInfo?.allergies || '',
            medications: data.medicalInfo?.currentMedications || '',
          });
        }
      })
      .catch(err => console.error('Failed to load profile:', err));
  }, []);

  const handleSave = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://arogyamitra-2dj0.onrender.com';
      const response = await fetch(`${API_URL}/api/health/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    }
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar-large">
          <User size={36} />
        </div>
        <h1>Health Profile</h1>
        <p>Your medical info helps AI agents give better, personalized advice</p>
      </div>

      {/* Personal Info */}
      <section className="profile-section glass-card animate-slide-up">
        <div className="section-header">
          <User size={18} />
          <h2>Personal Information</h2>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              className="input-field"
              placeholder="Your name"
              value={profile.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="age">Age</label>
              <input
                id="age"
                className="input-field"
                type="number"
                placeholder="Age"
                value={profile.age}
                onChange={(e) => handleChange('age', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="gender">Gender</label>
              <select
                id="gender"
                className="input-field"
                value={profile.gender}
                onChange={(e) => handleChange('gender', e.target.value)}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="phone">
              <Calendar size={14} /> Phone Number
            </label>
            <input
              id="phone"
              className="input-field"
              type="tel"
              placeholder="+91 XXXXX XXXXX"
              value={profile.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Location */}
      <section className="profile-section glass-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="section-header">
          <MapPin size={18} />
          <h2>Location</h2>
        </div>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="village">Village / Town</label>
            <input
              id="village"
              className="input-field"
              placeholder="e.g., Wardha"
              value={profile.village}
              onChange={(e) => handleChange('village', e.target.value)}
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="district">District</label>
              <input
                id="district"
                className="input-field"
                placeholder="e.g., Wardha"
                value={profile.district}
                onChange={(e) => handleChange('district', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="state">State</label>
              <input
                id="state"
                className="input-field"
                placeholder="e.g., Maharashtra"
                value={profile.state}
                onChange={(e) => handleChange('state', e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Medical Info */}
      <section className="profile-section glass-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="section-header">
          <Heart size={18} />
          <h2>Medical Information</h2>
        </div>
        <div className="form-grid">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="blood-group">
                <Droplets size={14} /> Blood Group
              </label>
              <select
                id="blood-group"
                className="input-field"
                value={profile.bloodGroup}
                onChange={(e) => handleChange('bloodGroup', e.target.value)}
              >
                <option value="">Select</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>
                    {bg}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="language">
                <Globe size={14} /> Preferred Language
              </label>
              <select
                id="language"
                className="input-field"
                value={profile.language}
                onChange={(e) => handleChange('language', e.target.value)}
              >
                {LANGUAGES_LIST.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>
              <Activity size={14} /> Existing Conditions
            </label>
            <div className="chips-group">
              {CONDITIONS.map((condition) => (
                <button
                  key={condition}
                  className={`chip ${profile.conditions.includes(condition) ? 'chip--active' : ''}`}
                  onClick={() => toggleCondition(condition)}
                >
                  {condition}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="allergies">
              <Shield size={14} /> Known Allergies
            </label>
            <input
              id="allergies"
              className="input-field"
              placeholder="e.g., Penicillin, Peanuts"
              value={profile.allergies}
              onChange={(e) => handleChange('allergies', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="medications">
              <FileText size={14} /> Current Medications
            </label>
            <textarea
              id="medications"
              className="input-field"
              placeholder="List any medications you are currently taking..."
              rows={3}
              value={profile.medications}
              onChange={(e) => handleChange('medications', e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* PWA Install Area */}
      {deferredPrompt && (
        <section className="profile-section glass-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="section-header">
            <Download size={18} />
            <h2>Install App</h2>
          </div>
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <p style={{ marginBottom: '16px', fontSize: '0.9rem' }}>Install ArogyaMitra on your device for quick access and offline capabilities.</p>
            <button className="btn btn-primary" onClick={handleInstallClick}>
              <Download size={18} />
              Install to Home Screen
            </button>
          </div>
        </section>
      )}

      {/* Save Button */}
      <div className="save-area">
        <button className="btn btn-primary btn-lg save-btn" onClick={handleSave} id="save-profile">
          {saved ? (
            <>
              <CheckCircle size={18} />
              Profile Saved!
            </>
          ) : (
            <>
              <Save size={18} />
              Save Profile
            </>
          )}
        </button>
        <p className="save-note">
          <Shield size={12} /> Your data is stored locally and shared only with AI agents for better assistance.
        </p>
      </div>
    </div>
  )
}
