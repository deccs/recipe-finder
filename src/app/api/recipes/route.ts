import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface Ingredient {
  name: string;
  amount: string | number;
  unit: string;
}

// GET all recipes
export async function GET() {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ingredients: true,
        _count: {
          select: {
            favorites: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(recipes);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

// POST a new recipe
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      instructions,
      imageUrl,
      prepTime,
      cookTime,
      servings,
      difficulty,
      category,
      tags,
      ingredients,
    } = body;

    // Validate required fields
    if (!title || !description || !instructions || !ingredients || !ingredients.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const recipe = await prisma.recipe.create({
      data: {
        title,
        description,
        instructions,
        imageUrl,
        prepTime,
        cookTime,
        servings,
        difficulty,
        category,
        tags: tags ? tags.join(',') : '',
        authorId: session.user.id,
        ingredients: {
          create: ingredients.map((ingredient: Ingredient) => ({
            name: ingredient.name,
            amount: ingredient.amount,
            unit: ingredient.unit,
          })),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        ingredients: true,
      },
    });

    return NextResponse.json(recipe, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to create recipe' },
      { status: 500 }
    );
  }
}