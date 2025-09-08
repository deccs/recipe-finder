import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface ShoppingListItem {
  name: string;
  amount: string;
  unit: string;
  completed: boolean;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const shoppingList = await prisma.shoppingList.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      include: {
        items: {
          orderBy: {
            id: 'asc',
          },
        },
      },
    });
    
    if (!shoppingList) {
      return NextResponse.json({ message: 'Shopping list not found' }, { status: 404 });
    }
    
    return NextResponse.json(shoppingList);
  } catch (error) {
    console.error('Error fetching shopping list:', error);
    return NextResponse.json(
      { message: 'Failed to fetch shopping list' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const { name, items } = await request.json();
    
    // Check if the shopping list exists and belongs to the user
    const existingList = await prisma.shoppingList.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });
    
    if (!existingList) {
      return NextResponse.json({ message: 'Shopping list not found' }, { status: 404 });
    }
    
    // Update the shopping list
    const updatedList = await prisma.shoppingList.update({
      where: {
        id: params.id,
      },
      data: {
        ...(name && { name }),
        ...(items && {
          items: {
            deleteMany: {},
            create: items.map((item: ShoppingListItem) => ({
              name: item.name,
              amount: item.amount,
              unit: item.unit,
              completed: item.completed || false,
            })),
          },
        }),
      },
      include: {
        items: {
          orderBy: {
            id: 'asc',
          },
        },
      },
    });
    
    return NextResponse.json(updatedList);
  } catch (error) {
    console.error('Error updating shopping list:', error);
    return NextResponse.json(
      { message: 'Failed to update shopping list' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const params = await context.params;
    
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if the shopping list exists and belongs to the user
    const existingList = await prisma.shoppingList.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });
    
    if (!existingList) {
      return NextResponse.json({ message: 'Shopping list not found' }, { status: 404 });
    }
    
    // Delete the shopping list
    await prisma.shoppingList.delete({
      where: {
        id: params.id,
      },
    });
    
    return NextResponse.json({ message: 'Shopping list deleted successfully' });
  } catch (error) {
    console.error('Error deleting shopping list:', error);
    return NextResponse.json(
      { message: 'Failed to delete shopping list' },
      { status: 500 }
    );
  }
}