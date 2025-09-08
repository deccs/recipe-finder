'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Mail, Calendar, ChefHat, Heart, Settings, LogOut } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface UserSession {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    createdAt?: string;
  };
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession() as { data: UserSession | null, status: string, update: any };
  const router = useRouter();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userStats, setUserStats] = useState({
    recipesCount: 0,
    favoritesCount: 0,
  });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
    
    if (session?.user) {
      setFormData({
        name: session.user.name || '',
        email: session.user.email || '',
        bio: '',
      });
      
      // Fetch user stats
      fetchUserStats();
    }
  }, [session, status, router]);

  const fetchUserStats = async () => {
    if (!session?.user?.id) return;
    
    try {
      const [recipesResponse, favoritesResponse] = await Promise.all([
        fetch(`/api/recipes?authorId=${session.user.id}`),
        fetch(`/api/favorites?userId=${session.user.id}`)
      ]);
      
      if (recipesResponse.ok) {
        const recipes = await recipesResponse.json();
        setUserStats(prev => ({ ...prev, recipesCount: recipes.length || 0 }));
      }
      
      if (favoritesResponse.ok) {
        const favorites = await favoritesResponse.json();
        setUserStats(prev => ({ ...prev, favoritesCount: favorites.length || 0 }));
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Update the session
        await update({
          ...session,
          user: {
            ...session?.user,
            name: formData.name,
          }
        });
        
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', {
        method: 'POST',
      });
      
      // Redirect to home page after sign out
      router.push('/');
      toast.success('You have been signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('An unexpected error occurred');
    }
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

  if (!session) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Your Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account and view your activity
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Card and Stats */}
        <div className="space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Profile Information
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardBody>
              <div className="flex flex-col items-center mb-6">
                <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <User className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                
                {isEditing ? (
                  <div className="w-full space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name
                      </label>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email
                      </label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full"
                        disabled
                      />
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Email cannot be changed
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bio
                      </label>
                      <textarea
                        name="bio"
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell us about yourself..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                      />
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="primary"
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      
                      <Button
                        variant="secondary"
                        onClick={() => setIsEditing(false)}
                        disabled={isLoading}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                      {session.user?.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {session.user?.email}
                    </p>
                    
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="w-full"
                    >
                      Edit Profile
                    </Button>
                  </div>
                )}
              </div>
            </CardBody>
          </Card>
          
          {/* Stats Card */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Activity
              </h2>
            </CardHeader>
            
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ChefHat className="h-5 w-5 text-blue-500 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">Recipes Created</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {userStats.recipesCount}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">Favorites</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {userStats.favoritesCount}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-700 dark:text-gray-300">Member Since</span>
                  </div>
                  <span className="text-gray-700 dark:text-gray-300">
                    {session.user?.createdAt ? new Date(session.user.createdAt).toLocaleDateString() : 'Unknown'}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
          
          {/* Actions Card */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Account Actions
              </h2>
            </CardHeader>
            
            <CardBody>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  onClick={() => router.push('/recipes/create')}
                >
                  <ChefHat className="h-4 w-4 mr-2" />
                  Create New Recipe
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  onClick={() => router.push('/favorites')}
                >
                  <Heart className="h-4 w-4 mr-2" />
                  View Favorites
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full flex items-center justify-center"
                  onClick={() => router.push('/my-recipes')}
                >
                  <ChefHat className="h-4 w-4 mr-2" />
                  My Recipes
                </Button>
                
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-center text-red-500 hover:text-red-700"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
        
        {/* Right Column - Recent Activity */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h2>
            </CardHeader>
            
            <CardBody>
              <div className="space-y-4">
                {/* Placeholder for recent activity */}
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <Calendar className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    No recent activity
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Your recent activity will appear here
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}