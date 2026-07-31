const { processMessage } = require('./aiService');

/**
 * Handle real-time WebSocket connections for chat.
 */
function handleSocketConnection(io, socket) {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Join a session room
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`📋 Socket ${socket.id} joined session: ${sessionId}`);
  });

  // Handle incoming chat messages
  socket.on('chat-message', async (data) => {
    const { message, sessionId, language, patientProfile } = data;

    try {
      // Emit typing indicator
      socket.to(sessionId).emit('agent-typing', { agent: 'orchestrator', typing: true });

      // Process through AI
      const response = await processMessage({
        message,
        sessionId,
        language,
        patientProfile,
      });

      // Stop typing indicator
      socket.to(sessionId).emit('agent-typing', { agent: response.agent, typing: false });

      // Emit response
      io.to(sessionId).emit('agent-response', {
        id: `msg_${Date.now()}`,
        role: 'assistant',
        agent: response.agent,
        content: response.response,
        severity: response.severity,
        timestamp: response.timestamp,
      });
    } catch (err) {
      console.error('Socket chat error:', err.message);
      socket.emit('error', { message: 'Failed to process message' });
    }
  });

  // Handle voice input
  socket.on('voice-input', async (data) => {
    const { audioData, language, sessionId } = data;

    try {
      socket.emit('transcription-status', { status: 'processing' });

      // For now, mock transcription
      setTimeout(() => {
        socket.emit('transcription-result', {
          text: 'Mujhe bukhar hai aur sar mein dard hai',
          language: language || 'hi',
          confidence: 0.92,
        });
      }, 1500);
    } catch (err) {
      socket.emit('error', { message: 'Voice processing failed' });
    }
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`🔌 Client disconnected: ${socket.id} — ${reason}`);
  });
}

module.exports = { handleSocketConnection };
