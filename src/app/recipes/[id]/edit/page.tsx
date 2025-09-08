'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { RecipeForm } from '@/components/recipe-form';
import { toast } from 'react-hot-toast';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

interface Step {
  id: string;
  description: string;
  order: number;
}

interface RecipeFormData {
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  category: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: Step[];
}

export default function EditRecipePage() {
  const params = useParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [recipeData, setRecipeData] = useState<RecipeFormData | null>(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await fetch(`/api/recipes/${params.id}`);
        
        if (response.ok) {
          const recipe = await response.json();
          setRecipeData({
            title: recipe.title,
            description: recipe.description,
            imageUrl: recipe.imageUrl || '',
            prepTime: recipe.prepTime || 0,
            cookTime: recipe.cookTime || 0,
            servings: recipe.servings || 0,
            difficulty: recipe.difficulty || '',
            category: recipe.category || '',
            tags: recipe.tags || [],
            ingredients: recipe.ingredients || [],
            steps: recipe.steps || [],
          });
        } else {
          toast.error('Failed to load recipe');
          router.push('/recipes');
        }
      } catch (error) {
        console.error('Error fetching recipe:', error);
        toast.error('An unexpected error occurred');
        router.push('/recipes');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [params.id, router]);

  const handleSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/recipes/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const recipe = await response.json();
        toast.success('Recipe updated successfully!');
        router.push(`/recipes/${recipe.id}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update recipe');
      }
    } catch (error) {
      console.error('Error updating recipe:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!recipeData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Recipe not found
          </h1>
          <button
            onClick={() => router.push('/recipes')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Recipes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Edit Recipe
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update your recipe details below.
        </p>
      </div>

      <RecipeForm
        initialData={recipeData}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}