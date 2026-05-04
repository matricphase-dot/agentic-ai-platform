import { z } from "zod";

export const signupSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8).max(100),
    name: z.string().min(2).max(100),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

export const createAgentSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100),
    slug: z.string().min(3).max(50).regex(/^[a-z0-z0-9-]+$/),
    description: z.string().min(20).max(2000),
    category: z.enum(['CHATBOT','DATA_ANALYST','CODE_ASSISTANT','RESEARCH','AUTOMATION','CUSTOMER_SUPPORT','FINANCE','LEGAL','OTHER']),
    modelProvider: z.enum(['groq','huggingface','ollama','google','openai','anthropic']),
    modelName: z.string().min(1).max(100),
    systemPrompt: z.string().min(10).max(10000),
    pricingModel: z.enum(['FREE','PER_INVOCATION','PER_TOKEN']),
    pricePerCall: z.number().min(0).max(100).optional(),
    pricePerToken: z.number().min(0).max(1).optional(),
    isPublic: z.boolean().optional(),
    tags: z.array(z.string().max(30)).max(10).optional(),
  }),
});

export const updateAgentSchema = z.object({
  body: z.object({
    name: z.string().min(3).max(100).optional(),
    description: z.string().min(20).max(2000).optional(),
    category: z.enum(['CHATBOT','DATA_ANALYST','CODE_ASSISTANT','RESEARCH','AUTOMATION','CUSTOMER_SUPPORT','FINANCE','LEGAL','OTHER']).optional(),
    modelProvider: z.enum(['groq','huggingface','ollama','google','openai','anthropic']).optional(),
    modelName: z.string().min(1).max(100).optional(),
    systemPrompt: z.string().min(10).max(10000).optional(),
    pricingModel: z.enum(['FREE','PER_INVOCATION','PER_TOKEN']).optional(),
    pricePerCall: z.number().min(0).max(100).optional(),
    pricePerToken: z.number().min(0).max(1).optional(),
    isPublic: z.boolean().optional(),
    status: z.enum(['DRAFT', 'PUBLISHED', 'DEPRECATED']).optional(),
    tags: z.array(z.string().max(30)).max(10).optional(),
  }),
});

export const invokeSchema = z.object({
  params: z.object({
    agentId: z.string().cuid(),
  }),
  body: z.object({
    message: z.string().min(1).max(20000), // Updated to support 'message' as per implementation
    stream: z.boolean().optional(),
  }),
});

export const createProposalSchema = z.object({
  body: z.object({
    title: z.string().min(5).max(200),
    description: z.string().min(20).max(5000),
    type: z.enum(["FEE_CHANGE", "TREASURY", "FEATURE", "SLASH", "OTHER"]),
    executionData: z.any().optional(),
  }),
});

export const stakeSchema = z.object({
  body: z.object({
    agentId: z.string().cuid(),
    amount: z.number().positive(),
  }),
});

export const billingSchema = z.object({
  body: z.object({
    amount: z.number().min(1).max(10000),
    method: z.enum(['RAZORPAY', 'PAYPAL', 'STRIPE']).optional(),
  }),
});
