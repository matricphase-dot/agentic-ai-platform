import { NextResponse } from 'next/server';

// Mock data - replace with database in production
const mockAgents = [
  { id: '1', name: 'Support Bot', status: 'active', tasks: 42 },
  { id: '2', name: 'Data Analyzer', status: 'active', tasks: 18 },
  { id: '3', name: 'Content Generator', status: 'idle', tasks: 156 },
];

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  return NextResponse.json({
    success: true,
    data: mockAgents,
    count: mockAgents.length,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate request
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Agent name is required' },
        { status: 400 }
      );
    }

    // Create new agent (in production, save to database)
    const newAgent = {
      id: Math.random().toString(36).substring(2, 9),
      name: body.name,
      status: 'idle',
      tasks: 0,
      createdAt: new Date().toISOString(),
    };

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
