import { NextResponse } from 'next/server';

// Mock data
const agents = [
  {
    id: '1',
    name: 'Support Bot',
    status: 'active',
    tasks: 42,
    type: 'chatbot',
  },
  {
    id: '2',
    name: 'Data Analyzer',
    status: 'active',
    tasks: 18,
    type: 'analytics',
  },
  {
    id: '3',
    name: 'Content Generator',
    status: 'idle',
    tasks: 156,
    type: 'content',
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    data: agents,
    count: agents.length,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Agent name is required' },
        { status: 400 }
      );
    }

    const newAgent = {
      id: Math.random().toString(36).substring(2, 9),
      ...body,
      status: body.status || 'idle',
      tasks: 0,
      createdAt: new Date().toISOString(),
    };

    agents.push(newAgent);

    return NextResponse.json(
      {
        success: true,
        data: newAgent,
        message: 'Agent created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request data' },
      { status: 400 }
    );
  }
}
