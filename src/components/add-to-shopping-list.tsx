'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Plus, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ShoppingList {
  id: string;
  name: string;
}

interface Ingredient {
  id: string;
  name: string;
  quantity: string;
}

interface AddToShoppingListProps {
  recipeId: string;
  ingredients: Ingredient[];
  className?: string;
}

export default function AddToShoppingList({
  recipeId,
  ingredients,
  className = '',
}: AddToShoppingListProps) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [selectedListId, setSelectedListId] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');

  const fetchShoppingLists = async () => {
    try {
      const response = await fetch('/api/shopping-lists');
      
      if (response.ok) {
        const data = await response.json();
        setShoppingLists(data || []);
        
        if (data.length > 0) {
          setSelectedListId(data[0].id);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to fetch shopping lists');
      }
    } catch (error) {
      console.error('Error fetching shopping lists:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      toast.error('Please enter a list name');
      return;
    }
    
    try {
      const response = await fetch('/api/shopping-lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newListName }),
      });
      
      if (response.ok) {
        const newList = await response.json();
        setShoppingLists(prev => [newList, ...prev]);
        setSelectedListId(newList.id);
        setNewListName('');
        setIsCreating(false);
        toast.success('Shopping list created successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create shopping list');
      }
    } catch (error) {
      console.error('Error creating shopping list:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleAddToShoppingList = async () => {
    if (!selectedListId) {
      toast.error('Please select a shopping list');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/shopping-lists/${selectedListId}/items/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          items: ingredients.map(ing => ({
            name: ing.name,
            quantity: ing.quantity,
          }))
        }),
      });
      
      if (response.ok) {
        toast.success('Ingredients added to shopping list successfully');
        setIsOpen(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add ingredients to shopping list');
      }
    } catch (error) {
      console.error('Error adding ingredients to shopping list:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    if (status === 'unauthenticated') {
      toast.error('Please sign in to add ingredients to shopping list');
      return;
    }
    
    if (status === 'loading') {
      return;
    }
    
    setIsOpen(true);
    fetchShoppingLists();
  };

  if (status === 'loading') {
    return (
      <Button variant="outline" disabled className={className}>
        <ShoppingBag className="h-4 w-4 mr-2" />
        Add to Shopping List
      </Button>
    );
  }

  return (
    <div className={className}>
      <Button
        variant="outline"
        onClick={handleOpen}
        className="w-full"
      >
        <ShoppingBag className="h-4 w-4 mr-2" />
        Add to Shopping List
      </Button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add to Shopping List
              </h3>
            </CardHeader>
            
            <CardBody>
              <div className="space-y-4">
                {shoppingLists.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select Shopping List
                    </label>
                    <select
                      value={selectedListId}
                      onChange={(e) => setSelectedListId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                    >
                      {shoppingLists.map((list) => (
                        <option key={list.id} value={list.id}>
                          {list.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {isCreating ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      New List Name
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="Enter list name"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                      <Button
                        variant="primary"
                        onClick={handleCreateList}
                        disabled={!newListName.trim()}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => setIsCreating(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    onClick={() => setIsCreating(true)}
                    className="w-full flex items-center justify-center text-blue-600"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create New List
                  </Button>
                )}

                <div className="pt-2 flex space-x-2">
                  <Button
                    variant="secondary"
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleAddToShoppingList}
                    disabled={isLoading || !selectedListId}
                    className="flex-1"
                  >
                    {isLoading ? 'Adding...' : 'Add Ingredients'}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}