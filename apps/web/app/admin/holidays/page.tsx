'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { axiosInstance } from '@/lib/axios';
import {
  Calendar,
  Plus,
  Edit,
  Trash2,
  Sun
} from 'lucide-react';

interface Holiday {
  id: number;
  name: string;
  date: string;
  description?: string;
  category: 'NATIONAL' | 'SCHOOL' | 'FESTIVAL';
  isRecurring: boolean;
}

interface CreateHolidayDto {
  name: string;
  date: string;
  description?: string;
  category: 'NATIONAL' | 'SCHOOL' | 'FESTIVAL';
  isRecurring: boolean;
}

export default function HolidaysPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [formData, setFormData] = useState<CreateHolidayDto>({
    name: '',
    date: '',
    description: '',
    category: 'SCHOOL',
    isRecurring: false,
  });

  const { data: holidays, isLoading } = useQuery<Holiday[]>({
    queryKey: ['holidays'],
    queryFn: async () => {
      const response = await axiosInstance.get('/holidays?page=1&limit=1000');
      return Array.isArray(response.data) ? response.data : response.data?.items || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateHolidayDto) => {
      return axiosInstance.post('/holidays', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      resetForm();
      alert('Holiday added successfully!');
    },
    onError: () => {
      alert('Failed to add holiday');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateHolidayDto }) => {
      return axiosInstance.patch(`/holidays/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      resetForm();
      alert('Holiday updated successfully!');
    },
    onError: () => {
      alert('Failed to update holiday');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return axiosInstance.delete(`/holidays/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['holidays'] });
      alert('Holiday deleted successfully!');
    },
    onError: () => {
      alert('Failed to delete holiday');
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      date: '',
      description: '',
      category: 'SCHOOL',
      isRecurring: false,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (holiday: Holiday) => {
    setFormData({
      name: holiday.name,
      date: holiday.date.split('T')[0],
      description: holiday.description || '',
      category: holiday.category,
      isRecurring: holiday.isRecurring,
    });
    setEditingId(holiday.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date) {
      alert('Please fill all required fields');
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this holiday?')) {
      deleteMutation.mutate(id);
    }
  };

  const filterHolidays = () => {
    if (filterCategory === 'all') return holidays || [];
    return (holidays || []).filter((h) => h.category === filterCategory);
  };

  const getUpcoming = () => {
    const now = new Date();
    return (holidays || [])
      .filter((h) => new Date(h.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  };

  const calculateStats = () => {
    const hols = holidays || [];
    const now = new Date();
    return {
      total: hols.length,
      upcoming: hols.filter((h) => new Date(h.date) >= now).length,
      national: hols.filter((h) => h.category === 'NATIONAL').length,
      school: hols.filter((h) => h.category === 'SCHOOL').length,
    };
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'NATIONAL':
        return 'bg-red-100 text-red-700';
      case 'SCHOOL':
        return 'bg-blue-100 text-blue-700';
      case 'FESTIVAL':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = calculateStats();
  const filteredHolidays = filterHolidays();
  const upcomingHolidays = getUpcoming();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Holidays Calendar
          </h1>
          <p className="text-gray-600 mt-1">Manage school holidays and events</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-purple-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Holiday'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Total Holidays</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Upcoming</p>
                <p className="text-2xl font-bold text-green-800">{stats.upcoming}</p>
              </div>
              <Sun className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">National</p>
                <p className="text-2xl font-bold text-red-800">{stats.national}</p>
              </div>
              <Calendar className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">School</p>
                <p className="text-2xl font-bold text-purple-800">{stats.school}</p>
              </div>
              <Calendar className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Holidays */}
      {upcomingHolidays.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Holidays</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingHolidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {new Date(holiday.date).getDate()}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short' })}
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold">{holiday.name}</p>
                      <p className="text-sm text-gray-600">{holiday.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(holiday.category)}`}>
                    {holiday.category}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Holiday' : 'Add New Holiday'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Holiday Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter holiday name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="NATIONAL">National</option>
                    <option value="SCHOOL">School</option>
                    <option value="FESTIVAL">Festival</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    id="isRecurring"
                    checked={formData.isRecurring}
                    onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <label htmlFor="isRecurring" className="text-sm font-medium">
                    Recurring Annually
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Holiday description"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-500"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingId
                    ? 'Update Holiday'
                    : 'Add Holiday'}
                </Button>
                <Button type="button" onClick={resetForm} variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filterCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterCategory('all')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filterCategory === 'NATIONAL' ? 'default' : 'outline'}
              onClick={() => setFilterCategory('NATIONAL')}
            >
              National
            </Button>
            <Button
              size="sm"
              variant={filterCategory === 'SCHOOL' ? 'default' : 'outline'}
              onClick={() => setFilterCategory('SCHOOL')}
            >
              School
            </Button>
            <Button
              size="sm"
              variant={filterCategory === 'FESTIVAL' ? 'default' : 'outline'}
              onClick={() => setFilterCategory('FESTIVAL')}
            >
              Festival
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Holidays List */}
      <Card>
        <CardHeader>
          <CardTitle>All Holidays</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredHolidays.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Holiday Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Recurring</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredHolidays
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map((holiday) => {
                      const isPast = new Date(holiday.date) < new Date();
                      return (
                        <tr key={holiday.id} className={`hover:bg-gray-50 ${isPast ? 'opacity-60' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="font-semibold">
                              {new Date(holiday.date).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium">{holiday.name}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(holiday.category)}`}>
                              {holiday.category}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {holiday.description || '-'}
                          </td>
                          <td className="px-4 py-3">
                            {holiday.isRecurring ? (
                              <span className="text-green-600 text-sm">Yes</span>
                            ) : (
                              <span className="text-gray-400 text-sm">No</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEdit(holiday)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDelete(holiday.id)}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No holidays added yet</p>
              <p className="text-sm mt-1">Click &quot;Add Holiday&quot; to create one</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
