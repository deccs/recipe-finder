import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface ShoppingListItem {
  name: string;
  amount: string | number;
  unit: string;
}

// GET all shopping lists for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const shoppingLists = await prisma.shoppingList.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        items: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json(shoppingLists);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch shopping lists' },
      { status: 500 }
    );
  }
}

// POST a new shopping list
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, items } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Shopping list name is required' },
        { status: 400 }
      );
    }

    // Create shopping list
    const shoppingList = await prisma.shoppingList.create({
      data: {
        name,
        userId: session.user.id,
        items: items ? {
          create: items.map((item: ShoppingListItem) => ({
            name: item.name,
            amount: item.amount,
            unit: item.unit,
          })),
        } : undefined,
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(shoppingList, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create shopping list' },
      { status: 500 }
    );
  }
}