import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  // In production, fetch from database
  const mockAgent = {
    id: params.id,
    name: 'Sample Agent',
    status: 'active',
    type: 'chatbot',
    description: 'A sample AI agent',
    tasksCompleted: 42,
    lastActive: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    data: mockAgent,
  });
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // In production, update in database
    const updatedAgent = {
      id: params.id,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedAgent,
      message: 'Agent updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update agent' },
      { status: 400 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // In production, delete from database

  return NextResponse.json({
    success: true,
    message: `Agent ${params.id} deleted successfully`,
  });
}
