import asyncio
from dotenv import load_dotenv
load_dotenv(override=True)
from agents.triage_agent import TriageAgent

async def test():
    t = TriageAgent()
    try:
        res = await t.assess('what can I doo next', language='en')
        with open('test_output2.txt', 'w', encoding='utf-8') as f:
            f.write(str(res))
    except Exception as e:
        print("Error:", e)

asyncio.run(test())
