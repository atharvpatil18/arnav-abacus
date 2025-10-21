'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';

interface Level {
  id: number;
  name: string;
}

interface Teacher {
  id: number;
  name: string;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export default function CreateBatchPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    levelId: '',
    teacherId: '',
    dayMask: '',
    timeSlot: '',
    capacity: 20,
  });

  const [selectedDays, setSelectedDays] = useState({
    Sun: false,
    Mon: false,
    Tue: false,
    Wed: false,
    Thu: false,
    Fri: false,
    Sat: false,
  });

  // Fetch levels for dropdown
  const { data: levelsData } = useQuery<ApiResponse<Level[]>>({
    queryKey: ['levels'],
    queryFn: async (): Promise<ApiResponse<Level[]>> => {
      const { data } = await apiClient.get<ApiResponse<Level[]>>('/levels');
      return data;
    },
  });

  // Fetch teachers for dropdown
  const { data: teachersData } = useQuery<ApiResponse<Teacher[]>>({
    queryKey: ['teachers'],
    queryFn: async (): Promise<ApiResponse<Teacher[]>> => {
      const { data } = await apiClient.get<ApiResponse<Teacher[]>>('/users?role=TEACHER');
      return data;
    },
  });

  const levels: Level[] = Array.isArray(levelsData?.data) ? levelsData.data : [];
  const teachers: Teacher[] = Array.isArray(teachersData?.data) ? teachersData.data : [];

  const createMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      levelId: number;
      teacherId: number;
      dayMask: string;
      timeSlot: string;
      capacity: number;
    }) => {
      return apiClient.post('/batches', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      router.push('/admin/batches');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate dayMask from selected days (SMTWTFS format)
    const dayMask = [
      selectedDays.Sun ? 'S' : '-',
      selectedDays.Mon ? 'M' : '-',
      selectedDays.Tue ? 'T' : '-',
      selectedDays.Wed ? 'W' : '-',
      selectedDays.Thu ? 'T' : '-',
      selectedDays.Fri ? 'F' : '-',
      selectedDays.Sat ? 'S' : '-',
    ].join('');

    createMutation.mutate({
      ...formData,
      dayMask,
      levelId: Number(formData.levelId),
      teacherId: Number(formData.teacherId),
      capacity: Number(formData.capacity),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day: keyof typeof selectedDays) => {
    setSelectedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Create New Batch
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          {/* Basic Information */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-100">
              Batch Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Morning Advanced Group"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Level <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="levelId"
                    required
                    value={formData.levelId}
                    onChange={handleChange}
                    aria-label="Select Level"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Level</option>
                    {levels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teacher <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="teacherId"
                    required
                    value={formData.teacherId}
                    onChange={handleChange}
                    aria-label="Select Teacher"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Teacher</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-blue-100">
              Schedule
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Days of Week <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(selectedDays).map(([day, selected]) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day as keyof typeof selectedDays)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selected
                          ? 'bg-blue-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Slot <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="timeSlot"
                    required
                    value={formData.timeSlot}
                    onChange={handleChange}
                    placeholder="e.g., 10:00 AM - 11:30 AM"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Capacity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    required
                    min="1"
                    value={formData.capacity}
                    onChange={handleChange}
                    aria-label="Batch Capacity"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 hover:from-blue-600 hover:to-cyan-600"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Create Batch
                </>
              )}
            </Button>
          </div>

          {createMutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              Error creating batch. Please try again.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
