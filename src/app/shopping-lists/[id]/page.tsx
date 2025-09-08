'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Trash2, Check, ShoppingBag, ChefHat, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface ShoppingListItem {
  id: string;
  name: string;
  quantity: string;
  completed: boolean;
}

interface ShoppingList {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  items: ShoppingListItem[];
}

export default function ShoppingListDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const listId = params.id as string;
  
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [listName, setListName] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);

  const fetchShoppingList = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/shopping-lists/${listId}`);
      
      if (response.ok) {
        const data = await response.json();
        setShoppingList(data);
        setListName(data.name);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch shopping list');
        toast.error(errorData.message || 'Failed to fetch shopping list');
      }
    } catch (error) {
      console.error('Error fetching shopping list:', error);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateListName = async () => {
    if (!listName.trim()) {
      toast.error('Please enter a list name');
      return;
    }
    
    try {
      const response = await fetch(`/api/shopping-lists/${listId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: listName }),
      });
      
      if (response.ok) {
        setIsEditing(false);
        toast.success('List name updated successfully');
        fetchShoppingList(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update list name');
      }
    } catch (error) {
      console.error('Error updating list name:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }
    
    try {
      const response = await fetch(`/api/shopping-lists/${listId}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: newItemName,
          quantity: newItemQuantity || '1'
        }),
      });
      
      if (response.ok) {
        setNewItemName('');
        setNewItemQuantity('');
        setIsAddingItem(false);
        toast.success('Item added successfully');
        fetchShoppingList(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add item');
      }
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleToggleItem = async (itemId: string, completed: boolean) => {
    try {
      const response = await fetch(`/api/shopping-lists/${listId}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !completed }),
      });
      
      if (response.ok) {
        fetchShoppingList(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update item');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/shopping-lists/${listId}/items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast.success('Item deleted successfully');
        fetchShoppingList(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleAddIngredientsFromRecipe = () => {
    // This would open a modal or navigate to a recipe selection page
    toast.info('This feature will be available soon');
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
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          {isEditing ? (
            <div className="flex-1 flex space-x-2">
              <Input
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="primary"
                onClick={handleUpdateListName}
                disabled={!listName.trim()}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditing(false);
                  setListName(shoppingList?.name || '');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                  {shoppingList?.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {shoppingList?.items.length} {shoppingList?.items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => setIsEditing(true)}
              >
                Edit Name
              </Button>
            </div>
          )}
        </div>
        
        <div className="flex space-x-3 mb-6">
          <Button
            variant="secondary"
            onClick={handleAddIngredientsFromRecipe}
            className="flex items-center"
          >
            <ChefHat className="h-4 w-4 mr-2" />
            Add from Recipe
          </Button>
          
          <Button
            variant="primary"
            onClick={() => setIsAddingItem(true)}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {isAddingItem && (
        <Card className="mb-6">
          <CardBody>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Input
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Item name"
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              />
              <Input
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                placeholder="Quantity"
                className="w-24"
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              />
              <Button
                variant="primary"
                onClick={handleAddItem}
                disabled={!newItemName.trim()}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddingItem(false);
                  setNewItemName('');
                  setNewItemQuantity('');
                }}
              >
                <X className="h-4 w-4" />
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
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Oops, something went wrong
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button
              variant="primary"
              onClick={fetchShoppingList}
            >
              Try Again
            </Button>
          </CardBody>
        </Card>
      ) : !shoppingList ? (
        <Card>
          <CardBody className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Shopping list not found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The shopping list you&apos;re looking for doesn&apos;t exist
            </p>
            <Button
              variant="primary"
              onClick={() => router.push('/shopping-lists')}
            >
              Back to Shopping Lists
            </Button>
          </CardBody>
        </Card>
      ) : shoppingList.items.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No items in this list
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Add items to your shopping list to get started
            </p>
            <Button
              variant="primary"
              onClick={() => setIsAddingItem(true)}
            >
              Add First Item
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-3">
          {shoppingList.items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardBody className="p-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggleItem(item.id, item.completed)}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className={`ml-3 flex-1 ${item.completed ? 'line-through text-gray-500' : ''}`}>
                    <div className="flex justify-between">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-sm text-gray-500">{item.quantity}</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteItem(item.id)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}