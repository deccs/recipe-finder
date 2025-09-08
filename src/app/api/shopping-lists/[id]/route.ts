import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET a single shopping list by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const shoppingList = await prisma.shoppingList.findUnique({
      where: {
        id: params.id,
      },
      include: {
        items: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!shoppingList) {
      return NextResponse.json(
        { error: 'Shopping list not found' },
        { status: 404 }
      );
    }

    // Check if the shopping list belongs to the current user
    if (shoppingList.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(shoppingList);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch shopping list' },
      { status: 500 }
    );
  }
}

// PUT (update) a shopping list by ID
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
    const { name, items } = body;

    // Check if shopping list exists and belongs to the current user
    const existingShoppingList = await prisma.shoppingList.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingShoppingList) {
      return NextResponse.json(
        { error: 'Shopping list not found' },
        { status: 404 }
      );
    }

    if (existingShoppingList.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update shopping list
    const updatedShoppingList = await prisma.shoppingList.update({
      where: {
        id: params.id,
      },
      data: {
        name,
      },
    });

    // Update items if provided
    if (items) {
      // Delete existing items
      await prisma.shoppingListItem.deleteMany({
        where: {
          shoppingListId: params.id,
        },
      });

      // Create new items
      await prisma.shoppingListItem.createMany({
        data: items.map((item: any) => ({
          name: item.name,
          amount: item.amount,
          unit: item.unit,
          completed: item.completed || false,
          shoppingListId: params.id,
        })),
      });
    }

    // Get the updated shopping list with relations
    const shoppingList = await prisma.shoppingList.findUnique({
      where: {
        id: params.id,
      },
      include: {
        items: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    return NextResponse.json(shoppingList);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update shopping list' },
      { status: 500 }
    );
  }
}

// DELETE a shopping list by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if shopping list exists and belongs to the current user
    const existingShoppingList = await prisma.shoppingList.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingShoppingList) {
      return NextResponse.json(
        { error: 'Shopping list not found' },
        { status: 404 }
      );
    }

    if (existingShoppingList.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete shopping list (this will also delete related items due to cascade)
    await prisma.shoppingList.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: 'Shopping list deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete shopping list' },
      { status: 500 }
    );
  }
}