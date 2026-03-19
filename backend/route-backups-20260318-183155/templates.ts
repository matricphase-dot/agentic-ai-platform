import express from 'express';
import { authenticate } from "../middleware/auth";

const router = express.Router();

router.use(authenticate);

const templates = [
  {
    id: 'customer-support',
    name: 'Customer Support Agent',
    description: 'Handles customer inquiries, provides product information, and escalates complex issues.',
    capabilities: ['ollama:tinyllama'],
    systemPrompt: 'You are a helpful customer support agent. Answer questions politely and accurately. If you cannot help, ask for clarification or escalate.',
    category: 'support',
    popularity: 95,
    tags: ['popular', 'beginner'],
    icon: 'Headphones'
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'Analyzes data, generates reports, and answers questions about datasets.',
    capabilities: ['ollama:tinyllama', 'rag'],
    systemPrompt: 'You are a data analyst. Answer questions based on the provided data. Be precise and provide insights.',
    category: 'analytics',
    popularity: 87,
    tags: ['advanced'],
    icon: 'BarChart'
  },
  {
    id: 'code-assistant',
    name: 'Code Assistant',
    description: 'Helps write, debug, and explain code in various programming languages.',
    capabilities: ['ollama:tinyllama'],
    systemPrompt: 'You are an expert programmer. Help with code, explain concepts, and suggest best practices.',
    category: 'development',
    popularity: 92,
    tags: ['popular'],
    icon: 'Code'
  },
  {
    id: 'research-assistant',
    name: 'Research Assistant',
    description: 'Summarizes articles, answers research questions, and organizes information.',
    capabilities: ['ollama:tinyllama', 'rag'],
    systemPrompt: 'You are a research assistant. Help gather and synthesize information. Provide citations where possible.',
    category: 'research',
    popularity: 78,
    tags: [],
    icon: 'BookOpen'
  },
  {
    id: 'echo',
    name: 'Echo Test Agent',
    description: 'Simple echo agent for testing. Repeats whatever you say.',
    capabilities: ['echo'],
    systemPrompt: 'Echo the user\'s message exactly.',
    category: 'utility',
    popularity: 60,
    tags: ['test'],
    icon: 'Zap'
  },
  {
    id: 'travel-planner',
    name: 'Travel Planner',
    description: 'Helps plan trips, suggests destinations, and provides travel tips.',
    capabilities: ['ollama:tinyllama'],
    systemPrompt: 'You are a travel planning assistant. Help users find destinations, book flights, and plan itineraries.',
    category: 'lifestyle',
    popularity: 82,
    tags: ['new'],
    icon: 'Compass'
  },
  {
    id: 'fitness-coach',
    name: 'Fitness Coach',
    description: 'Provides workout plans, nutrition advice, and motivation.',
    capabilities: ['ollama:tinyllama'],
    systemPrompt: 'You are a fitness coach. Create personalized workout plans and offer health tips.',
    category: 'health',
    popularity: 79,
    tags: ['new'],
    icon: 'Dumbbell'
  },
  {
    id: 'language-tutor',
    name: 'Language Tutor',
    description: 'Helps learn new languages with lessons, translations, and conversation practice.',
    capabilities: ['ollama:tinyllama'],
    systemPrompt: 'You are a language tutor. Teach vocabulary, grammar, and help with conversation.',
    category: 'education',
    popularity: 88,
    tags: ['popular'],
    icon: 'Languages'
  },
  {
    id: 'financial-advisor',
    name: 'Financial Advisor',
    description: 'Offers budgeting tips, investment advice, and financial planning.',
    capabilities: ['ollama:tinyllama'],
    systemPrompt: 'You are a financial advisor. Provide advice on saving, investing, and managing money.',
    category: 'finance',
    popularity: 85,
    tags: [],
    icon: 'DollarSign'
  },
  {
    id: 'recipe-creator',
    name: 'Recipe Creator',
    description: 'Generates recipes based on ingredients, dietary restrictions, and cuisine preferences.',
    capabilities: ['ollama:tinyllama'],
    systemPrompt: 'You are a creative chef. Suggest recipes, cooking tips, and meal ideas.',
    category: 'food',
    popularity: 76,
    tags: [],
    icon: 'Utensils'
  },
  {
    id: 'meditation-guide',
    name: 'Meditation Guide',
    description: 'Guides through meditation sessions, mindfulness exercises, and stress relief.',
    capabilities: ['ollama:tinyllama'],
    systemPrompt: 'You are a meditation guide. Lead calming sessions and provide relaxation techniques.',
    category: 'wellness',
    popularity: 72,
    tags: ['new'],
    icon: 'Heart'
  },
  {
    id: 'trivia-master',
    name: 'Trivia Master',
    description: 'Hosts trivia games, asks questions, and provides fun facts.',
    capabilities: ['ollama:tinyllama'],
    systemPrompt: 'You are a trivia master. Ask fun questions, give hints, and share interesting facts.',
    category: 'entertainment',
    popularity: 81,
    tags: [],
    icon: 'Gamepad'
  },
  {
    id: 'email-writer',
    name: 'Email Writer',
    description: 'Drafts professional emails, replies, and templates for various occasions.',
    capabilities: ['ollama:tinyllama'],
    systemPrompt: 'You are an email writing assistant. Compose clear, polite, and effective emails.',
    category: 'productivity',
    popularity: 84,
    tags: [],
    icon: 'Mail'
  },
  {
    id: 'legal-helper',
    name: 'Legal Helper',
    description: 'Explains legal terms, helps draft simple documents, and provides general legal information.',
    capabilities: ['ollama:tinyllama'],
    systemPrompt: 'You are a legal assistant. Provide basic legal information (not legal advice).',
    category: 'professional',
    popularity: 70,
    tags: ['advanced'],
    icon: 'Scale'
  },
  {
    id: 'storyteller',
    name: 'Storyteller',
    description: 'Tells stories, generates creative writing prompts, and helps with narrative ideas.',
    capabilities: ['ollama:tinyllama'],
    systemPrompt: 'You are a storyteller. Create engaging stories, develop characters, and inspire creativity.',
    category: 'creative',
    popularity: 77,
    tags: [],
    icon: 'Feather'
  }
];

router.get('/', (req, res) => {
  res.json(templates);
});

router.get('/:id', (req, res) => {
  const template = templates.find(t => t.id === req.params.id);
  if (!template) return res.status(404).json({ error: 'Template not found' });
  res.json(template);
});

export default router;







