import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
async function main() {
  const user = await (prisma as any).user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: '\\\$...'  // Replace with a bcrypt hash of your password
    }
  })
  console.log('Seeded:', user)
}
main().catch(console.error).finally(() => prisma.\())







  // Industry‑specific templates
  const industryTemplates = [
    // Healthcare
    {
      name: 'Medical Scribe',
      description: 'Automatically transcribe and summarise patient consultations. Extracts key medical terms and suggests follow‑up actions.',
      category: 'healthcare',
      price: 49.99,
      unit: 'month',
      agent: {
        name: 'MedScribe',
        description: 'AI medical scribe',
        systemPrompt: 'You are a medical scribe. Listen to the conversation and output a structured SOAP note.',
        modelProvider: 'ollama-local',
        modelName: 'llama2',
      }
    },
    {
      name: 'Drug Interaction Checker',
      description: 'Check for potential interactions between medications. Uses up‑to‑date medical databases.',
      category: 'healthcare',
      price: 79.99,
      unit: 'month',
      agent: {
        name: 'RxGuard',
        description: 'Drug interaction AI',
        systemPrompt: 'You are a clinical pharmacist. Given a list of medications, identify any known adverse interactions.',
        modelProvider: 'ollama-local',
        modelName: 'llama2',
      }
    },
    {
      name: 'Patient Intake Assistant',
      description: 'Collect and structure patient intake information via chat. Integrates with EHR systems.',
      category: 'healthcare',
      price: 39.99,
      unit: 'month',
      agent: {
        name: 'IntakeBot',
        description: 'Patient intake AI',
        systemPrompt: 'You are a medical receptionist. Ask the patient relevant questions about their symptoms and medical history.',
        modelProvider: 'ollama-local',
        modelName: 'llama2',
      }
    },

    // Finance
    {
      name: 'Earnings Call Analyst',
      description: 'Analyse earnings call transcripts, extract key metrics, sentiment, and Q&A insights.',
      category: 'finance',
      price: 99.99,
      unit: 'month',
      agent: {
        name: 'CallAnalyst',
        description: 'Earnings call AI',
        systemPrompt: 'You are a financial analyst. Summarise earnings calls, highlight guidance changes, and extract sentiment.',
        modelProvider: 'ollama-local',
        modelName: 'llama2',
      }
    },
    {
      name: 'Personal Finance Coach',
      description: 'Help users budget, save, and invest. Provides personalised advice based on income and goals.',
      category: 'finance',
      price: 29.99,
      unit: 'month',
      agent: {
        name: 'FinanceCoach',
        description: 'Personal finance AI',
        systemPrompt: 'You are a certified financial planner. Help users create budgets, plan for retirement, and understand investment options.',
        modelProvider: 'ollama-local',
        modelName: 'llama2',
      }
    },
    {
      name: 'SEC Filing Summariser',
      description: 'Read 10‑K, 10‑Q filings and produce executive summaries. Highlights risks, financials, and management discussion.',
      category: 'finance',
      price: 89.99,
      unit: 'month',
      agent: {
        name: 'FilingsBot',
        description: 'SEC filing AI',
        systemPrompt: 'You are a securities analyst. Given an SEC filing, extract the most important financial data and risks.',
        modelProvider: 'ollama-local',
        modelName: 'llama2',
      }
    },

    // Education
    {
      name: 'Math Tutor (K‑12)',
      description: 'Step‑by‑step math tutor for students. Explains concepts and provides practice problems.',
      category: 'education',
      price: 19.99,
      unit: 'month',
      agent: {
        name: 'MathTutor',
        description: 'K‑12 math tutor',
        systemPrompt: 'You are a friendly math tutor. Help students understand algebra, geometry, and calculus with clear explanations.',
        modelProvider: 'ollama-local',
        modelName: 'llama2',
      }
    },
    {
      name: 'Essay Grader',
      description: 'Automatically grade student essays. Provides feedback on grammar, structure, and argumentation.',
      category: 'education',
      price: 24.99,
      unit: 'month',
      agent: {
        name: 'EssayGrader',
        description: 'AI essay grader',
        systemPrompt: 'You are an experienced teacher. Grade the essay, assign a score, and provide constructive feedback.',
        modelProvider: 'ollama-local',
        modelName: 'llama2',
      }
    },
    {
      name: 'Language Learning Companion',
      description: 'Chat in a foreign language with corrections and explanations. Supports multiple languages.',
      category: 'education',
      price: 14.99,
      unit: 'month',
      agent: {
        name: 'LangBuddy',
        description: 'Language learning AI',
        systemPrompt: 'You are a native speaker. Chat with the user in the target language, correct mistakes, and explain nuances.',
        modelProvider: 'ollama-local',
        modelName: 'llama2',
      }
    },
  ];

  for (const template of industryTemplates) {
    // Create the agent first
    const agent = await prisma.agents.create({
      data: {
        name: template.agent.name,
        description: template.agent.description,
        systemPrompt: template.agent.systemPrompt,
        modelProvider: template.agent.modelProvider,
        modelName: template.agent.modelName,
        ownerId: (await prisma.users.findFirst({ where: { role: 'admin' } }))?.id,
        status: 'active',
      }
    });

    // Create the template linked to the agent
    await prisma.templates.create({
      data: {
        name: template.name,
        description: template.description,
        category: template.category,
        price: template.price,
        unit: template.unit,
        agentId: agent.id,
      }
    });
  }

  console.log(`✅ Added ${industryTemplates.length} industry templates.`);
