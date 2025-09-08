'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RecipeCard } from '@/components/recipe-card';
import { RecipeSearchFilter, RecipeFilters } from '@/components/recipe-search-filter';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Plus, ChefHat } from 'lucide-react';
import Link from 'next/link';

interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  difficulty?: string;
  author: {
    id: string;
    name: string;
  };
  _count: {
    favorites: number;
  };
}

interface RecipeListProps {
  initialRecipes?: Recipe[];
  favorites?: string[];
  onToggleFavorite?: (recipeId: string) => void;
  showCreateButton?: boolean;
  className?: string;
}

export function RecipeList({ 
  initialRecipes = [], 
  favorites = [], 
  onToggleFavorite,
  showCreateButton = true,
  className = '' 
}: RecipeListProps) {
  const [recipes, setRecipes] = useState<Recipe[]>(initialRecipes);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>(initialRecipes);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<RecipeFilters>({});

  // Fetch recipes when search or filters change
  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      
      try {
        // Build query parameters
        const params = new URLSearchParams();
        if (searchQuery) params.append('query', searchQuery);
        
        if (filters.category) params.append('category', filters.category);
        if (filters.difficulty) params.append('difficulty', filters.difficulty);
        if (filters.prepTime) params.append('maxPrepTime', filters.prepTime.toString());
        if (filters.cookTime) params.append('maxCookTime', filters.cookTime.toString());
        if (filters.tags && filters.tags.length > 0) {
          params.append('tags', filters.tags.join(','));
        }
        
        const queryString = params.toString();
        const url = `/api/recipes${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setRecipes(data);
          setFilteredRecipes(data);
        } else {
          console.error('Failed to fetch recipes');
        }
      } catch (error) {
        console.error('Error fetching recipes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipes();
  }, [searchQuery, filters]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle filtering
  const handleFilter = (newFilters: RecipeFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filter Section */}
      <RecipeSearchFilter onSearch={handleSearch} onFilter={handleFilter} />
      
      {/* Create Recipe Button */}
      {showCreateButton && (
        <div className="flex justify-end">
          <Link href="/recipes/create">
            <Button variant="primary" className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Create Recipe
            </Button>
          </Link>
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}
      
      {/* Empty State */}
      {!isLoading && filteredRecipes.length === 0 && (
        <Card>
          <CardBody className="text-center py-12">
            <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No recipes found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {searchQuery || Object.keys(filters).some(key => filters[key as keyof RecipeFilters])
                ? 'Try adjusting your search or filters to find what you\'re looking for.'
                : 'Get started by creating your first recipe!'}
            </p>
            {showCreateButton && (
              <Link href="/recipes/create">
                <Button variant="primary" className="flex items-center mx-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Recipe
                </Button>
              </Link>
            )}
          </CardBody>
        </Card>
      )}
      
      {/* Recipe Grid */}
      {!isLoading && filteredRecipes.length > 0 && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {filteredRecipes.length} {filteredRecipes.length === 1 ? 'Recipe' : 'Recipes'}
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredRecipes.map((recipe, index) => (
                <motion.div
                  key={recipe.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <RecipeCard
                    recipe={recipe}
                    isFavorited={favorites.includes(recipe.id)}
                    onToggleFavorite={onToggleFavorite}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}