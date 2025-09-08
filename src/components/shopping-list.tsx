import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Toggle } from '@/components/ui/toggle';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

interface ShoppingListItem {
  id: string;
  name: string;
  amount?: string;
  unit?: string;
  completed: boolean;
}

interface ShoppingListProps {
  id: string;
  name: string;
  items: ShoppingListItem[];
  onUpdate: (id: string, updates: Partial<ShoppingListProps>) => void;
  onDelete: (id: string) => void;
  className?: string;
}

export function ShoppingList({ 
  id, 
  name, 
  items, 
  onUpdate, 
  onDelete,
  className = '' 
}: ShoppingListProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(name);
  const [newItemName, setNewItemName] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('');

  const handleSaveName = () => {
    onUpdate(id, { name: newName });
    setIsEditing(false);
  };

  const handleAddItem = () => {
    if (!newItemName.trim()) return;

    const newItem: ShoppingListItem = {
      id: Date.now().toString(),
      name: newItemName,
      amount: newItemAmount || undefined,
      unit: newItemUnit || undefined,
      completed: false,
    };

    onUpdate(id, { items: [...items, newItem] });
    
    // Reset form
    setNewItemName('');
    setNewItemAmount('');
    setNewItemUnit('');
  };

  const handleToggleItem = (itemId: string) => {
    const updatedItems = items.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    onUpdate(id, { items: updatedItems });
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    onUpdate(id, { items: updatedItems });
  };

  const completedItems = items.filter(item => item.completed);
  const pendingItems = items.filter(item => !item.completed);

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex justify-between items-center">
          {isEditing ? (
            <div className="flex items-center space-x-2 w-full">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="flex-1"
              />
              <Button variant="primary" size="sm" onClick={handleSaveName}>
                Save
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex justify-between items-center w-full">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {name}
              </h3>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardBody>
        {/* Add new item form */}
        <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <Input
              placeholder="Item name"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="md:col-span-2"
            />
            <Input
              placeholder="Amount"
              value={newItemAmount}
              onChange={(e) => setNewItemAmount(e.target.value)}
            />
            <Input
              placeholder="Unit"
              value={newItemUnit}
              onChange={(e) => setNewItemUnit(e.target.value)}
            />
          </div>
          <div className="mt-2 flex justify-end">
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddItem}
              disabled={!newItemName.trim()}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>
        </div>
        
        {/* Pending items */}
        {pendingItems.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              To Buy ({pendingItems.length})
            </h4>
            <div className="space-y-2">
              <AnimatePresence>
                {pendingItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggleItem(item.id)}
                        className="text-gray-400 hover:text-green-500"
                      >
                        <Circle className="h-5 w-5" />
                      </button>
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {item.name}
                        </span>
                        {item.amount && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                            {item.amount} {item.unit}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
        
        {/* Completed items */}
        {completedItems.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Completed ({completedItems.length})
            </h4>
            <div className="space-y-2">
              <AnimatePresence>
                {completedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 opacity-70"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => handleToggleItem(item.id)}
                        className="text-green-500 hover:text-gray-400"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300 line-through">
                          {item.name}
                        </span>
                        {item.amount && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2 line-through">
                            {item.amount} {item.unit}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
        
        {items.length === 0 && (
          <div className="text-center py-4 text-gray-500 dark:text-gray-400">
            No items in this shopping list. Add some items above.
          </div>
        )}
      </CardBody>
    </Card>
  );
}