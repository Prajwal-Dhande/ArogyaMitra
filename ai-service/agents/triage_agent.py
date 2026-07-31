import os
import json
from typing import Dict, Any, List
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage


class TriageAgent:
    """
    Symptom assessment agent powered by Gemini API via Langchain.
    Provides severity scoring and first-aid recommendations.
    NEVER provides final diagnosis - only triage.
    """

    def __init__(self):
        print("Triage Agent initialized (Groq/Llama-3)")
        self.llm = ChatGroq(
            model_name="llama-3.3-70b-versatile",
            temperature=0.2,
            groq_api_key=os.getenv("GROQ_API_KEY")
        )

        self.system_prompt = """You are ArogyaMitra Triage Agent, an AI healthcare assistant for rural India.
Your role is to assess symptoms, determine severity, and provide safe first-aid or home-care advice.
CRITICAL RULES:
1. NEVER provide a final medical diagnosis. Always use phrases like "Your symptoms suggest", "It could be", etc.
2. ALWAYS include a disclaimer that you are an AI and they should consult a doctor.
3. Determine a severity level: "mild", "moderate", or "emergency".
   - Emergency: Chest pain, breathing difficulty, severe bleeding, unconsciousness, etc.
   - Moderate: High fever, persistent diarrhea, severe stomach pain.
   - Mild: Headache, common cold, mild fever.
4. If it's an emergency, explicitly tell them to call 108 or 112 immediately.
5. If you need more information to assess, ask up to 3 brief follow-up questions.
34. CRITICAL INSTRUCTION: You MUST respond EXCLUSIVELY in the language "{language}". If the user types in Hindi, Marathi, or any other language, you MUST TRANSLATE your response to "{language}". Under NO circumstances should you output text in a language other than "{language}".
35. Format your response beautifully using markdown (bolding, emojis, bullet points).
36. MUST Output a valid JSON format with the following keys:
   - "response": Your formatted markdown message to the user.
   - "severity": "mild", "moderate", "emergency", or null (if you need more info).
   - "needs_more_info": boolean

Do NOT output markdown blocks wrapping the JSON (like ```json), just output the raw JSON string starting with { and ending with }.
"""
        # We will dynamically replace {language} in assess()
        self.system_prompt_dynamic = self.system_prompt

    async def assess(
        self,
        message: str,
        context: List[Dict] = [],
        patient_profile: Dict[str, Any] = {},
        is_emergency: bool = False,
        language: str = "en",
    ) -> Dict[str, Any]:
        """Assess symptoms and return triage result using Gemini."""
        
        # Build chat history
        # Map language codes to full names
        lang_map = {
            "en": "English",
            "hi": "Hindi",
            "mr": "Marathi",
            "ta": "Tamil",
            "te": "Telugu"
        }
        full_language = lang_map.get(language, "English")
        
        prompt = self.system_prompt_dynamic.replace("{language}", full_language)
        messages = [SystemMessage(content=prompt)]
        
        # Add profile context if available
        if patient_profile:
            conditions = patient_profile.get("medicalInfo", {}).get("existingConditions", [])
            cond_str = ", ".join(conditions) if conditions else "None"
            profile_str = f"Patient Profile: Age {patient_profile.get('age', 'Unknown')}, Gender: {patient_profile.get('gender', 'Unknown')}, Pre-existing Conditions: {cond_str}"
            messages.append(SystemMessage(content=profile_str))
            
        # Add context from current session
        for msg in context[:-1]:  # Exclude current message since we append it next
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))
                
        # Add emergency context if detected by orchestrator
        user_msg = message
        if is_emergency:
            user_msg = f"[SYSTEM: High priority emergency keywords detected in user message] {message}"
            
        messages.append(HumanMessage(content=user_msg))
        
        try:
            response = await self.llm.ainvoke(messages)
            content = response.content.strip()
            
            # Clean JSON if it contains markdown wrappers
            if content.startswith("```json"):
                content = content[7:-3]
            elif content.startswith("```"):
                content = content[3:-3]
                
            import re
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                content = json_match.group(0)
            result = json.loads(content, strict=False)
            
            return {
                "response": result.get("response", "I could not process your request. Please try again."),
                "agent": "triage",
                "severity": result.get("severity"),
                "metadata": {
                    "needs_more_info": result.get("needs_more_info", False),
                    "ai_generated": True
                },
            }
        except Exception as e:
            print(f"Groq API JSON Parse Error: {str(e)}")
            print(f"Content was: {content}")
            return self._fallback_response(message, str(e), content)

    def _fallback_response(self, message: str, error: str = "", raw_content: str = "") -> Dict[str, Any]:
        """Fallback if Groq fails."""
        return {
            "response": f"I am experiencing technical difficulties reaching my medical database. (Error: {error})\n\nRaw LLM Output: {raw_content}\n\nPlease check your GROQ_API_KEY.",
            "agent": "triage",
            "severity": None,
            "metadata": {"error": True},
        }
