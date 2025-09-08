import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET all favorites for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        recipe: {
          include: {
            author: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(favorites);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST a new favorite
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipeId } = body;

    if (!recipeId) {
      return NextResponse.json(
        { error: 'Recipe ID is required' },
        { status: 400 }
      );
    }

    // Check if recipe exists
    const recipe = await prisma.recipe.findUnique({
      where: {
        id: recipeId,
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId: session.user.id,
          recipeId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json(
        { error: 'Recipe already favorited' },
        { status: 400 }
      );
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        recipeId,
      },
      include: {
        recipe: true,
      },
    });

    return NextResponse.json(favorite, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create favorite' },
      { status: 500 }
    );
  }
}