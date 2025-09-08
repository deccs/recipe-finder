export interface Recipe {
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