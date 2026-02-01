from agentic_sdk import AgentBase, action
import asyncio

class MyAgent(AgentBase):
    def __init__(self):
        super().__init__(
            name="My Agent",
            description="My first AI agent"
        )
    
    @action(description="Process task")
    async def process(self, data: dict) -> dict:
        return {"result": f"Processed: {data}"}

# Test the agent
async def main():
    agent = MyAgent()
    await agent.start()
    result = await agent.execute("process", data={"test": "data"})
    print(f"Result: {result}")
    await agent.stop()

asyncio.run(main())