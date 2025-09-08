'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ShoppingCart, Trash2, Edit, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ShoppingList {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}

export default function ShoppingListsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newListName, setNewListName] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    if (status === 'authenticated') {
      fetchShoppingLists();
    }
  }, [status, router]);

  const fetchShoppingLists = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/shopping-lists');
      
      if (response.ok) {
        const data = await response.json();
        setShoppingLists(data || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch shopping lists');
        toast.error(errorData.message || 'Failed to fetch shopping lists');
      }
    } catch (error) {
      console.error('Error fetching shopping lists:', error);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
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

  const handleDeleteList = async (listId: string) => {
    try {
      const response = await fetch(`/api/shopping-lists/${listId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setShoppingLists(prev => prev.filter(list => list.id !== listId));
        toast.success('Shopping list deleted successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete shopping list');
      }
    } catch (error) {
      console.error('Error deleting shopping list:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleViewList = (listId: string) => {
    router.push(`/shopping-lists/${listId}`);
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
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Your Shopping Lists
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your shopping lists and add ingredients from recipes
            </p>
          </div>
          
          <Button
            variant="primary"
            onClick={() => setIsCreating(true)}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New List
          </Button>
        </div>
      </div>

      {isCreating && (
        <Card className="mb-6">
          <CardBody>
            <div className="flex space-x-2">
              <Input
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name"
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
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
                onClick={() => {
                  setIsCreating(false);
                  setNewListName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <Card>
          <CardBody className="text-center py-12">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Oops, something went wrong
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button
              variant="primary"
              onClick={fetchShoppingLists}
            >
              Try Again
            </Button>
          </CardBody>
        </Card>
      ) : shoppingLists.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No shopping lists yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first shopping list to start adding ingredients from recipes
            </p>
            <Button
              variant="primary"
              onClick={() => setIsCreating(true)}
            >
              Create Shopping List
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shoppingLists.map((list) => (
            <Card key={list.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {list.name}
                  </h3>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewList(list.id)}
                      className="text-gray-500 hover:text-blue-500"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteList(list.id)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardBody>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  {list.itemCount} {list.itemCount === 1 ? 'item' : 'items'}
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Created: {new Date(list.createdAt).toLocaleDateString()}
                </div>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleViewList(list.id)}
                >
                  View List
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}