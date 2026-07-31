const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    min: 0,
    max: 150,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
  },
  phone: {
    type: String,
    trim: true,
  },
  location: {
    village: String,
    district: String,
    state: String,
    coordinates: {
      lat: Number,
      lng: Number,
    },
  },
  medicalInfo: {
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', ''],
      default: '',
    },
    existingConditions: [{
      type: String,
    }],
    allergies: {
      type: String,
      default: '',
    },
    currentMedications: {
      type: String,
      default: '',
    },
  },
  preferredLanguage: {
    type: String,
    default: 'hi',
  },
  chatSessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatSession',
  }],
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
