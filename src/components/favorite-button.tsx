'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface FavoriteButtonProps {
  recipeId: string;
  isFavorite: boolean;
  onToggle?: (isFavorite: boolean) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function FavoriteButton({
  recipeId,
  isFavorite: initialIsFavorite,
  onToggle,
  className = '',
  size = 'md',
}: FavoriteButtonProps) {
  const { data: session, status } = useSession();
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
  const [isLoading, setIsLoading] = useState(false);

  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (status === 'unauthenticated') {
      toast.error('Please sign in to add favorites');
      return;
    }

    if (status === 'loading') {
      return;
    }

    setIsLoading(true);

    try {
      if (isFavorite) {
        // Remove from favorites
        const response = await fetch(`/api/favorites/${recipeId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setIsFavorite(false);
          onToggle?.(false);
          toast.success('Removed from favorites');
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to remove from favorites');
        }
      } else {
        // Add to favorites
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ recipeId }),
        });

        if (response.ok) {
          setIsFavorite(true);
          onToggle?.(true);
          toast.success('Added to favorites');
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Failed to add to favorites');
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading || status === 'loading'}
      className={`p-2 rounded-full transition-colors ${
        isFavorite
          ? 'bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30'
          : 'bg-white dark:bg-gray-800 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
      } ${className}`}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-500"></div>
      ) : (
        <Heart
          className={`${sizeClasses[size]} ${
            isFavorite ? 'fill-current' : ''
          }`}
        />
      )}
    </button>
  );
}