"""
Resource Locator Agent — Healthcare Facility Finder
Finds nearest PHCs, hospitals, ASHA workers, and provides directions.
"""
import math
from typing import Dict, Any, List


# Healthcare facility database for Maharashtra (demo data)
FACILITIES_DB = [
    {
        "id": "phc-wardha-1",
        "name": "Primary Health Centre, Wardha",
        "type": "PHC",
        "lat": 20.7452,
        "lng": 78.5982,
        "phone": "07152-243567",
        "hours": "24/7",
        "services": ["General Medicine", "Maternity", "Vaccination", "Lab Tests"],
        "doctors": 2,
    },
    {
        "id": "dh-wardha",
        "name": "District Hospital, Wardha",
        "type": "District Hospital",
        "lat": 20.7332,
        "lng": 78.6060,
        "phone": "07152-245890",
        "hours": "24/7",
        "services": ["Emergency", "Surgery", "ICU", "Maternity", "X-Ray", "Blood Bank"],
        "doctors": 15,
    },
    {
        "id": "rh-pulgaon",
        "name": "Rural Hospital, Pulgaon",
        "type": "Rural Hospital",
        "lat": 20.7277,
        "lng": 78.3172,
        "phone": "07153-220134",
        "hours": "8:00 AM - 8:00 PM",
        "services": ["General Medicine", "Maternity", "Minor Surgery"],
        "doctors": 3,
    },
    {
        "id": "shc-deoli",
        "name": "Sub Health Centre, Deoli",
        "type": "Sub Centre",
        "lat": 20.6527,
        "lng": 78.4849,
        "phone": "07152-230456",
        "hours": "9:00 AM - 5:00 PM",
        "services": ["General Check-up", "Vaccination", "Antenatal Care"],
        "doctors": 1,
    },
    {
        "id": "ayush-wardha",
        "name": "AYUSH Health Centre, Wardha",
        "type": "AYUSH Centre",
        "lat": 20.7410,
        "lng": 78.5900,
        "phone": "07152-248901",
        "hours": "9:00 AM - 4:00 PM",
        "services": ["Ayurveda", "Yoga", "Unani", "Homeopathy"],
        "doctors": 2,
    },
]

ASHA_WORKERS = [
    {"name": "Sunita Devi", "phone": "+91 98765-43210", "area": "Wardha Block", "village": "Wardha"},
    {"name": "Meena Bai", "phone": "+91 98765-43211", "area": "Deoli Block", "village": "Deoli"},
    {"name": "Rani Kumari", "phone": "+91 98765-43212", "area": "Pulgaon Block", "village": "Pulgaon"},
]


class ResourceAgent:
    """Finds healthcare facilities, ASHA workers, and provides emergency contacts."""

    def __init__(self):
        # Default location: Wardha, Maharashtra
        self.default_lat = 20.7332
        self.default_lng = 78.6060
        print("Resource Agent initialized")

    async def find_facilities(
        self,
        message: str,
        patient_profile: Dict[str, Any] = {},
    ) -> Dict[str, Any]:
        """Find nearby healthcare facilities based on user's location."""

        # Get patient location (default to Wardha)
        location = patient_profile.get("location", {})
        user_lat = location.get("lat", self.default_lat)
        user_lng = location.get("lng", self.default_lng)

        # Calculate distances
        facilities_with_dist = []
        for facility in FACILITIES_DB:
            dist = self._haversine(user_lat, user_lng, facility["lat"], facility["lng"])
            eta = max(5, int(dist * 3))  # Rough ETA: 3 min per km
            facilities_with_dist.append({**facility, "distance": round(dist, 1), "eta_min": eta})

        # Sort by distance
        facilities_with_dist.sort(key=lambda x: x["distance"])

        # Find nearest ASHA worker
        village = location.get("village", "Wardha")
        asha = next(
            (a for a in ASHA_WORKERS if a["village"].lower() == village.lower()),
            ASHA_WORKERS[0],
        )

        # Build response
        response = self._format_response(facilities_with_dist[:4], asha)

        return {
            "response": response,
            "agent": "resource",
            "severity": None,
            "metadata": {
                "facilities_found": len(facilities_with_dist),
                "nearest": facilities_with_dist[0]["name"] if facilities_with_dist else None,
            },
        }

    def _format_response(self, facilities: List[Dict], asha: Dict) -> str:
        """Format facility list into a readable response."""
        parts = [f"I found **{len(facilities)} healthcare facilities** near you:\n"]

        for i, f in enumerate(facilities, 1):
            status = "🟢 Open" if self._is_open(f["hours"]) else "🔴 Closed"
            parts.append(
                f"🏥 **{i}. {f['name']}**\n"
                f"📍 {f['distance']} km away | ⏰ ~{f['eta_min']} min\n"
                f"📞 {f['phone']} | {status}\n"
                f"🏷️ {f['type']} — {', '.join(f['services'][:3])}\n"
                f"👨‍⚕️ {f['doctors']} doctor(s) available\n"
            )

        # ASHA worker
        parts.append(
            f"---\n"
            f"👩‍⚕️ **ASHA Worker:** {asha['name']}\n"
            f"📞 {asha['phone']}\n"
            f"📍 Area: {asha['area']}\n"
        )

        # Government schemes
        parts.append(
            "\n💡 **Government Health Schemes:**\n"
            "• **Ayushman Bharat** — Free treatment up to ₹5 lakh/year\n"
            "• **JSSK** — Free maternity care for pregnant women\n"
            "• **RBSK** — Free health screening for children\n"
        )

        parts.append("Would you like **directions** to any of these facilities?")

        return "\n".join(parts)

    def _is_open(self, hours: str) -> bool:
        """Check if facility is currently open (simplified)."""
        if "24/7" in hours:
            return True
        # Simplified — assume open during day hours
        return True

    @staticmethod
    def _haversine(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        """Calculate distance between two coordinates in km."""
        R = 6371
        dlat = math.radians(lat2 - lat1)
        dlng = math.radians(lng2 - lng1)
        a = (
            math.sin(dlat / 2) ** 2
            + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlng / 2) ** 2
        )
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c
