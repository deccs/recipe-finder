'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, Clock, Users, ChefHat, ArrowLeft } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  category: string;
  author: {
    id: string;
    name: string;
  };
  isFavorite: boolean;
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    if (status === 'authenticated') {
      fetchFavorites();
    }
  }, [status, router]);

  const fetchFavorites = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/favorites');
      
      if (response.ok) {
        const data = await response.json();
        setFavorites(data || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch favorites');
        toast.error(errorData.message || 'Failed to fetch favorites');
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFavorite = async (recipeId: string) => {
    try {
      const response = await fetch(`/api/favorites/${recipeId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setFavorites(prev => prev.filter(recipe => recipe.id !== recipeId));
        toast.success('Removed from favorites');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to remove from favorites');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleViewRecipe = (recipeId: string) => {
    router.push(`/recipes/${recipeId}`);
  };

  if (status === 'loading') {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your Favorite Recipes
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              All the recipes you've saved for later
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <Card>
          <CardBody className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Oops, something went wrong
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button
              variant="primary"
              onClick={fetchFavorites}
            >
              Try Again
            </Button>
          </CardBody>
        </Card>
      ) : favorites.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <Heart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start adding recipes to your favorites by clicking the heart icon on any recipe
            </p>
            <Button
              variant="primary"
              onClick={() => router.push('/recipes')}
            >
              Browse Recipes
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((recipe) => (
            <Card key={recipe.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-200 dark:bg-gray-700">
                {recipe.imageUrl ? (
                  <img
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ChefHat className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                
                <button
                  onClick={() => handleRemoveFavorite(recipe.id)}
                  className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  aria-label="Remove from favorites"
                >
                  <Heart className="h-5 w-5 text-red-500 fill-current" />
                </button>
              </div>
              
              <CardBody>
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                    {recipe.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                    {recipe.description}
                  </p>
                </div>
                
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <span className="inline-flex items-center mr-4">
                    <Clock className="h-4 w-4 mr-1" />
                    {recipe.prepTime + recipe.cookTime} min
                  </span>
                  <span className="inline-flex items-center mr-4">
                    <Users className="h-4 w-4 mr-1" />
                    {recipe.servings}
                  </span>
                  <span className="inline-flex items-center">
                    <div className={`h-2 w-2 rounded-full mr-1 ${
                      recipe.difficulty === 'Easy' ? 'bg-green-500' :
                      recipe.difficulty === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    {recipe.difficulty}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                    {recipe.category}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewRecipe(recipe.id)}
                  >
                    View Recipe
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}