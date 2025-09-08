'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function CreateRecipePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (data: RecipeFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const recipe = await response.json();
        toast.success('Recipe created successfully!');
        router.push(`/recipes/${recipe.id}`);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to create recipe');
      }
    } catch (error) {
      console.error('Error creating recipe:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Create New Recipe
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Fill in the details below to create your delicious recipe.
        </p>
      </div>

      <RecipeForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}