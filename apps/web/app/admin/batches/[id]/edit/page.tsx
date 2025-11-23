'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { axiosInstance } from '@/lib/axios';

interface Level {
  id: number;
  name: string;
  description?: string;
}

interface Teacher {
  id: number;
  userId: number;
  user: {
    name: string;
    email: string;
  };
}

interface Batch {
  id: number;
  name: string;
  levelId: number;
  teacherId?: number;
  timeSlot: string;
  capacity?: number;
  level: {
    id: number;
    name: string;
  };
  teacher?: {
    id: number;
    user: {
      name: string;
    };
  };
}

interface UpdateBatchDto {
  name?: string;
  levelId?: number;
  teacherId?: number;
  timeSlot?: string;
  capacity?: number;
}

export default function EditBatchPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const batchId = parseInt(resolvedParams.id);

  const [formData, setFormData] = useState<UpdateBatchDto>({
    name: '',
    levelId: 0,
    teacherId: undefined,
    timeSlot: '',
    capacity: undefined,
  });

  const { data: batch, isLoading: loadingBatch } = useQuery<Batch>({
    queryKey: ['batch', batchId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/batches/${batchId}`);
      return response.data as Batch;
    },
  });

  const { data: levels, isLoading: loadingLevels } = useQuery<Level[]>({
    queryKey: ['levels'],
    queryFn: async () => {
      const response = await axiosInstance.get('/levels');
      return response.data as Level[];
    },
  });

  const { data: teachers, isLoading: loadingTeachers } = useQuery<Teacher[]>({
    queryKey: ['teachers'],
    queryFn: async () => {
      const response = await axiosInstance.get('/users/teachers');
      return response.data as Teacher[];
    },
  });

  useEffect(() => {
    if (batch) {
      setFormData({
        name: batch.name,
        levelId: batch.levelId,
        teacherId: batch.teacherId,
        timeSlot: batch.timeSlot,
        capacity: batch.capacity,
      });
    }
  }, [batch]);

  const updateMutation = useMutation({
    mutationFn: async (data: UpdateBatchDto) => {
      await axiosInstance.patch(`/batches/${batchId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch', batchId] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      alert('Batch updated successfully!');
      router.push(`/admin/batches/${batchId}`);
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } }; message?: string };
      alert(`Failed to update batch: ${err.response?.data?.message || err.message || 'Unknown error'}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.levelId || !formData.timeSlot) {
      alert('Please fill in all required fields');
      return;
    }

    updateMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' || name === 'levelId' || name === 'teacherId'
        ? value ? parseInt(value) : undefined
        : value
    }));
  };

  if (loadingBatch || loadingLevels || loadingTeachers) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <h3 className="text-red-800 font-semibold mb-2">⚠️ Batch Not Found</h3>
            <Button onClick={() => router.push('/admin/batches')}>Back to Batches</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Edit Batch: {batch.name}</CardTitle>
            <Button variant="outline" onClick={() => router.push(`/admin/batches/${batchId}`)}>
              Cancel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Batch Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Batch Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Level Selection */}
            <div>
              <label htmlFor="levelId" className="block text-sm font-medium mb-2">
                Level <span className="text-red-500">*</span>
              </label>
              <select
                id="levelId"
                name="levelId"
                value={formData.levelId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Level</option>
                {levels?.map(level => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Teacher Selection */}
            <div>
              <label htmlFor="teacherId" className="block text-sm font-medium mb-2">
                Teacher
              </label>
              <select
                id="teacherId"
                name="teacherId"
                value={formData.teacherId || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Not Assigned</option>
                {teachers?.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.user.name} ({teacher.user.email})
                  </option>
                ))}
              </select>
            </div>

            {/* Time Slot */}
            <div>
              <label htmlFor="timeSlot" className="block text-sm font-medium mb-2">
                Time Slot <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="timeSlot"
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleChange}
                placeholder="e.g., Mon/Wed 4:00 PM - 5:30 PM"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Example formats: &ldquo;Mon/Wed 4:00 PM - 5:30 PM&rdquo; or &ldquo;Tuesday 3:00-4:30 PM&rdquo;
              </p>
            </div>

            {/* Capacity */}
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium mb-2">
                Maximum Capacity
              </label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity || ''}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="Leave empty for unlimited"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1"
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Batch'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/batches/${batchId}`)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
