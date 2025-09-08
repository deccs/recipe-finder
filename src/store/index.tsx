'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, Recipe, Favorite, ShoppingList, Timer } from '@/types';

// Define the state shape
interface AppState {
  user: User | null;
  recipes: Recipe[];
  favorites: Favorite[];
  shoppingLists: ShoppingList[];
  timers: Timer[];
  isLoading: boolean;
  error: string | null;
}

// Define action types
type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_RECIPES'; payload: Recipe[] }
  | { type: 'ADD_RECIPE'; payload: Recipe }
  | { type: 'UPDATE_RECIPE'; payload: Recipe }
  | { type: 'DELETE_RECIPE'; payload: string }
  | { type: 'SET_FAVORITES'; payload: Favorite[] }
  | { type: 'ADD_FAVORITE'; payload: Favorite }
  | { type: 'REMOVE_FAVORITE'; payload: string }
  | { type: 'SET_SHOPPING_LISTS'; payload: ShoppingList[] }
  | { type: 'ADD_SHOPPING_LIST'; payload: ShoppingList }
  | { type: 'UPDATE_SHOPPING_LIST'; payload: ShoppingList }
  | { type: 'DELETE_SHOPPING_LIST'; payload: string }
  | { type: 'SET_TIMERS'; payload: Timer[] }
  | { type: 'ADD_TIMER'; payload: Timer }
  | { type: 'UPDATE_TIMER'; payload: Timer }
  | { type: 'DELETE_TIMER'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Initial state
const initialState: AppState = {
  user: null,
  recipes: [],
  favorites: [],
  shoppingLists: [],
  timers: [],
  isLoading: false,
  error: null,
};

// Reducer function
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_RECIPES':
      return { ...state, recipes: action.payload };
    case 'ADD_RECIPE':
      return { ...state, recipes: [...state.recipes, action.payload] };
    case 'UPDATE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.map(recipe =>
          recipe.id === action.payload.id ? action.payload : recipe
        ),
      };
    case 'DELETE_RECIPE':
      return {
        ...state,
        recipes: state.recipes.filter(recipe => recipe.id !== action.payload),
      };
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
    case 'ADD_FAVORITE':
      return { ...state, favorites: [...state.favorites, action.payload] };
    case 'REMOVE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.filter(favorite => favorite.id !== action.payload),
      };
    case 'SET_SHOPPING_LISTS':
      return { ...state, shoppingLists: action.payload };
    case 'ADD_SHOPPING_LIST':
      return { ...state, shoppingLists: [...state.shoppingLists, action.payload] };
    case 'UPDATE_SHOPPING_LIST':
      return {
        ...state,
        shoppingLists: state.shoppingLists.map(list =>
          list.id === action.payload.id ? action.payload : list
        ),
      };
    case 'DELETE_SHOPPING_LIST':
      return {
        ...state,
        shoppingLists: state.shoppingLists.filter(list => list.id !== action.payload),
      };
    case 'SET_TIMERS':
      return { ...state, timers: action.payload };
    case 'ADD_TIMER':
      return { ...state, timers: [...state.timers, action.payload] };
    case 'UPDATE_TIMER':
      return {
        ...state,
        timers: state.timers.map(timer =>
          timer.id === action.payload.id ? action.payload : timer
        ),
      };
    case 'DELETE_TIMER':
      return {
        ...state,
        timers: state.timers.filter(timer => timer.id !== action.payload),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    default:
      return state;
  }
}

// Create the context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Create the provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Create a custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}