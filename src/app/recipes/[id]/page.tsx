import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Clock, Users, ChefHat, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

async function getRecipe(id: string) {
  try {
    const recipe = await prisma.recipe.findUnique({
      where: {
        id,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        ingredients: {
          orderBy: {
            order: 'asc',
          },
        },
        steps: {
          orderBy: {
            order: 'asc',
          },
        },
        _count: {
          select: {
            favorites: true,
          },
        },
      },
    });

    if (!recipe) {
      return null;
    }

    return recipe;
  } catch (error) {
    console.error('Error fetching recipe:', error);
    return null;
  }
}

async function isUserFavorite(userId: string, recipeId: string) {
  try {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    });

    return !!favorite;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
}

export default async function RecipePage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const recipe = await getRecipe(params.id);

  if (!recipe) {
    notFound();
  }

  const isFavorite = session?.user?.id 
    ? await isUserFavorite(session.user.id, recipe.id) 
    : false;

  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/recipes">
          <Button variant="ghost" className="flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Recipes
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recipe Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {recipe.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {recipe.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <span>by {recipe.author.name}</span>
                    <span className="mx-2">•</span>
                    <span className="flex items-center">
                      <Heart className="h-4 w-4 mr-1" />
                      {recipe._count.favorites} favorites
                    </span>
                  </div>
                </div>
                
                {session && (
                  <form action={`/api/favorites?recipeId=${recipe.id}`} method="POST">
                    <Button
                      type="submit"
                      variant={isFavorite ? "secondary" : "primary"}
                      className="flex items-center"
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                      {isFavorite ? 'Favorited' : 'Favorite'}
                    </Button>
                  </form>
                )}
              </div>
            </CardHeader>
            
            <CardBody>
              {recipe.imageUrl && (
                <div className="mb-6 rounded-lg overflow-hidden">
                  <img 
                    src={recipe.imageUrl} 
                    alt={recipe.title}
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {recipe.prepTime && (
                  <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-500 mb-1" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Prep Time
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {recipe.prepTime} min
                    </span>
                  </div>
                )}
                
                {recipe.cookTime && (
                  <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Clock className="h-6 w-6 text-green-500 mb-1" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Cook Time
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {recipe.cookTime} min
                    </span>
                  </div>
                )}
                
                {totalTime > 0 && (
                  <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Clock className="h-6 w-6 text-purple-500 mb-1" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Total Time
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {totalTime} min
                    </span>
                  </div>
                )}
                
                {recipe.servings && (
                  <div className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Users className="h-6 w-6 text-yellow-500 mb-1" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      Servings
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {recipe.servings}
                    </span>
                  </div>
                )}
              </div>
              
              {recipe.difficulty && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Difficulty
                  </h3>
                  <span className="inline-block px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                    {recipe.difficulty}
                  </span>
                </div>
              )}
            </CardBody>
          </Card>
          
          {/* Ingredients */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <ChefHat className="h-5 w-5 mr-2" />
                Ingredients
              </h2>
            </CardHeader>
            <CardBody>
              <ul className="space-y-2">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {ingredient.amount && `${ingredient.amount} `}
                      {ingredient.unit && `${ingredient.unit} `}
                      {ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>
            </CardBody>
          </Card>
          
          {/* Instructions */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Instructions
              </h2>
            </CardHeader>
            <CardBody>
              <ol className="space-y-4">
                {recipe.steps.map((step, index) => (
                  <li key={index} className="flex">
                    <span className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {step.description}
                    </span>
                  </li>
                ))}
              </ol>
            </CardBody>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions Card */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recipe Actions
              </h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {session?.user?.id === recipe.author.id && (
                <>
                  <Link href={`/recipes/${recipe.id}/edit`}>
                    <Button variant="primary" className="w-full">
                      Edit Recipe
                    </Button>
                  </Link>
                </>
              )}
              
              <form action={`/api/shopping-lists`} method="POST">
                <input type="hidden" name="recipeId" value={recipe.id} />
                <Button variant="secondary" className="w-full">
                  Add to Shopping List
                </Button>
              </form>
              
              <form action={`/api/timers`} method="POST">
                <input type="hidden" name="name" value={`Timer for ${recipe.title}`} />
                <input type="hidden" name="duration" value={totalTime} />
                <Button variant="secondary" className="w-full">
                  Start Cooking Timer
                </Button>
              </form>
            </CardBody>
          </Card>
          
          {/* Tags Card */}
          {recipe.tags && recipe.tags.length > 0 && (
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Tags
                </h2>
              </CardHeader>
              <CardBody>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-block px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}