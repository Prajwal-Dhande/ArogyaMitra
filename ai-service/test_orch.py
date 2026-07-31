import asyncio
from dotenv import load_dotenv
load_dotenv(override=True)
from agents.orchestrator import OrchestratorAgent

async def test():
    orch = OrchestratorAgent()
    try:
        res = await orch.process('I have headache', session_id='test10', language='en')
        print("FINAL RESULT:", res)
    except Exception as e:
        print("EXCEPTION:", e)

asyncio.run(test())
