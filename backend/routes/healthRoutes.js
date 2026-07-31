const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');

// Health facilities database (demo data — replace with real DB queries)
const FACILITIES = [
  {
    id: 'phc-wardha',
    name: 'Primary Health Centre, Wardha',
    type: 'PHC',
    lat: 20.7452,
    lng: 78.5982,
    phone: '07152-243567',
    hours: '24/7',
    services: ['General Medicine', 'Maternity', 'Vaccination'],
  },
  {
    id: 'dh-wardha',
    name: 'District Hospital, Wardha',
    type: 'District Hospital',
    lat: 20.7332,
    lng: 78.6060,
    phone: '07152-245890',
    hours: '24/7',
    services: ['Emergency', 'Surgery', 'ICU', 'Maternity', 'Lab'],
  },
  {
    id: 'rh-pulgaon',
    name: 'Rural Hospital, Pulgaon',
    type: 'Rural Hospital',
    lat: 20.7277,
    lng: 78.3172,
    phone: '07153-220134',
    hours: '8:00 AM - 8:00 PM',
    services: ['General Medicine', 'Maternity'],
  },
  {
    id: 'phc-deoli',
    name: 'Sub Health Centre, Deoli',
    type: 'Sub Centre',
    lat: 20.6527,
    lng: 78.4849,
    phone: '07152-230456',
    hours: '9:00 AM - 5:00 PM',
    services: ['General Check-up', 'Vaccination'],
  },
];

// Helper: Calculate distance between two coordinates (Haversine formula)
function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(1);
}

// GET /api/health/facilities — Search nearby facilities
router.get('/facilities', (req, res) => {
  const { lat, lng, radius = 50, type } = req.query;

  let results = [...FACILITIES];

  // Filter by type if specified
  if (type) {
    results = results.filter((f) => f.type.toLowerCase().includes(type.toLowerCase()));
  }

  // Calculate distances if coordinates provided
  if (lat && lng) {
    results = results.map((f) => ({
      ...f,
      distance: calcDistance(parseFloat(lat), parseFloat(lng), f.lat, f.lng),
    }));
    results.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
    results = results.filter((f) => parseFloat(f.distance) <= parseFloat(radius));
  }

  res.json({
    count: results.length,
    facilities: results,
  });
});

// GET /api/health/emergency — Emergency contacts & nearest hospital
router.get('/emergency', (req, res) => {
  const { lat, lng } = req.query;

  let nearest = FACILITIES[0]; // Default
  if (lat && lng) {
    const withDist = FACILITIES.map((f) => ({
      ...f,
      distance: parseFloat(calcDistance(parseFloat(lat), parseFloat(lng), f.lat, f.lng)),
    }));
    nearest = withDist.sort((a, b) => a.distance - b.distance)[0];
  }

  res.json({
    emergencyNumbers: {
      ambulance: '108',
      emergency: '112',
      healthHelpline: '104',
      womenHelpline: '1091',
      childHelpline: '1098',
    },
    nearestHospital: nearest,
    ashaWorker: {
      name: 'Sunita Devi',
      phone: '+91 98765-43210',
      area: 'Wardha Block',
    },
  });
});

// GET /api/health/profile — Get patient health profile
router.get('/profile', async (req, res) => {
  try {
    const patient = await Patient.findOne();
    if (!patient) return res.json({});
    res.json(patient);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// POST /api/health/profile — Save patient health profile
router.post('/profile', async (req, res) => {
  try {
    const data = req.body;
    
    // Map frontend profile to backend schema
    const updateData = {
      name: data.name || 'User', // Required field
      age: data.age ? parseInt(data.age) : undefined,
      gender: data.gender || undefined,
      phone: data.phone || '',
      location: {
        village: data.village || '',
        district: data.district || '',
        state: data.state || '',
      },
      medicalInfo: {
        bloodGroup: data.bloodGroup || '',
        existingConditions: data.conditions || [],
        allergies: data.allergies || '',
        currentMedications: data.medications || '',
      },
      preferredLanguage: data.language || 'English',
    };

    let patient = await Patient.findOne();
    if (patient) {
      patient = await Patient.findByIdAndUpdate(patient._id, updateData, { new: true });
    } else {
      patient = new Patient(updateData);
      await patient.save();
    }

    res.json({
      success: true,
      message: 'Profile saved successfully',
      profile: patient,
    });
  } catch (err) {
    console.error('Error saving profile:', err);
    res.status(500).json({ error: 'Failed to save profile' });
  }
});

module.exports = router;
