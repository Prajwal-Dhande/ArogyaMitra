const express = require('express');
const router = express.Router();
const { processMessage, getHistory } = require('../services/aiService');

// POST /api/chat/message — Send message to AI engine
router.post('/message', async (req, res) => {
  try {
    const { message, sessionId, language, patientProfile } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await processMessage({
      message: message.trim(),
      sessionId: sessionId || `session_${Date.now()}`,
      language: language || 'en',
      patientProfile: patientProfile || {},
    });

    res.json(response);
  } catch (err) {
    console.error('Chat message error:', err.message);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// GET /api/chat/history/:sessionId — Fetch chat history
router.get('/history/:sessionId', async (req, res) => {
  try {
    const history = await getHistory(req.params.sessionId);
    res.json(history);
  } catch (err) {
    console.error('Chat history error:', err.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// POST /api/chat/voice — Handle voice input
router.post('/voice', async (req, res) => {
  try {
    const { audioData, language } = req.body;

    // Forward to AI service for transcription
    // For now, return mock transcription
    res.json({
      transcription: 'Mujhe bukhar hai aur sar mein dard hai',
      language: language || 'hi',
      confidence: 0.92,
    });
  } catch (err) {
    console.error('Voice processing error:', err.message);
    res.status(500).json({ error: 'Failed to process voice input' });
  }
});

module.exports = router;
