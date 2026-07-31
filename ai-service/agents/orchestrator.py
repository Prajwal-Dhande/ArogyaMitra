"""
Orchestrator Agent — Master Coordinator
Routes user queries to specialized agents and manages conversation flow.
"""
import re
from typing import Dict, Any, Optional
from agents.triage_agent import TriageAgent
from agents.resource_agent import ResourceAgent
from agents.diet_agent import DietAgent


class OrchestratorAgent:
    """
    The central brain that decides which specialized agent should handle 
    a user's query based on intent detection.
    """

    def __init__(self):
        self.triage_agent = TriageAgent()
        self.resource_agent = ResourceAgent()
        self.diet_agent = DietAgent()
        self.session_context: Dict[str, list] = {}
        print("Orchestrator Agent initialized")

    def get_agent_status(self) -> Dict[str, str]:
        return {
            "orchestrator": "active",
            "triage": "active",
            "resource": "active",
            "diet": "active",
            "voice": "standby",
        }

    async def process(
        self,
        message: str,
        session_id: str,
        language: str = "en",
        patient_profile: Dict[str, Any] = {},
    ) -> Dict[str, Any]:
        """
        Main processing pipeline:
        1. Detect intent from user message
        2. Route to appropriate agent
        3. Return formatted response
        """
        # Store context
        if session_id not in self.session_context:
            self.session_context[session_id] = []
        self.session_context[session_id].append({"role": "user", "content": message})

        # Detect intent
        intent = self._detect_intent(message)
        context = self.session_context.get(session_id, [])

        # Route to appropriate agent
        if intent == "emergency":
            result = await self.triage_agent.assess(message, context, patient_profile, is_emergency=True, language=language)
        elif intent == "find_facility":
            result = await self.resource_agent.find_facilities(message, patient_profile)
        elif intent == "diet":
            result = await self.diet_agent.advise(message, context, patient_profile)
        else:
            # Default to Triage/General Conversation handled by Gemini
            result = await self.triage_agent.assess(message, context, patient_profile, language=language)

        # Store response in context
        self.session_context[session_id].append({
            "role": "assistant",
            "agent": result["agent"],
            "content": result["response"],
        })

        # Keep context manageable (last 20 messages)
        if len(self.session_context[session_id]) > 20:
            self.session_context[session_id] = self.session_context[session_id][-20:]

        return result

    def _detect_intent(self, message: str) -> str:
        """
        Rule-based intent detection.
        In production, this would use an LLM or trained classifier.
        """
        msg = message.lower()

        # Emergency keywords (highest priority)
        emergency_words = [
            "emergency", "urgent", "dying", "accident", "blood", "unconscious",
            "chest pain", "breathing", "heart attack", "seizure", "poison",
            "bacchao", "madad", "jaldi", "behosh", "khoon", "saans",
        ]
        if any(word in msg for word in emergency_words):
            return "emergency"

        # Symptom/health keywords
        symptom_words = [
            "fever", "pain", "headache", "cough", "cold", "vomit", "diarrhea",
            "weakness", "dizziness", "rash", "swelling", "infection", "sick",
            "bukhar", "dard", "khansi", "sardi", "ulti", "kamzori", "sujan",
            "chakkar", "bimari", "taklif", "tabiyat", "bimaari",
            "symptom", "feeling", "ache", "hurt", "sore", "nausea",
        ]
        if any(word in msg for word in symptom_words):
            return "symptoms"

        # Facility/location keywords
        facility_words = [
            "hospital", "doctor", "clinic", "phc", "near", "closest",
            "aspatal", "dawakhana", "asha", "nurse", "ambulance",
            "medical", "dispensary", "centre", "center",
        ]
        if any(word in msg for word in facility_words):
            return "find_facility"

        # Diet/nutrition keywords
        diet_words = [
            "diet", "food", "nutrition", "eat", "khana", "kya khaye",
            "meal", "vitamin", "protein", "weight", "healthy food",
            "recipe", "calories", "supplement",
        ]
        if any(word in msg for word in diet_words):
            return "diet"

        return "general"

    def _general_response(self, message: str, language: str) -> Dict[str, Any]:
        """Default response when intent is unclear."""
        return {
            "response": (
                "🙏 Namaste! I'm **ArogyaMitra**, your AI health assistant.\n\n"
                "I can help you with:\n\n"
                "• 🏥 **Health Check** — Tell me your symptoms (e.g., 'I have fever and headache')\n"
                "• 📍 **Find Hospital** — Say 'nearest hospital' or 'find doctor'\n"
                "• 🥗 **Diet Advice** — Ask 'what should I eat' or 'healthy diet'\n"
                "• 🚨 **Emergency** — Say 'emergency' for urgent assistance\n\n"
                "Aap Hindi ya English mein baat kar sakte hain! 🇮🇳\n\n"
                "**How can I help you today?**"
            ),
            "agent": "orchestrator",
            "severity": None,
            "metadata": {"intent": "general"},
        }
