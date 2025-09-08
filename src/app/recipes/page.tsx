import { RecipeList } from '@/components/recipe-list';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function getRecipes() {
  try {
    const recipes = await prisma.recipe.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
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

    return recipes;
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return [];
  }
}

async function getUserFavorites(userId: string) {
  try {
    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
      },
      select: {
        recipeId: true,
      },
    });

    return favorites.map(favorite => favorite.recipeId);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
}

export default async function RecipesPage() {
  const session = await getServerSession(authOptions);
  const recipes = await getRecipes();
  const userFavorites = session?.user?.id ? await getUserFavorites(session.user.id) : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Recipe Collection
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Browse our collection of delicious recipes or create your own!
        </p>
      </div>

      <RecipeList 
        initialRecipes={recipes} 
        favorites={userFavorites}
        showCreateButton={!!session}
      />
    </div>
  );
}