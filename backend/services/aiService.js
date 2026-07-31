const axios = require('axios');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'https://arogyamitra-ai-service.onrender.com';

// In-memory session store (replace with DB in production)
const sessionStore = new Map();

/**
 * Process a user message through the AI service.
 * Falls back to built-in demo responses if AI service is unavailable.
 */
async function processMessage({ message, sessionId, language, patientProfile }) {
  // Try AI microservice first
  try {
    const response = await axios.post(`${AI_SERVICE_URL}/api/process`, {
      message,
      session_id: sessionId,
      language,
      patient_profile: patientProfile,
    }, { timeout: 15000 });

    // Store in session
    storeMessage(sessionId, 'user', message);
    storeMessage(sessionId, 'assistant', response.data.response, response.data.agent, response.data.severity);

    return {
      response: response.data.response,
      agent: response.data.agent || 'orchestrator',
      severity: response.data.severity || null,
      sessionId,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('⚠️  AI Service unavailable, using fallback:', err.message);
    return fallbackResponse(message, sessionId, language);
  }
}

/**
 * Fallback response when AI service is not running.
 * Uses pattern matching for demo purposes.
 */
function fallbackResponse(message, sessionId, language) {
  const msg = message.toLowerCase();
  let response, agent, severity;

  if (containsAny(msg, ['fever', 'bukhar', 'temperature', 'garam', 'tapman'])) {
    agent = 'triage';
    severity = 'moderate';
    response = `I understand you're experiencing **fever symptoms**. Let me assess:\n\n🌡️ **Follow-up Questions:**\n1. What is your approximate temperature?\n2. How long have you had the fever?\n3. Any other symptoms — headache, body ache, cough?\n4. Are you taking any medication currently?\n\n⚠️ **Immediate advice:**\n• Stay hydrated — drink ORS or lemon water\n• Take rest in a cool environment\n• Paracetamol (500mg) can be taken for relief\n\n> ⚕️ *This is a triage assessment, not a diagnosis. Consult a doctor if fever persists 3+ days.*`;
  } else if (containsAny(msg, ['hospital', 'doctor', 'near', 'clinic', 'phc', 'aspatal', 'dawakhana'])) {
    agent = 'resource';
    severity = null;
    response = `Here are the **nearest healthcare facilities**:\n\n🏥 **1. Primary Health Centre, Wardha**\n📍 2.3 km | ⏰ 24/7 | 📞 07152-243567\n\n🏥 **2. District Hospital, Wardha**\n📍 5.1 km | ⏰ 24/7 | 📞 07152-245890\n\n🏥 **3. Rural Hospital, Pulgaon**\n📍 8.7 km | ⏰ 8AM-8PM | 📞 07153-220134\n\n👩‍⚕️ **ASHA Worker:** Sunita Devi — +91 98765-43210\n\nShall I help with directions?`;
  } else if (containsAny(msg, ['diet', 'food', 'khana', 'nutrition', 'kya khaye'])) {
    agent = 'diet';
    severity = null;
    response = `Here are some **general dietary guidelines**:\n\n🥗 **Balanced Meal Tips:**\n• Include dal/pulses for protein\n• 2-3 servings of seasonal vegetables\n• Roti + rice for carbohydrates\n• Milk/curd for calcium\n\n💧 **Hydration:**\n• 8-10 glasses of water daily\n• Coconut water, buttermilk\n• Avoid sugary drinks\n\n🍎 **Seasonal Fruits:**\n• Banana, pomegranate, guava\n• Amla (gooseberry) for immunity\n\n> 🥗 *For condition-specific diet plans, consult a nutritionist.*`;
  } else if (containsAny(msg, ['emergency', 'help', 'urgent', 'bacchao', 'pain', 'dard', 'chest', 'blood', 'accident'])) {
    agent = 'triage';
    severity = 'emergency';
    response = `🚨 **This sounds urgent!** Here's what to do:\n\n1. **Call 108** (Ambulance) immediately\n2. **Call 112** (Emergency Services)\n3. Stay calm and don't move the patient\n4. Nearest hospital: **District Hospital, Wardha** (5.1 km)\n   📞 07152-245890\n\n⚕️ While waiting for help:\n• Keep the person comfortable\n• Loosen any tight clothing\n• If conscious, give small sips of water\n\n> 🔴 *For medical emergencies, always call 108 first. AI assistance is not a substitute for emergency services.*`;
  } else if (containsAny(msg, ['headache', 'sir', 'sar', 'head', 'migraine'])) {
    agent = 'triage';
    severity = 'mild';
    response = `I see you have a **headache**. Let me help:\n\n🟢 **Severity: Mild** (based on initial assessment)\n\n**Possible Causes:**\n• Dehydration\n• Eye strain\n• Tension/stress\n• Lack of sleep\n\n✅ **Home Remedies:**\n• Drink 2 glasses of water\n• Rest in a dark, quiet room\n• Apply cold cloth on forehead\n• Paracetamol (500mg) if needed\n\n⚠️ **See a doctor if:**\n• Headache persists beyond 24 hours\n• Accompanied by vision changes or vomiting\n• Severe sudden onset ("worst headache of life")\n\n> ⚕️ *Triage assessment only. Not a medical diagnosis.*`;
  } else {
    agent = 'orchestrator';
    severity = null;
    response = `Thank you for reaching out! 🙏\n\nI can help you with:\n\n• 🏥 **Symptom Check** — Tell me how you're feeling\n• 📍 **Find Hospital** — Ask "nearest hospital"\n• 🥗 **Diet Advice** — Ask about nutrition\n• 🚨 **Emergency** — Say "emergency" for urgent help\n\nYou can type in **English or Hindi** — I understand both!\n\nKya aap mujhe bata sakte hain ki aapko kya taklif hai? (Can you tell me what's troubling you?)`;
  }

  storeMessage(sessionId, 'user', message);
  storeMessage(sessionId, 'assistant', response, agent, severity);

  return {
    response,
    agent,
    severity,
    sessionId,
    timestamp: new Date().toISOString(),
  };
}

function containsAny(text, keywords) {
  return keywords.some((kw) => text.includes(kw));
}

function storeMessage(sessionId, role, content, agent = null, severity = null) {
  if (!sessionStore.has(sessionId)) {
    sessionStore.set(sessionId, []);
  }
  sessionStore.get(sessionId).push({
    role,
    content,
    agent,
    severity,
    timestamp: new Date().toISOString(),
  });
}

async function getHistory(sessionId) {
  return {
    sessionId,
    messages: sessionStore.get(sessionId) || [],
  };
}

module.exports = { processMessage, getHistory };
