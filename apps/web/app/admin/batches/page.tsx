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

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

interface Level {
  id: number;
  name: string;
  passingPercent: number;
}

interface Teacher {
  id: number;
  name: string;
  user: {
    name: string;
  };
}

interface Batch {
  id: number;
  name: string;
  levelId: number;
  level: Level;
  teacherId: number;
  teacher: Teacher;
  dayMask: string;
  timeSlot: string;
  capacity: number;
  currentStudents: number;
}

interface BatchFormData {
  name: string;
  levelId: number | null;
  teacherId: number | null;
  dayMask: number;
  timeSlot: string;
  capacity: number;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function BatchesPage() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<BatchFormData>({
    name: '',
    levelId: null,
    teacherId: null,
    dayMask: 0,
    timeSlot: '',
    capacity: 30,
  });
  const [selectedDays, setSelectedDays] = useState<number[]>([]);

  const queryClient = useQueryClient();

  const { data: batches, isLoading: loadingBatches, error: batchesError } = useQuery<Batch[], Error>({
    queryKey: ['batches', selectedLevel],
    queryFn: async () => {
      const response = await axiosInstance.get<Batch[]>(`/batches${selectedLevel ? `?levelId=${selectedLevel}` : ''}`);
      return response.data;
    },
  });

  const { data: levels, isLoading: loadingLevels } = useQuery<Level[], Error>({
    queryKey: ['levels'],
    queryFn: async () => {
      const response = await axiosInstance.get<Level[]>('/levels');
      return response.data;
    },
  });

  const { data: teachers } = useQuery<Teacher[], Error>({
    queryKey: ['teachers'],
    queryFn: async () => {
      const response = await axiosInstance.get<Teacher[]>('/users?role=TEACHER');
      return response.data;
    },
  });

  const createBatchMutation = useMutation({
    mutationFn: async (data: BatchFormData) => {
      const response = await axiosInstance.post<ApiResponse<Batch>>('/batches', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast.success('Batch created successfully');
      resetForm();
      setIsFormOpen(false);
    },
    onError: () => {
      toast.error('Failed to create batch');
    },
  });

  const toggleDay = (dayIndex: number) => {
    const newDays = selectedDays.includes(dayIndex)
      ? selectedDays.filter(d => d !== dayIndex)
      : [...selectedDays, dayIndex];
    setSelectedDays(newDays);
    
    // Calculate bitmask
    const dayMask = newDays.reduce((mask, day) => mask | (1 << day), 0);
    setFormData({ ...formData, dayMask });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.levelId || !formData.teacherId) {
      toast.error('Please select both level and teacher');
      return;
    }
    createBatchMutation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      levelId: null,
      teacherId: null,
      dayMask: 0,
      timeSlot: '',
      capacity: 30,
    });
    setSelectedDays([]);
  };

  if (loadingBatches || loadingLevels) {
    return <div className="flex justify-center p-8"><CircularProgress /></div>;
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Batches</CardTitle>
          <Button onClick={() => setIsFormOpen(!isFormOpen)}>
            {isFormOpen ? 'Cancel' : 'Create New Batch'}
          </Button>
        </CardHeader>
        <CardContent>
          {/* Create Form */}
          {isFormOpen && (
            <Card className="mb-6">
              <CardContent className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Batch Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                        title="Batch Name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Level *</label>
                      <select
                        value={formData.levelId || ''}
                        onChange={(e) => setFormData({ ...formData, levelId: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                        title="Select Level"
                      >
                        <option value="">Select Level</option>
                        {levels?.map((level: Level) => (
                          <option key={level.id} value={level.id}>{level.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Teacher *</label>
                      <select
                        value={formData.teacherId || ''}
                        onChange={(e) => setFormData({ ...formData, teacherId: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                        title="Select Teacher"
                      >
                        <option value="">Select Teacher</option>
                        {teachers?.map((teacher: Teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.user?.name || 'Unknown'}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Time Slot *</label>
                      <input
                        type="text"
                        value={formData.timeSlot}
                        onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="e.g., 10:00 AM - 11:00 AM"
                        required
                        title="Time Slot"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Capacity</label>
                      <input
                        type="number"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                        className="w-full px-3 py-2 border rounded-md"
                        min="1"
                        max="100"
                        title="Capacity"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Days *</label>
                      <div className="flex gap-2">
                        {DAYS.map((day, index) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(index)}
                            className={`px-3 py-1 rounded text-sm ${
                              selectedDays.includes(index)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button type="submit" disabled={createBatchMutation.isPending} className="w-full">
                    {createBatchMutation.isPending ? 'Creating...' : 'Create Batch'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Level Filter */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Filter by Level</label>
            <select
              className="w-full md:w-64 px-4 py-2 border rounded-lg"
              value={selectedLevel || ''}
              onChange={(e) => setSelectedLevel(e.target.value ? Number(e.target.value) : null)}
              title="Filter by Level"
            >
              <option value="">All Levels</option>
              {levels?.map((level: Level) => (
                <option key={level.id} value={level.id}>
                  {level.name}
                </option>
              ))}
            </select>
          </div>

          {/* Batches Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {batches?.map((batch: Batch) => (
              <Card key={batch.id}>
                <CardContent className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{batch.name}</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Level:</span> {batch.level.name}
                    </p>
                    <p>
                      <span className="font-medium">Teacher:</span> {batch.teacher?.user?.name || 'Not Assigned'}
                    </p>
                    <p>
                      <span className="font-medium">Time:</span> {batch.timeSlot}
                    </p>
                    <p>
                      <span className="font-medium">Students:</span>{' '}
                      {batch.currentStudents || 0}/{batch.capacity}
                    </p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Students
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {(!batches || batches.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              No batches found. Create a new batch to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}