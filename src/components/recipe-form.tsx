'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardBody, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Plus, Trash2, Upload, X } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
}

interface Step {
  id: string;
  description: string;
  order: number;
}

interface RecipeFormData {
  title: string;
  description: string;
  imageUrl: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  category: string;
  tags: string[];
  ingredients: Ingredient[];
  steps: Step[];
}

interface RecipeFormProps {
  initialData?: Partial<RecipeFormData>;
  onSubmit: (data: RecipeFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  className?: string;
}

const categories = [
  'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Drink', 'Appetizer'
];

const difficulties = ['Easy', 'Medium', 'Hard'];

const commonTags = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Quick',
  'Healthy', 'Spicy', 'Sweet', 'Savory', 'Low-Carb'
];

export function RecipeForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isSubmitting = false,
  className = '' 
}: RecipeFormProps) {
  const [formData, setFormData] = useState<RecipeFormData>({
    title: '',
    description: '',
    imageUrl: '',
    prepTime: 0,
    cookTime: 0,
    servings: 0,
    difficulty: '',
    category: '',
    tags: [],
    ingredients: [],
    steps: [],
    ...initialData
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState(formData.imageUrl);

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        prepTime: 0,
        cookTime: 0,
        servings: 0,
        difficulty: '',
        category: '',
        tags: [],
        ingredients: [],
        steps: [],
        ...initialData
      });
      setImageUrlInput(initialData.imageUrl || '');
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (formData.prepTime <= 0) {
      newErrors.prepTime = 'Prep time must be greater than 0';
    }

    if (formData.cookTime <= 0) {
      newErrors.cookTime = 'Cook time must be greater than 0';
    }

    if (formData.servings <= 0) {
      newErrors.servings = 'Servings must be greater than 0';
    }

    if (!formData.difficulty) {
      newErrors.difficulty = 'Difficulty is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.ingredients.length === 0) {
      newErrors.ingredients = 'At least one ingredient is required';
    } else {
      const emptyIngredients = formData.ingredients.filter(ing => !ing.name.trim());
      if (emptyIngredients.length > 0) {
        newErrors.ingredients = 'All ingredients must have a name';
      }
    }

    if (formData.steps.length === 0) {
      newErrors.steps = 'At least one step is required';
    } else {
      const emptySteps = formData.steps.filter(step => !step.description.trim());
      if (emptySteps.length > 0) {
        newErrors.steps = 'All steps must have a description';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof RecipeFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: '',
      amount: '',
      unit: '',
    };
    handleInputChange('ingredients', [...formData.ingredients, newIngredient]);
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string) => {
    const updatedIngredients = formData.ingredients.map(ing =>
      ing.id === id ? { ...ing, [field]: value } : ing
    );
    handleInputChange('ingredients', updatedIngredients);
  };

  const removeIngredient = (id: string) => {
    const updatedIngredients = formData.ingredients.filter(ing => ing.id !== id);
    handleInputChange('ingredients', updatedIngredients);
  };

  const addStep = () => {
    const newStep: Step = {
      id: Date.now().toString(),
      description: '',
      order: formData.steps.length + 1,
    };
    handleInputChange('steps', [...formData.steps, newStep]);
  };

  const updateStep = (id: string, description: string) => {
    const updatedSteps = formData.steps.map(step =>
      step.id === id ? { ...step, description } : step
    );
    handleInputChange('steps', updatedSteps);
  };

  const removeStep = (id: string) => {
    const updatedSteps = formData.steps.filter(step => step.id !== id);
    // Reorder steps
    const reorderedSteps = updatedSteps.map((step, index) => ({
      ...step,
      order: index + 1
    }));
    handleInputChange('steps', reorderedSteps);
  };

  const moveStep = (id: string, direction: 'up' | 'down') => {
    const stepIndex = formData.steps.findIndex(step => step.id === id);
    if (
      (direction === 'up' && stepIndex === 0) ||
      (direction === 'down' && stepIndex === formData.steps.length - 1)
    ) {
      return;
    }

    const newSteps = [...formData.steps];
    const targetIndex = direction === 'up' ? stepIndex - 1 : stepIndex + 1;
    
    // Swap steps
    [newSteps[stepIndex], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[stepIndex]];
    
    // Update order
    const reorderedSteps = newSteps.map((step, index) => ({
      ...step,
      order: index + 1
    }));
    
    handleInputChange('steps', reorderedSteps);
  };

  const toggleTag = (tag: string) => {
    const currentTags = formData.tags;
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    handleInputChange('tags', newTags);
  };

  const handleImageUpload = () => {
    handleInputChange('imageUrl', imageUrlInput);
    setShowImageModal(false);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {initialData ? 'Edit Recipe' : 'Create New Recipe'}
          </h2>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardBody className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Recipe title"
                  error={errors.title}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Prep Time (minutes) *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.prepTime || ''}
                  onChange={(e) => handleInputChange('prepTime', parseInt(e.target.value) || 0)}
                  placeholder="Preparation time"
                  error={errors.prepTime}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cook Time (minutes) *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.cookTime || ''}
                  onChange={(e) => handleInputChange('cookTime', parseInt(e.target.value) || 0)}
                  placeholder="Cooking time"
                  error={errors.cookTime}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Servings *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.servings || ''}
                  onChange={(e) => handleInputChange('servings', parseInt(e.target.value) || 0)}
                  placeholder="Number of servings"
                  error={errors.servings}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Difficulty *
                </label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => handleInputChange('difficulty', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                >
                  <option value="">Select difficulty</option>
                  {difficulties.map((difficulty) => (
                    <option key={difficulty} value={difficulty}>
                      {difficulty}
                    </option>
                  ))}
                </select>
                {errors.difficulty && (
                  <p className="mt-1 text-sm text-red-600">{errors.difficulty}</p>
                )}
              </div>
            </div>
            
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your recipe"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description}</p>
              )}
            </div>
            
            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Recipe Image
              </label>
              <div className="flex items-center space-x-4">
                {formData.imageUrl ? (
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                    <Image
                      src={formData.imageUrl}
                      alt="Recipe preview"
                      width={128}
                      height={128}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleInputChange('imageUrl', '')}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <Upload className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShowImageModal(true)}
                >
                  {formData.imageUrl ? 'Change Image' : 'Add Image'}
                </Button>
              </div>
            </div>
            
            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {commonTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      formData.tags.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Ingredients */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Ingredients *
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addIngredient}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Ingredient
                </Button>
              </div>
              
              {errors.ingredients && (
                <p className="mb-2 text-sm text-red-600">{errors.ingredients}</p>
              )}
              
              <div className="space-y-3">
                <AnimatePresence>
                  {formData.ingredients.map((ingredient, index) => (
                    <motion.div
                      key={ingredient.id}
                      className="grid grid-cols-12 gap-2 items-center"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="col-span-5">
                        <Input
                          value={ingredient.name}
                          onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                          placeholder="Ingredient name"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          value={ingredient.amount}
                          onChange={(e) => updateIngredient(ingredient.id, 'amount', e.target.value)}
                          placeholder="Amount"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          value={ingredient.unit}
                          onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                          placeholder="Unit"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeIngredient(ingredient.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {formData.ingredients.length === 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    No ingredients added yet. Click &quot;Add Ingredient&quot; to get started.
                  </div>
                )}
              </div>
            </div>
            
            {/* Steps */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Instructions *
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={addStep}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Step
                </Button>
              </div>
              
              {errors.steps && (
                <p className="mb-2 text-sm text-red-600">{errors.steps}</p>
              )}
              
              <div className="space-y-3">
                <AnimatePresence>
                  {formData.steps.map((step, index) => (
                    <motion.div
                      key={step.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 font-medium mr-3">
                          {index + 1}
                        </div>
                        
                        <div className="flex-1">
                          <textarea
                            value={step.description}
                            onChange={(e) => updateStep(step.id, e.target.value)}
                            placeholder="Describe this step"
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                          />
                        </div>
                        
                        <div className="flex flex-col space-y-1 ml-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(step.id, 'up')}
                            disabled={index === 0}
                            className="p-1"
                          >
                            ↑
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => moveStep(step.id, 'down')}
                            disabled={index === formData.steps.length - 1}
                            className="p-1"
                          >
                            ↓
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeStep(step.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {formData.steps.length === 0 && (
                  <div className="text-center py-4 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    No steps added yet. Click &quot;Add Step&quot; to get started.
                  </div>
                )}
              </div>
            </div>
          </CardBody>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (initialData ? 'Update Recipe' : 'Create Recipe')}
            </Button>
          </CardFooter>
        </form>
      </Card>
      
      {/* Image URL Modal */}
      <Modal
        isOpen={showImageModal}
        onClose={() => setShowImageModal(false)}
        title="Add Recipe Image"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Enter the URL of an image for your recipe:
          </p>
          
          <Input
            value={imageUrlInput}
            onChange={(e) => setImageUrlInput(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
          
          {imageUrlInput && (
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview:
              </p>
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <Image
                  src={imageUrlInput}
                  alt="Preview"
                  width={400}
                  height={192}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '';
                    e.currentTarget.alt = 'Invalid image URL';
                  }}
                />
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 mt-6">
            <Button
              variant="secondary"
              onClick={() => setShowImageModal(false)}
            >
              Cancel
            </Button>
            
            <Button
              variant="primary"
              onClick={handleImageUpload}
              disabled={!imageUrlInput.trim()}
            >
              Add Image
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}