import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface Ingredient {
  name: string;
  amount: string | number;
  unit: string;
}

// GET a single recipe by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const recipe = await prisma.recipe.findUnique({
      where: {
        id: id,
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
        favorites: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!recipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    return NextResponse.json(recipe);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch recipe' },
      { status: 500 }
    );
  }
}

// PUT (update) a recipe by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    // Check if recipe exists and belongs to the current user
    const existingRecipe = await prisma.recipe.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    if (existingRecipe.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update recipe
    await prisma.recipe.update({
      where: {
        id: id,
      },
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
      },
    });

    // Delete existing ingredients and create new ones
    await prisma.ingredient.deleteMany({
      where: {
        recipeId: id,
      },
    });

    await prisma.ingredient.createMany({
      data: ingredients.map((ingredient: Ingredient) => ({
        name: ingredient.name,
        amount: ingredient.amount,
        unit: ingredient.unit,
        recipeId: id,
      })),
    });

    // Get the updated recipe with relations
    const recipe = await prisma.recipe.findUnique({
      where: {
        id: id,
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

    return NextResponse.json(recipe);
  } catch {
    return NextResponse.json(
      { error: 'Failed to update recipe' },
      { status: 500 }
    );
  }
}

// DELETE a recipe by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if recipe exists and belongs to the current user
    const existingRecipe = await prisma.recipe.findUnique({
      where: {
        id: id,
      },
    });

    if (!existingRecipe) {
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    if (existingRecipe.authorId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete recipe (this will also delete related ingredients due to cascade)
    await prisma.recipe.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ message: 'Recipe deleted successfully' });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
}