export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  instructions: string;
  imageUrl?: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  tags: string[];
  authorId: string;
  author: User;
  createdAt: Date;
  updatedAt: Date;
  ingredients: Ingredient[];
  favorites: Favorite[];
}

export interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  recipeId: string;
}

export interface Favorite {
  id: string;
  userId: string;
  recipeId: string;
  user: User;
  recipe: Recipe;
  createdAt: Date;
}

export interface ShoppingList {
  id: string;
  name: string;
  userId: string;
  user: User;
  createdAt: Date;
  updatedAt: Date;
  items: ShoppingListItem[];
}

export interface ShoppingListItem {
  id: string;
  name: string;
  amount: string;
  unit: string;
  completed: boolean;
  shoppingListId: string;
  shoppingList: ShoppingList;
}

export interface Timer {
  id: string;
  name: string;
  duration: number; // in seconds
  endTime: Date;
  userId: string;
  user: User;
  isActive: boolean;
  createdAt: Date;
}

export interface RecipeFilters {
  search?: string;
  category?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  maxPrepTime?: number;
  maxCookTime?: number;
  tags?: string[];
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}