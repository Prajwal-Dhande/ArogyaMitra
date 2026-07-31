"""
ArogyaMitra AI Microservice
FastAPI server orchestrating multi-agent healthcare assistance.
"""
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from dotenv import load_dotenv

from agents.orchestrator import OrchestratorAgent

load_dotenv(override=True)

app = FastAPI(
    title="ArogyaMitra AI Engine",
    description="Multi-agent AI system for rural healthcare assistance",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize orchestrator
orchestrator = OrchestratorAgent()


# --- Request/Response Models ---
class ChatRequest(BaseModel):
    message: str
    session_id: str = "default"
    language: str = "en"
    patient_profile: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    response: str
    agent: str
    severity: Optional[str] = None
    session_id: str
    language: str
    metadata: Optional[Dict[str, Any]] = None


class VoiceRequest(BaseModel):
    audio_data: str  # Base64 encoded audio
    language: str = "hi"


class VoiceResponse(BaseModel):
    transcription: str
    language: str
    confidence: float


# --- API Endpoints ---
@app.get("/")
async def root():
    return {
        "service": "ArogyaMitra AI Engine",
        "version": "1.0.0",
        "status": "running",
        "agents": ["orchestrator", "triage", "voice", "resource", "diet"],
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy", "agents_loaded": orchestrator.get_agent_status()}


@app.post("/api/process", response_model=ChatResponse)
async def process_message(request: ChatRequest):
    """Main endpoint: routes user message through the multi-agent system."""
    try:
        result = await orchestrator.process(
            message=request.message,
            session_id=request.session_id,
            language=request.language,
            patient_profile=request.patient_profile or {},
        )
        return ChatResponse(
            response=result["response"],
            agent=result["agent"],
            severity=result.get("severity"),
            session_id=request.session_id,
            language=request.language,
            metadata=result.get("metadata"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")


@app.post("/api/voice/transcribe", response_model=VoiceResponse)
async def transcribe_voice(request: VoiceRequest):
    """Transcribe voice input to text using Bhashini/Whisper."""
    try:
        from agents.voice_agent import VoiceAgent
        voice_agent = VoiceAgent()
        result = await voice_agent.transcribe(request.audio_data, request.language)
        return VoiceResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")


@app.post("/api/voice/synthesize")
async def synthesize_speech(text: str, language: str = "hi"):
    """Convert text to speech in the specified language."""
    try:
        from agents.voice_agent import VoiceAgent
        voice_agent = VoiceAgent()
        result = await voice_agent.synthesize(text, language)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Synthesis error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AI_SERVICE_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
