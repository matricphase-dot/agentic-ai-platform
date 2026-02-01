import asyncio 
from agentic_sdk import AgentBase, register_action 
 
class TestAgent(AgentBase): 
    def __init__(self): 
        super().__init__("Test Agent", "A simple test agent") 
 
    @register_action 
    async def hello(self, name: str = "World"): 
        return {"message": f"Hello, {name}!"} 
 
if __name__ == "__main__": 
    agent = TestAgent() 
    result = asyncio.run(agent.hello("Aditya")) 
    print(result) 
