const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  agent: {
    type: String,
    enum: ['orchestrator', 'triage', 'voice', 'resource', 'diet'],
    default: 'orchestrator',
  },
  content: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['emergency', 'moderate', 'mild', null],
    default: null,
  },
  language: {
    type: String,
    default: 'en',
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
}, { timestamps: true });

const chatSessionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
  },
  sessionId: {
    type: String,
    required: true,
    unique: true,
    default: () => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  },
  messages: [messageSchema],
  triageScore: {
    type: String,
    enum: ['emergency', 'moderate', 'mild', null],
    default: null,
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'referred'],
    default: 'active',
  },
  language: {
    type: String,
    default: 'hi',
  },
  summary: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('ChatSession', chatSessionSchema);
