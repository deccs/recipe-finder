import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET a single timer by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timer = await prisma.timer.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!timer) {
      return NextResponse.json({ error: 'Timer not found' }, { status: 404 });
    }

    // Check if the timer belongs to the current user
    if (timer.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(timer);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch timer' },
      { status: 500 }
    );
  }
}

// PUT (update) a timer by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, duration, isActive } = body;

    // Check if timer exists and belongs to the current user
    const existingTimer = await prisma.timer.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingTimer) {
      return NextResponse.json({ error: 'Timer not found' }, { status: 404 });
    }

    if (existingTimer.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Calculate new end time if duration is updated
    let endTime = existingTimer.endTime;
    if (duration !== undefined && duration !== existingTimer.duration) {
      endTime = new Date();
      endTime.setSeconds(endTime.getSeconds() + duration);
    }

    // Update timer
    const updatedTimer = await prisma.timer.update({
      where: {
        id: params.id,
      },
      data: {
        ...(name !== undefined && { name }),
        ...(duration !== undefined && { duration }),
        ...(isActive !== undefined && { isActive }),
        ...(duration !== undefined && { endTime }),
      },
    });

    return NextResponse.json(updatedTimer);
  } catch {
    return NextResponse.json(
      { error: 'Failed to update timer' },
      { status: 500 }
    );
  }
}

// DELETE a timer by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if timer exists and belongs to the current user
    const existingTimer = await prisma.timer.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingTimer) {
      return NextResponse.json({ error: 'Timer not found' }, { status: 404 });
    }

    if (existingTimer.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete timer
    await prisma.timer.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: 'Timer deleted successfully' });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete timer' },
      { status: 500 }
    );
  }
}