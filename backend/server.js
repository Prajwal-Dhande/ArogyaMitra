require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');

const chatRoutes = require('./routes/chatRoutes');
const healthRoutes = require('./routes/healthRoutes');
const { handleSocketConnection } = require('./services/socketService');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'https://arogya-mitra-indol.vercel.app',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CORS_ORIGIN || 'https://arogya-mitra-indol.vercel.app' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Routes
app.use('/api/chat', chatRoutes);
app.use('/api/health', healthRoutes);

// Health Check
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ArogyaMitra Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Socket.IO connections
io.on('connection', (socket) => handleSocketConnection(io, socket));

// MongoDB Connection
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/arogyamitra';
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.warn('⚠️  MongoDB not available, running without database:', err.message);
    // Continue without DB for demo purposes
  }
};

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start Server
const PORT = process.env.PORT || 3001;
connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════╗
║   🏥 ArogyaMitra Backend Server         ║
║   ⚡ Running on port ${PORT}              ║
║   🌍 Environment: ${process.env.NODE_ENV || 'development'}      ║
╚══════════════════════════════════════════╝
    `);
  });
});

module.exports = { app, io };
