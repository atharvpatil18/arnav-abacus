'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { axiosInstance } from '@/lib/axios';
import {
  Clock,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Users
} from 'lucide-react';

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
}

interface Batch {
  id: number;
  name: string;
}

interface TimetableEntry {
  id: number;
  batch: Batch;
  teacher: Teacher;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;
  endTime: string;
  room?: string;
  subject?: string;
}

interface CreateTimetableDto {
  batchId: number;
  teacherId: number;
  dayOfWeek: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';
  startTime: string;
  endTime: string;
  room?: string;
  subject?: string;
}

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export default function TimetablePage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);

  const [formData, setFormData] = useState<CreateTimetableDto>({
    batchId: 0,
    teacherId: 0,
    dayOfWeek: 'MONDAY',
    startTime: '09:00',
    endTime: '10:00',
    room: '',
    subject: '',
  });

  const { data: timetable, isLoading } = useQuery<TimetableEntry[]>({
    queryKey: ['timetable', selectedBatch],
    queryFn: async () => {
      const url = selectedBatch
        ? `/timetable?batchId=${selectedBatch}`
        : '/timetable?page=1&limit=1000';
      const response = await axiosInstance.get(url);
      return Array.isArray(response.data) ? response.data : response.data?.items || [];
    },
  });

  const { data: batches } = useQuery<Batch[]>({
    queryKey: ['batches'],
    queryFn: async () => {
      const response = await axiosInstance.get('/batches?page=1&limit=1000');
      return Array.isArray(response.data) ? response.data : response.data?.items || [];
    },
  });

  const { data: teachers } = useQuery<Teacher[]>({
    queryKey: ['teachers'],
    queryFn: async () => {
      const response = await axiosInstance.get('/teacher?page=1&limit=1000');
      return Array.isArray(response.data) ? response.data : response.data?.items || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateTimetableDto) => {
      return axiosInstance.post('/timetable', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      resetForm();
      alert('Timetable entry added successfully!');
    },
    onError: () => {
      alert('Failed to add timetable entry');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateTimetableDto }) => {
      return axiosInstance.patch(`/timetable/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      resetForm();
      alert('Timetable entry updated successfully!');
    },
    onError: () => {
      alert('Failed to update timetable entry');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return axiosInstance.delete(`/timetable/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timetable'] });
      alert('Timetable entry deleted successfully!');
    },
    onError: () => {
      alert('Failed to delete timetable entry');
    },
  });

  const resetForm = () => {
    setFormData({
      batchId: 0,
      teacherId: 0,
      dayOfWeek: 'MONDAY',
      startTime: '09:00',
      endTime: '10:00',
      room: '',
      subject: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (entry: TimetableEntry) => {
    setFormData({
      batchId: entry.batch.id,
      teacherId: entry.teacher.id,
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      room: entry.room || '',
      subject: entry.subject || '',
    });
    setEditingId(entry.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.batchId || !formData.teacherId || !formData.startTime || !formData.endTime) {
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
    if (confirm('Are you sure you want to delete this timetable entry?')) {
      deleteMutation.mutate(id);
    }
  };

  const getEntriesForDayAndTime = (day: string, time: string) => {
    return (timetable || []).filter(
      (entry) =>
        entry.dayOfWeek === day &&
        entry.startTime <= time &&
        entry.endTime > time
    );
  };

  const calculateStats = () => {
    const entries = timetable || [];
    const uniqueBatches = new Set(entries.map((e) => e.batch.id));
    const uniqueTeachers = new Set(entries.map((e) => e.teacher.id));
    
    return {
      totalEntries: entries.length,
      activeBatches: uniqueBatches.size,
      activeTeachers: uniqueTeachers.size,
      totalHours: entries.reduce((sum, e) => {
        const start = new Date(`2000-01-01T${e.startTime}`);
        const end = new Date(`2000-01-01T${e.endTime}`);
        return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      }, 0),
    };
  };

  const stats = calculateStats();

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
            Timetable Management
          </h1>
          <p className="text-gray-600 mt-1">Manage class schedules and assignments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Grid View
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            onClick={() => setViewMode('list')}
          >
            List View
          </Button>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="bg-gradient-to-r from-blue-500 to-purple-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            {showForm ? 'Cancel' : 'Add Entry'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Total Entries</p>
                <p className="text-2xl font-bold text-blue-800">{stats.totalEntries}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Active Batches</p>
                <p className="text-2xl font-bold text-green-800">{stats.activeBatches}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Active Teachers</p>
                <p className="text-2xl font-bold text-purple-800">{stats.activeTeachers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Total Hours</p>
                <p className="text-2xl font-bold text-orange-800">{stats.totalHours.toFixed(1)}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Entry' : 'Add Timetable Entry'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Batch *</label>
                  <select
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={0}>Select batch</option>
                    {batches?.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Teacher *</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={0}>Select teacher</option>
                    {teachers?.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Day *</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, dayOfWeek: e.target.value as 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY' })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {DAYS.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Start Time *</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">End Time *</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Room</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Room number"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Subject name"
                  />
                </div>
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
                    ? 'Update Entry'
                    : 'Add Entry'}
                </Button>
                <Button type="button" onClick={resetForm} variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Batch Filter */}
      <Card>
        <CardContent className="p-4">
          <select
            value={selectedBatch || ''}
            onChange={(e) => setSelectedBatch(e.target.value ? Number(e.target.value) : null)}
            className="w-full md:w-64 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            aria-label="Filter by batch"
          >
            <option value="">All Batches</option>
            {batches?.map((batch) => (
              <option key={batch.id} value={batch.id}>
                {batch.name}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {/* Timetable View */}
      {viewMode === 'grid' ? (
        <Card>
          <CardHeader>
            <CardTitle>Weekly Timetable</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border p-2 bg-gray-100 min-w-[100px]">Time</th>
                    {DAYS.map((day) => (
                      <th key={day} className="border p-2 bg-gray-100 min-w-[150px]">
                        {day.slice(0, 3)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map((time) => (
                    <tr key={time}>
                      <td className="border p-2 font-semibold text-sm bg-gray-50">{time}</td>
                      {DAYS.map((day) => {
                        const entries = getEntriesForDayAndTime(day, time);
                        return (
                          <td key={`${day}-${time}`} className="border p-1">
                            {entries.map((entry) => (
                              <div
                                key={entry.id}
                                className="bg-blue-100 p-2 rounded mb-1 text-xs hover:bg-blue-200 cursor-pointer"
                              >
                                <div className="font-semibold text-blue-900">
                                  {entry.batch.name}
                                </div>
                                <div className="text-blue-700">
                                  {entry.teacher.firstName} {entry.teacher.lastName}
                                </div>
                                {entry.subject && (
                                  <div className="text-blue-600">{entry.subject}</div>
                                )}
                                {entry.room && (
                                  <div className="text-blue-600">Room: {entry.room}</div>
                                )}
                                <div className="text-blue-500">
                                  {entry.startTime} - {entry.endTime}
                                </div>
                                <div className="flex gap-1 mt-1">
                                  <button
                                    onClick={() => handleEdit(entry)}
                                    className="p-1 bg-white rounded hover:bg-gray-100"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(entry.id)}
                                    className="p-1 bg-white rounded hover:bg-gray-100"
                                  >
                                    <Trash2 className="w-3 h-3 text-red-500" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Timetable Entries</CardTitle>
          </CardHeader>
          <CardContent>
            {timetable && timetable.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Day</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Time</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Batch</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Teacher</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Subject</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Room</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {timetable.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">{entry.dayOfWeek}</td>
                        <td className="px-4 py-3">
                          {entry.startTime} - {entry.endTime}
                        </td>
                        <td className="px-4 py-3 font-medium">{entry.batch.name}</td>
                        <td className="px-4 py-3">
                          {entry.teacher.firstName} {entry.teacher.lastName}
                        </td>
                        <td className="px-4 py-3">{entry.subject || '-'}</td>
                        <td className="px-4 py-3">{entry.room || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(entry)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(entry.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No timetable entries yet</p>
                <p className="text-sm mt-1">Click &quot;Add Entry&quot; to create one</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
