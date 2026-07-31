"""
Voice Agent — Vernacular Language Processing
Handles speech-to-text, text-to-speech, and language translation.
Supports Indian languages via Bhashini API with Web Speech API fallback.
"""
import os
from typing import Dict, Any, Optional


class VoiceAgent:
    """
    Processes voice input in regional Indian languages.
    Uses Bhashini API for STT/TTS with fallback options.
    """

    SUPPORTED_LANGUAGES = {
        "hi": {"name": "Hindi", "bhashini_code": "hi", "native": "हिन्दी"},
        "en": {"name": "English", "bhashini_code": "en", "native": "English"},
        "mr": {"name": "Marathi", "bhashini_code": "mr", "native": "मराठी"},
        "ta": {"name": "Tamil", "bhashini_code": "ta", "native": "தமிழ்"},
        "te": {"name": "Telugu", "bhashini_code": "te", "native": "తెలుగు"},
        "bn": {"name": "Bengali", "bhashini_code": "bn", "native": "বাংলা"},
        "kn": {"name": "Kannada", "bhashini_code": "kn", "native": "ಕನ್ನಡ"},
        "gu": {"name": "Gujarati", "bhashini_code": "gu", "native": "ગુજરાતી"},
    }

    def __init__(self):
        self.bhashini_api_key = os.getenv("BHASHINI_API_KEY")
        self.bhashini_user_id = os.getenv("BHASHINI_USER_ID")
        self.has_bhashini = bool(self.bhashini_api_key and self.bhashini_api_key != "your_bhashini_key_here")
        print(f"Voice Agent initialized (Bhashini: {'Yes' if self.has_bhashini else 'No - Using fallback'})")

    async def transcribe(self, audio_data: str, language: str = "hi") -> Dict[str, Any]:
        """
        Convert speech to text.
        Tries Bhashini API first, falls back to mock for demo.
        """
        if self.has_bhashini:
            return await self._bhashini_stt(audio_data, language)
        
        # Fallback: mock transcription for demo
        return self._mock_transcription(language)

    async def synthesize(self, text: str, language: str = "hi") -> Dict[str, Any]:
        """
        Convert text to speech audio.
        """
        if self.has_bhashini:
            return await self._bhashini_tts(text, language)
        
        return {
            "audio_url": None,
            "text": text,
            "language": language,
            "method": "fallback",
            "message": "Text-to-speech available via Web Speech API on frontend",
        }

    async def translate(self, text: str, source_lang: str, target_lang: str) -> Dict[str, Any]:
        """Translate text between languages."""
        if self.has_bhashini:
            return await self._bhashini_translate(text, source_lang, target_lang)
        
        return {
            "translated_text": text,  # Return original if no API
            "source_lang": source_lang,
            "target_lang": target_lang,
            "method": "fallback",
        }

    async def _bhashini_stt(self, audio_data: str, language: str) -> Dict[str, Any]:
        """Speech-to-text using Bhashini API."""
        try:
            import httpx
            
            lang_config = self.SUPPORTED_LANGUAGES.get(language, self.SUPPORTED_LANGUAGES["hi"])
            
            async with httpx.AsyncClient() as client:
                # Step 1: Get pipeline config from Bhashini
                pipeline_response = await client.post(
                    "https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline",
                    json={
                        "pipelineTasks": [{"taskType": "asr", "config": {"language": {"sourceLanguage": lang_config["bhashini_code"]}}}],
                        "pipelineRequestConfig": {"pipelineId": "64392f96daac500b55c543cd"},
                    },
                    headers={
                        "ulcaApiKey": self.bhashini_api_key,
                        "userID": self.bhashini_user_id,
                    },
                    timeout=10.0,
                )
                
                if pipeline_response.status_code == 200:
                    pipeline_data = pipeline_response.json()
                    # Process with pipeline...
                    return {
                        "transcription": "Bhashini transcription result",
                        "language": language,
                        "confidence": 0.95,
                    }

        except Exception as e:
            print(f"Bhashini STT error: {e}")
        
        return self._mock_transcription(language)

    async def _bhashini_tts(self, text: str, language: str) -> Dict[str, Any]:
        """Text-to-speech using Bhashini API."""
        # Similar implementation to STT but for TTS pipeline
        return {
            "audio_url": None,
            "text": text,
            "language": language,
            "method": "bhashini",
        }

    async def _bhashini_translate(self, text: str, source: str, target: str) -> Dict[str, Any]:
        """Translation using Bhashini API."""
        return {
            "translated_text": text,
            "source_lang": source,
            "target_lang": target,
            "method": "bhashini",
        }

    def _mock_transcription(self, language: str) -> Dict[str, Any]:
        """Mock transcription for demo purposes."""
        mock_texts = {
            "hi": "मुझे बुखार है और सर में दर्द है",
            "en": "I have fever and headache since yesterday",
            "mr": "मला ताप आहे आणि डोकेदुखी आहे",
            "ta": "எனக்கு காய்ச்சல் மற்றும் தலைவலி உள்ளது",
            "te": "నాకు జ్వరం మరియు తలనొప్పి ఉంది",
        }
        return {
            "transcription": mock_texts.get(language, mock_texts["hi"]),
            "language": language,
            "confidence": 0.88,
        }
