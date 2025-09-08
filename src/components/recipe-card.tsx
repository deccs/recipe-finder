import { Card, CardBody, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Heart, Clock, Users, ChefHat } from 'lucide-react';
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

interface RecipeCardProps {
  recipe: Recipe;
  isFavorited?: boolean;
  onToggleFavorite?: (recipeId: string) => void;
  className?: string;
}

export function RecipeCard({ 
  recipe, 
  isFavorited = false, 
  onToggleFavorite,
  className = '' 
}: RecipeCardProps) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  
  return (
    <Card className={`overflow-hidden ${className}`} hover>
      <div className="relative h-48 overflow-hidden">
        {recipe.imageUrl ? (
          <img 
            src={recipe.imageUrl} 
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
            <ChefHat className="h-16 w-16 text-blue-400" />
          </div>
        )}
        
        {onToggleFavorite && (
          <motion.button
            className="absolute top-3 right-3 p-2 bg-white bg-opacity-70 rounded-full hover:bg-opacity-100 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite(recipe.id);
            }}
          >
            <Heart 
              className={`h-5 w-5 ${isFavorited ? 'text-red-500 fill-current' : 'text-gray-600'}`} 
            />
          </motion.button>
        )}
      </div>
      
      <CardBody>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
          {recipe.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {recipe.description}
        </p>
        
        <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
          {totalTime > 0 && (
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              <span>{totalTime} min</span>
            </div>
          )}
          
          {recipe.servings && (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              <span>{recipe.servings} servings</span>
            </div>
          )}
          
          {recipe.difficulty && (
            <div className="flex items-center">
              <span className="capitalize">{recipe.difficulty}</span>
            </div>
          )}
          
          <div className="flex items-center">
            <Heart className="h-4 w-4 mr-1" />
            <span>{recipe._count.favorites}</span>
          </div>
        </div>
      </CardBody>
      
      <CardFooter className="pt-0">
        <div className="flex justify-between items-center w-full">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            by {recipe.author.name}
          </span>
          <Link href={`/recipes/${recipe.id}`}>
            <Button variant="primary" size="sm">
              View Recipe
            </Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}