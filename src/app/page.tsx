import { redirect } from 'next/navigation';
import Navigation from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { ChefHat, Clock, Heart, ShoppingCart, Star } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  // For demo purposes, redirect to recipes page
  // In a real app, this would show a landing page
  redirect('/recipes');
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 mb-12 text-white">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Discover, Save, and Cook Delicious Recipes
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Your personal recipe finder with shopping lists, timers, and favorites
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/recipes">
                <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                  Browse Recipes
                </Button>
              </Link>
              <Link href="/recipes/create">
                <Button variant="outline" size="lg" className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100">
                  Create Recipe
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Features Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Everything You Need for Cooking
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="mx-auto bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <ChefHat className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Recipe Collection
                </h3>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600 dark:text-gray-400">
                  Browse thousands of recipes or create your own with our easy-to-use interface.
                </p>
              </CardBody>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="mx-auto bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Shopping Lists
                </h3>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600 dark:text-gray-400">
                  Automatically generate shopping lists from recipes and manage them all in one place.
                </p>
              </CardBody>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="mx-auto bg-yellow-100 dark:bg-yellow-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Cooking Timers
                </h3>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600 dark:text-gray-400">
                  Set multiple timers for different cooking steps with notifications.
                </p>
              </CardBody>
            </Card>
            
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="mx-auto bg-red-100 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Save Favorites
                </h3>
              </CardHeader>
              <CardBody>
                <p className="text-gray-600 dark:text-gray-400">
                  Save your favorite recipes to quickly access them later.
                </p>
              </CardBody>
            </Card>
          </div>
        </div>
        
        {/* Testimonials Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            What Our Users Say
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                  "Recipe Finder has completely transformed how I plan meals. The shopping list feature saves me so much time!"
                </p>
                <p className="font-medium text-gray-900 dark:text-white">- Sarah M.</p>
              </CardBody>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                  "As a busy parent, the timer feature is a lifesaver. I can set multiple timers and never burn dinner again!"
                </p>
                <p className="font-medium text-gray-900 dark:text-white">- Michael T.</p>
              </CardBody>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                  "I love being able to save my family's favorite recipes. The interface is so intuitive and easy to use."
                </p>
                <p className="font-medium text-gray-900 dark:text-white">- Jennifer L.</p>
              </CardBody>
            </Card>
          </div>
        </div>
        
        {/* CTA Section */}
        <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Start Cooking?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of home cooks who are already using Recipe Finder to make meal planning easier.
          </p>
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/auth/register">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Sign Up for Free
              </Button>
            </Link>
            <Link href="/recipes">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Browse Recipes
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}