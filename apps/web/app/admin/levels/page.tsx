'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axios';

interface Level {
  id: number;
  name: string;
  passingPercent: number;
  description: string;
}

interface LevelFormData {
  name: string;
  passingPercent: number;
  description: string;
}

export default function LevelsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [formData, setFormData] = useState<LevelFormData>({
    name: '',
    passingPercent: 75,
    description: '',
  });

  const queryClient = useQueryClient();

  const { data: levels, isLoading } = useQuery<Level[], Error>({
    queryKey: ['levels'],
    queryFn: async () => {
      const response = await axiosInstance.get<Level[]>('/levels');
      return response.data;
    },
  });

  const mutation = useMutation<Level, Error, LevelFormData>({
    mutationFn: async (data: LevelFormData) => {
      if (currentLevel) {
        const response = await axiosInstance.put<Level>(`/levels/${currentLevel.id}`, data);
        return response.data;
      }
      const response = await axiosInstance.post<Level>('/levels', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['levels'] });
      toast.success(`Level ${currentLevel ? 'updated' : 'created'} successfully`);
      resetForm();
    },
    onError: () => {
      toast.error(`Failed to ${currentLevel ? 'update' : 'create'} level`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleEdit = (level: Level) => {
    setCurrentLevel(level);
    setFormData({
      name: level.name,
      passingPercent: level.passingPercent,
      description: level.description,
    });
    setIsEditing(true);
  };

  const resetForm = () => {
    setCurrentLevel(null);
    setFormData({
      name: '',
      passingPercent: 75,
      description: '',
    });
    setIsEditing(false);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><CircularProgress /></div>;
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Levels List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Abacus Levels</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {levels?.map((level: Level) => (
                  <Card key={level.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">{level.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {level.description}
                          </p>
                          <p className="text-sm font-medium mt-2">
                            Passing: {level.passingPercent}%
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(level)}
                        >
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Form */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                {isEditing ? 'Edit Level' : 'Create New Level'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Level Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    required
                    aria-label="Level Name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Passing Percentage
                  </label>
                  <input
                    type="number"
                    value={formData.passingPercent}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        passingPercent: Number(e.target.value),
                      })
                    }
                    min="0"
                    max="100"
                    className="w-full px-3 py-2 border rounded-md"
                    required
                    aria-label="Passing Percentage"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-md"
                    rows={4}
                    aria-label="Level Description"
                  />
                </div>

                <div className="flex space-x-2">
                  <Button
                    type="submit"
                    disabled={mutation.isPending}
                    className="flex-1"
                  >
                    {mutation.isPending
                      ? 'Saving...'
                      : isEditing
                      ? 'Update Level'
                      : 'Create Level'}
                  </Button>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}