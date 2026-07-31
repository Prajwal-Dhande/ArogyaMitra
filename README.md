# 🏥 ArogyaMitra — AI Agents for Rural Healthcare

AI-powered multi-agent system bringing quality healthcare assistance to rural communities. Built with a Vite+React PWA frontend, Node.js backend, and Python FastAPI AI engine.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│   Frontend      │────▶│   Node.js        │────▶│   Python AI Engine  │
│   (Vite+React)  │◀────│   Backend        │◀────│   (FastAPI)         │
│   Port: 5173    │     │   Port: 3001     │     │   Port: 8000        │
└─────────────────┘     └──────────────────┘     └─────────────────────┘
                                                  │
                                           ┌──────┴──────┐
                                           │  AI Agents   │
                                           ├──────────────┤
                                           │ 🏥 Triage    │
                                           │ 🗣️ Voice     │
                                           │ 📍 Resource  │
                                           │ 💊 Diet      │
                                           └──────────────┘
```

## Quick Start

### 1. Frontend
```bash
cd frontend
npm install
npm run dev
```

### 2. Backend
```bash
cd backend
npm install
npm run dev
```

### 3. AI Service (Optional)
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

> **Note:** The app works in **demo mode** without the AI service — the backend includes intelligent fallback responses.

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | Vite + React (PWA) |
| Backend | Node.js + Express + Socket.IO |
| AI Engine | Python + FastAPI + LangChain |
| Database | MongoDB Atlas |
| Vector DB | FAISS |

## Features

- 🏥 **AI Symptom Triage** — Smart severity assessment (Emergency/Moderate/Mild)
- 🗣️ **Vernacular Voice** — Hindi, Marathi, Tamil, Telugu support
- 📍 **Hospital Locator** — Find nearest PHC, hospitals, ASHA workers
- 💊 **Diet Guidance** — Condition-specific nutritional advice
- 🚨 **Emergency SOS** — One-tap ambulance calling with location sharing
- 📱 **Offline Ready** — PWA with local caching for poor connectivity areas
