import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET all timers for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timers = await prisma.timer.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      orderBy: {
        endTime: 'asc',
      },
    });

    return NextResponse.json(timers);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch timers' },
      { status: 500 }
    );
  }
}

// POST a new timer
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, duration } = body;

    if (!name || !duration) {
      return NextResponse.json(
        { error: 'Timer name and duration are required' },
        { status: 400 }
      );
    }

    // Calculate end time
    const endTime = new Date();
    endTime.setSeconds(endTime.getSeconds() + duration);

    // Create timer
    const timer = await prisma.timer.create({
      data: {
        name,
        duration,
        endTime,
        userId: session.user.id,
      },
    });

    return NextResponse.json(timer, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create timer' },
      { status: 500 }
    );
  }
}