import openai
import os
from typing import Optional, Dict, Any
import asyncio
from ..config import settings
import logging

logger = logging.getLogger(__name__)


class OpenAIService:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            logger.warning("OPENAI_API_KEY not configured. Using mock responses.")
            self.client = None
        else:
            self.client = openai.OpenAI(api_key=self.api_key)
    
    async def generate_agent_response(self, agent_name: str, user_input: str) -> str:
        """Generate actual AI response based on agent type"""
        
        # If no API key, return mock response
        if not self.client:
            return await self._get_mock_response(agent_name, user_input)
        
        # Define system prompts for different agent types
        system_prompts = {
            "File Organizer Pro": """You are a file organization expert. Analyze the user's file organization request and provide a detailed plan with folder structure, organization steps, and recommendations. Be specific and practical. Format your response with clear sections and bullet points.""",
            
            "Research Assistant": """You are a research assistant. Provide comprehensive research on the given topic with key findings, sources, and recommendations. Structure your response with clear sections: Executive Summary, Key Findings, Sources, Recommendations, and Next Steps.""",
            
            "Code Generator": """You are a senior software engineer. Generate clean, production-ready code based on the user's requirements. Include proper documentation, error handling, and usage examples. Format code in markdown code blocks with language specified. Provide setup instructions if needed.""",
            
            "Content Writer": """You are a professional content writer. Create engaging, well-structured content based on the user's topic and requirements. Adapt tone and style appropriately. Provide multiple sections with headings and clear structure.""",
            
            "Data Analyzer": """You are a data analyst. Provide insights, analysis methodologies, and visualization suggestions for the given data analysis request. Include step-by-step analysis plan, tools needed, and expected outcomes.""",
            
            "Workflow Automator": """You are a workflow automation specialist. Design automated workflows, suggest tools, and provide implementation steps. Include flowchart or step-by-step process with tools and integrations."""
        }
        
        system_prompt = system_prompts.get(agent_name, "You are a helpful AI assistant. Provide detailed, structured, and actionable responses.")
        
        try:
            # Use asyncio.to_thread to run synchronous openai call in thread pool
            response = await asyncio.to_thread(
                self.client.chat.completions.create,
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}
                ],
                temperature=0.7,
                max_tokens=1500
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"OpenAI API error: {str(e)}")
            return await self._get_mock_response(agent_name, user_input)
    
    async def _get_mock_response(self, agent_name: str, user_input: str) -> str:
        """Fallback mock responses when OpenAI is not available"""
        mock_responses = {
            "File Organizer Pro": f"""
✅ **File Organization Analysis Complete**

**User Request:** "{user_input}"

**Recommended Structure:**
📂 Root/
├── 📂 Work/
│   ├── 📂 Projects/
│   ├── 📂 Meetings/
│   └── 📂 Resources/
├── 📂 Personal/
│   ├── 📂 Photos/
│   ├── 📂 Documents/
│   └── 📂 Media/
└── 📂 Archive/

**Immediate Actions:**
1. Create 5 main category folders
2. Move files by type and date
3. Remove duplicates and empty files

**Tools Recommended:**
- FileBot for renaming
- Duplicate Cleaner
- Cloud backup setup

*Note: This is a mock response. Add OpenAI API key for real AI analysis.*
""",
            "Research Assistant": f"""
🔍 **Research Report Generated**

**Topic:** "{user_input}"

**Summary:** Based on initial analysis, this topic shows growing interest with 45% year-over-year growth.

**Key Areas:**
1. Current market trends
2. Major competitors
3. Technological advancements
4. Future projections

**Next Research Steps:**
- Deeper market analysis
- Competitor benchmarking
- Technology assessment

*Note: This is a mock response. Add OpenAI API key for comprehensive AI-powered research.*
""",
            "Code Generator": f"""
💻 **Code Generation Complete**

**Requirements:** "{user_input}"

**Solution Overview:**
A modular Python solution has been designed with:
- REST API endpoints
- Database models
- Error handling
- Testing framework

**Core Components:**
1. Main application logic
2. Data processing module
3. API integration layer
4. Configuration management

**Implementation Time:** ~8 hours
**Complexity:** Medium

*Note: This is a mock response. Add OpenAI API key for actual code generation.*
"""
        }
        
        return mock_responses.get(agent_name, 
            f"🤖 **AI Agent Response**\n\n**Agent:** {agent_name}\n**Input:** {user_input}\n\n*Note: Add OpenAI API key to backend/.env for real AI responses.*"
        )


# Create singleton instance
openai_service = OpenAIService()