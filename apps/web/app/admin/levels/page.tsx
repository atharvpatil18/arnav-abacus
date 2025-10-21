'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axios';
import { Plus, Edit, X, Trophy } from 'lucide-react';

interface Level {
  id: number;
  name: string;
  passingPercent: number;
  description: string;
}

interface LevelFormData {
  name: string;
  description: string;
}

export default function LevelsPage() {
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [formData, setFormData] = useState<LevelFormData>({
    name: '',
    description: '',
  });

  const queryClient = useQueryClient();

  const { data: levels, isLoading, error } = useQuery<Level[], Error>({
    queryKey: ['levels'],
    queryFn: async () => {
      try {
        const response = await axiosInstance.get('/levels');
        // Handle both direct array and wrapped response
        const data = response.data;
        if (Array.isArray(data)) {
          return data;
        } else if (data && Array.isArray(data.data)) {
          return data.data;
        }
        console.error('Unexpected levels response format:', data);
        return [];
      } catch (error) {
        console.error('Error fetching levels:', error);
        throw error;
      }
    },
  });

  const mutation = useMutation<Level, Error, LevelFormData>({
    mutationFn: async (data: LevelFormData) => {
      if (isEditMode && editingLevel) {
        const response = await axiosInstance.put<Level>(`/levels/${editingLevel.id}`, data);
        return response.data;
      }
      const response = await axiosInstance.post<Level>('/levels', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      toast.success(`Level ${isEditMode ? 'updated' : 'created'} successfully`);
      resetForm();
    },
    onError: () => {
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} level`);
    },
  });

  const openCreateModal = () => {
    setIsEditMode(false);
    setEditingLevel(null);
    setFormData({
      name: '',
      description: '',
    });
    setShowModal(true);
  };

  const openEditModal = (level: Level) => {
    setIsEditMode(true);
    setEditingLevel(level);
    setFormData({
      name: level.name,
      description: level.description,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const resetForm = () => {
    setShowModal(false);
    setIsEditMode(false);
    setEditingLevel(null);
    setFormData({
      name: '',
      description: '',
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><CircularProgress /></div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <h3 className="text-red-800 font-semibold mb-2">⚠️ Error Loading Levels</h3>
            <p className="text-red-600 mb-4">{error.message || 'Failed to load levels data'}</p>
            <Button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700">
              Reload Page
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ensure levels is an array
  const safeLevels = Array.isArray(levels) ? levels : [];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Abacus Levels
          </h1>
          <p className="text-gray-600 mt-2">Manage learning levels and their requirements</p>
        </div>
        <Button
          onClick={openCreateModal}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Level
        </Button>
      </div>

      {/* Levels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {safeLevels.map((level: Level) => (
          <Card
            key={level.id}
            className="overflow-hidden hover:shadow-xl transition-shadow duration-200"
          >
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-6 text-white">
              <div className="flex items-center justify-between mb-3">
                <div className="bg-white/20 p-3 rounded-full">
                  <Trophy className="w-6 h-6" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(level)}
                  className="text-white hover:bg-white/20"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              </div>
              <h3 className="text-2xl font-bold">{level.name}</h3>
            </div>
            <CardContent className="p-6">
              <p className="text-gray-700 leading-relaxed">
                {level.description || 'No description provided'}
              </p>
            </CardContent>
          </Card>
        ))}

        {safeLevels.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">No levels created yet</p>
            <p className="text-gray-400 mt-2">Click &quot;Add Level&quot; to create your first level</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {isEditMode ? 'Edit Level' : 'Create New Level'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Level Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  placeholder="e.g., Beginner, Intermediate, Advanced"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe the level requirements and objectives..."
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  {mutation.isPending
                    ? 'Saving...'
                    : isEditMode
                    ? 'Update Level'
                    : 'Create Level'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}