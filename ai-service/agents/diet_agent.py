"""
Diet & Prescription Agent — Health & Nutrition Advisor
Provides dietary guidance, nutrition tips, and general health advice.
"""
from typing import Dict, Any, List


# Dietary knowledge base
DIET_DATABASE = {
    "fever": {
        "eat": [
            "Khichdi (light, easy to digest)",
            "Moong dal soup",
            "Coconut water",
            "Seasonal fruits — banana, pomegranate",
            "Tulsi (basil) tea with honey",
            "Warm lemon water with salt",
        ],
        "avoid": [
            "Oily/fried foods",
            "Cold drinks and ice cream",
            "Heavy grains — rajma, chana",
            "Non-vegetarian food (during acute phase)",
            "Dairy products",
        ],
        "hydration": "3-4 liters/day — ORS, lemon water, coconut water",
        "supplements": "Vitamin C, Zinc (as per doctor's advice)",
    },
    "cold_cough": {
        "eat": [
            "Warm turmeric milk (haldi doodh)",
            "Ginger tea with honey",
            "Hot soups — tomato, chicken",
            "Steam-cooked vegetables",
            "Garlic (1-2 cloves with warm water)",
        ],
        "avoid": [
            "Cold water and cold foods",
            "Ice cream, yogurt",
            "Citrus fruits (may irritate throat)",
            "Fried and processed foods",
        ],
        "hydration": "Warm fluids — ginger tea, kadha, warm water",
        "supplements": "Vitamin C, Steam inhalation with eucalyptus",
    },
    "stomach": {
        "eat": [
            "Khichdi with ghee",
            "Curd rice",
            "Banana",
            "Boiled potatoes",
            "Buttermilk (chaas)",
            "Pomegranate juice",
        ],
        "avoid": [
            "Spicy food",
            "Oily/fried food",
            "Raw salads",
            "Milk (if diarrhea)",
            "Caffeine",
        ],
        "hydration": "ORS solution, coconut water, nimbu pani",
        "supplements": "Probiotics (curd/yogurt when stable)",
    },
    "general_health": {
        "eat": [
            "Dal/pulses for protein (daily)",
            "2-3 servings of green vegetables",
            "Seasonal fruits",
            "Whole grains — roti, brown rice",
            "Milk/curd/paneer for calcium",
            "Nuts — almonds, walnuts (handful)",
        ],
        "avoid": [
            "Excessive sugar and sweets",
            "Processed/packaged foods",
            "Excessive salt",
            "Trans fats — vanaspati ghee",
            "Sugary drinks — cola, packed juice",
        ],
        "hydration": "8-10 glasses of water daily",
        "supplements": "Sunlight for Vitamin D, seasonal fruits for vitamins",
    },
    "pregnancy": {
        "eat": [
            "Iron-rich — spinach, jaggery (gud), dates",
            "Calcium — milk, curd, ragi",
            "Folic acid — green leafy vegetables",
            "Protein — dal, eggs, paneer",
            "DHA — walnuts, fish (if non-veg)",
        ],
        "avoid": [
            "Papaya (raw)",
            "Pineapple (excess)",
            "Raw/undercooked food",
            "Excessive caffeine",
            "Alcohol and tobacco",
        ],
        "hydration": "10-12 glasses of water, coconut water, fresh juices",
        "supplements": "Iron + Folic acid tablets (as prescribed by doctor)",
    },
    "diabetes": {
        "eat": [
            "Bitter gourd (karela)",
            "Methi (fenugreek) seeds",
            "Whole grains — jowar, bajra roti",
            "Green vegetables — lauki, tori, palak",
            "Sprouts and salads",
        ],
        "avoid": [
            "White rice (limit quantity)",
            "Sugar, sweets, mithai",
            "White bread, maida",
            "Fruit juices (eat whole fruits instead)",
            "Potatoes, arbi (excess)",
        ],
        "hydration": "Water, buttermilk, methi water (soak overnight)",
        "supplements": "As prescribed — Vitamin B12, Chromium",
    },
}


class DietAgent:
    """Provides dietary and nutrition guidance based on health conditions."""

    def __init__(self):
        print("Diet Agent initialized")

    async def advise(
        self,
        message: str,
        context: List[Dict] = [],
        patient_profile: Dict[str, Any] = {},
    ) -> Dict[str, Any]:
        """Generate dietary advice based on user's query and health profile."""

        # Detect diet context
        category = self._detect_category(message, patient_profile)
        diet_data = DIET_DATABASE.get(category, DIET_DATABASE["general_health"])

        response = self._format_advice(category, diet_data, patient_profile)

        return {
            "response": response,
            "agent": "diet",
            "severity": None,
            "metadata": {"category": category},
        }

    def _detect_category(self, message: str, profile: Dict) -> str:
        """Detect which dietary category applies."""
        msg = message.lower()

        # Check for specific conditions
        conditions = profile.get("medicalInfo", {}).get("existingConditions", [])

        if any(w in msg for w in ["fever", "bukhar"]):
            return "fever"
        if any(w in msg for w in ["cough", "cold", "khansi", "sardi"]):
            return "cold_cough"
        if any(w in msg for w in ["stomach", "pet", "diarrhea", "ulti", "acidity"]):
            return "stomach"
        if any(w in msg for w in ["pregnant", "pregnancy", "garbh"]):
            return "pregnancy"
        if any(w in msg for w in ["diabetes", "sugar", "madhumeh"]) or "Diabetes" in conditions:
            return "diabetes"

        return "general_health"

    def _format_advice(self, category: str, data: Dict, profile: Dict) -> str:
        """Format dietary advice into readable response."""
        title = category.replace("_", " ").title()
        parts = [f"Here are **dietary recommendations** for **{title}**:\n"]

        # Foods to eat
        parts.append("🥗 **Foods to Eat:**")
        for item in data["eat"]:
            parts.append(f"• {item}")
        parts.append("")

        # Foods to avoid
        parts.append("🚫 **Foods to Avoid:**")
        for item in data["avoid"]:
            parts.append(f"• {item}")
        parts.append("")

        # Hydration
        parts.append(f"💧 **Hydration:** {data['hydration']}\n")

        # Supplements
        if data.get("supplements"):
            parts.append(f"💊 **Supplements:** {data['supplements']}\n")

        # Region-specific tips
        parts.append(
            "🏡 **Local Tips:**\n"
            "• Use local seasonal vegetables — they're freshest and cheapest\n"
            "• Cook food fresh — avoid storing for long\n"
            "• Wash all vegetables and fruits before eating\n"
            "• Use iron kadhai (pan) for cooking — adds iron to food\n"
        )

        # Disclaimer
        parts.append(
            "> 🥗 *These are general dietary suggestions. For condition-specific "
            "diet plans, please consult your doctor or a registered nutritionist.*"
        )

        return "\n".join(parts)
