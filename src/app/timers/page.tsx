'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Timer as TimerIcon, Plus, Trash2, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface SavedTimer {
  id: string;
  name: string;
  minutes: number;
  seconds: number;
  createdAt: string;
}

export default function TimersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [savedTimers, setSavedTimers] = useState<SavedTimer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTimerName, setNewTimerName] = useState('');
  const [newTimerMinutes, setNewTimerMinutes] = useState('5');
  const [newTimerSeconds, setNewTimerSeconds] = useState('0');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
      return;
    }
    
    if (status === 'authenticated') {
      fetchSavedTimers();
    }
  }, [status, router]);

  const fetchSavedTimers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/timers');
      
      if (response.ok) {
        const data = await response.json();
        setSavedTimers(data || []);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch timers');
        toast.error(errorData.message || 'Failed to fetch timers');
      }
    } catch (error) {
      console.error('Error fetching timers:', error);
      setError('An unexpected error occurred');
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTimer = async () => {
    if (!newTimerName.trim()) {
      toast.error('Please enter a timer name');
      return;
    }
    
    const minutes = parseInt(newTimerMinutes) || 0;
    const seconds = parseInt(newTimerSeconds) || 0;
    
    if (minutes < 0 || seconds < 0 || seconds >= 60) {
      toast.error('Please enter a valid time');
      return;
    }
    
    try {
      const response = await fetch('/api/timers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: newTimerName,
          minutes,
          seconds
        }),
      });
      
      if (response.ok) {
        const newTimer = await response.json();
        setSavedTimers(prev => [newTimer, ...prev]);
        setNewTimerName('');
        setNewTimerMinutes('5');
        setNewTimerSeconds('0');
        setIsCreating(false);
        toast.success('Timer created successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create timer');
      }
    } catch (error) {
      console.error('Error creating timer:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleDeleteTimer = async (timerId: string) => {
    try {
      const response = await fetch(`/api/timers/${timerId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setSavedTimers(prev => prev.filter(timer => timer.id !== timerId));
        toast.success('Timer deleted successfully');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete timer');
      }
    } catch (error) {
      console.error('Error deleting timer:', error);
      toast.error('An unexpected error occurred');
    }
  };

  const handleUseTimer = (timer: SavedTimer) => {
    // Navigate to a page with this timer pre-loaded
    router.push(`/recipes?timer=${timer.id}`);
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
              Your Cooking Timers
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Save and manage your custom cooking timers
            </p>
          </div>
          
          <Button
            variant="primary"
            onClick={() => setIsCreating(true)}
            className="flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Timer
          </Button>
        </div>
      </div>

      {isCreating && (
        <Card className="mb-6">
          <CardBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Timer Name
                </label>
                <Input
                  value={newTimerName}
                  onChange={(e) => setNewTimerName(e.target.value)}
                  placeholder="e.g., Pasta boiling time"
                  className="w-full"
                />
              </div>
              
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Minutes
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={newTimerMinutes}
                    onChange={(e) => setNewTimerMinutes(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Seconds
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={newTimerSeconds}
                    onChange={(e) => setNewTimerSeconds(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="primary"
                  onClick={handleCreateTimer}
                  disabled={!newTimerName.trim()}
                >
                  Create Timer
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsCreating(false);
                    setNewTimerName('');
                    setNewTimerMinutes('5');
                    setNewTimerSeconds('0');
                  }}
                >
                  Cancel
                </Button>
              </div>
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
            <TimerIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Oops, something went wrong
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {error}
            </p>
            <Button
              variant="primary"
              onClick={fetchSavedTimers}
            >
              Try Again
            </Button>
          </CardBody>
        </Card>
      ) : savedTimers.length === 0 ? (
        <Card>
          <CardBody className="text-center py-12">
            <TimerIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No saved timers yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first custom timer to use while cooking
            </p>
            <Button
              variant="primary"
              onClick={() => setIsCreating(true)}
            >
              Create Timer
            </Button>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedTimers.map((timer) => (
            <Card key={timer.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                    {timer.name}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTimer(timer.id)}
                    className="text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardBody>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-4">
                  <Clock className="h-4 w-4 mr-1" />
                  {timer.minutes.toString().padStart(2, '0')}:{timer.seconds.toString().padStart(2, '0')}
                </div>
                
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                  Created: {new Date(timer.createdAt).toLocaleDateString()}
                </div>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleUseTimer(timer)}
                >
                  Use Timer
                </Button>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}