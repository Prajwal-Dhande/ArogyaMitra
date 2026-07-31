import asyncio
from dotenv import load_dotenv
load_dotenv(override=True)
from agents.triage_agent import TriageAgent

async def test():
    t = TriageAgent()
    try:
        res = await t.assess('I have headache', language='en')
        print("FINAL RESULT:", res)
    except Exception as e:
        print("EXCEPTION:", e)

asyncio.run(test())
