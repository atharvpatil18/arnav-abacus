'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Calendar, Clock, AlertCircle, CheckCircle, Edit2, Trash2, Bell } from 'lucide-react';

interface Batch {
  id: number;
  name: string;
  level: { name: string };
}

interface MakeupClass {
  id: number;
  originalDate: string;
  makeupDate: string;
  newDate: string;
  batch: Batch;
  batchId: number;
  reason: string | null;
  status: string;
  notified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface MakeupClassFormData {
  originalDate: string;
  makeupDate: string;
  batchId: string;
  reason: string;
}

const statuses = ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED'];

export default function MakeupClassesPage() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterBatch, setFilterBatch] = useState<string>('ALL');

  const [formData, setFormData] = useState<MakeupClassFormData>({
    originalDate: '',
    makeupDate: '',
    batchId: '',
    reason: '',
  });

  // Fetch makeup classes
  const { data, isLoading } = useQuery({
    queryKey: ['makeup-classes'],
    queryFn: async () => {
      const response = await axiosInstance.get('/makeup-classes');
      return response.data;
    },
  });
  
  const makeupClasses = (data || []) as MakeupClass[];

  // Fetch batches
  const { data: batchesData } = useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const response = await axiosInstance.get('/batches');
      return response.data;
    },
  });
  
  const batches = (batchesData || []) as Batch[];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/makeup-classes', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['makeup-classes'] });
      resetForm();
      setIsAdding(false);
      alert('Makeup class scheduled successfully!');
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.message || 'Failed to schedule makeup class'}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await axiosInstance.patch(`/makeup-classes/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['makeup-classes'] });
      resetForm();
      setEditingId(null);
      alert('Makeup class updated successfully!');
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.message || 'Failed to update makeup class'}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/makeup-classes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['makeup-classes'] });
      alert('Makeup class deleted successfully!');
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.message || 'Failed to delete makeup class'}`);
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await axiosInstance.patch(`/makeup-classes/${id}`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['makeup-classes'] });
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.message || 'Failed to update status'}`);
    },
  });

  // Send notification mutation
  const notifyMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.post(`/makeup-classes/${id}/notify`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['makeup-classes'] });
      alert('Notification sent successfully!');
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.message || 'Failed to send notification'}`);
    },
  });

  const resetForm = () => {
    setFormData({
      originalDate: '',
      makeupDate: '',
      batchId: '',
      reason: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.originalDate || !formData.makeupDate || !formData.batchId) {
      alert('Please fill in all required fields');
      return;
    }

    const payload = {
      originalDate: new Date(formData.originalDate).toISOString(),
      makeupDate: new Date(formData.makeupDate).toISOString(),
      newDate: new Date(formData.makeupDate).toISOString(),
      batchId: parseInt(formData.batchId),
      reason: formData.reason || null,
      status: 'SCHEDULED',
      notified: false,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const formatLocalDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleEdit = (makeupClass: MakeupClass) => {
    setFormData({
      originalDate: formatLocalDate(new Date(makeupClass.originalDate)),
      makeupDate: formatLocalDate(new Date(makeupClass.makeupDate)),
      batchId: makeupClass.batchId.toString(),
      reason: makeupClass.reason || '',
    });
    setEditingId(makeupClass.id);
    setIsAdding(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this makeup class?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleStatusChange = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleNotify = (id: number) => {
    if (confirm('Send notification to all students in this batch?')) {
      notifyMutation.mutate(id);
    }
  };

  // Filter makeup classes
  const filteredClasses = makeupClasses.filter((mc: MakeupClass) => {
    if (filterStatus !== 'ALL' && mc.status !== filterStatus) return false;
    if (filterBatch !== 'ALL' && mc.batchId.toString() !== filterBatch) return false;
    return true;
  });

  // Calculate statistics
  const now = new Date();
  const stats = {
    total: makeupClasses.length,
    scheduled: makeupClasses.filter((mc: MakeupClass) => mc.status === 'SCHEDULED').length,
    upcoming: makeupClasses.filter((mc: MakeupClass) => 
      mc.status === 'SCHEDULED' && new Date(mc.makeupDate) > now
    ).length,
    completed: makeupClasses.filter((mc: MakeupClass) => mc.status === 'COMPLETED').length,
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      RESCHEDULED: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Makeup Classes
          </h1>
          <p className="text-gray-600 mt-2">Schedule and manage makeup classes for missed sessions</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Classes</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <Calendar className="h-12 w-12 text-blue-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Scheduled</p>
                <p className="text-3xl font-bold mt-1">{stats.scheduled}</p>
              </div>
              <Clock className="h-12 w-12 text-purple-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Upcoming</p>
                <p className="text-3xl font-bold mt-1">{stats.upcoming}</p>
              </div>
              <AlertCircle className="h-12 w-12 text-orange-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Completed</p>
                <p className="text-3xl font-bold mt-1">{stats.completed}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-200" />
            </div>
          </Card>
        </div>

        {/* Add/Edit Form */}
        {isAdding && (
          <Card className="p-6 mb-8 border-2 border-blue-200">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit Makeup Class' : 'Schedule Makeup Class'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.originalDate}
                    onChange={(e) => setFormData({ ...formData, originalDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Makeup Date *
                  </label>
                  <Input
                    type="date"
                    value={formData.makeupDate}
                    onChange={(e) => setFormData({ ...formData, makeupDate: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Batch *
                  </label>
                  <select
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Batch</option>
                    {batches.map((batch: Batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name} - {batch.level.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason for Makeup Class
                </label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="e.g., Teacher leave, Holiday, etc."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingId ? 'Update Makeup Class' : 'Schedule Makeup Class'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Add Button */}
        {!isAdding && (
          <div className="mb-6">
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Schedule Makeup Class
            </Button>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="ALL">All Status</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
              <select
                value={filterBatch}
                onChange={(e) => setFilterBatch(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="ALL">All Batches</option>
                {batches.map((batch: Batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Makeup Classes List */}
        <div className="space-y-4">
          {filteredClasses.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg text-gray-500">No makeup classes found</p>
              <p className="text-sm text-gray-400">Schedule a makeup class to get started</p>
            </Card>
          ) : (
            filteredClasses.map((makeupClass: MakeupClass) => (
              <Card key={makeupClass.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">{makeupClass.batch.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(makeupClass.status)}`}>
                        {makeupClass.status}
                      </span>
                      {makeupClass.notified && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 flex items-center gap-1">
                          <Bell className="h-3 w-3" />
                          Notified
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Original Date</p>
                        <p className="font-medium">{formatDate(makeupClass.originalDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Makeup Date</p>
                        <p className="font-medium text-blue-600">{formatDate(makeupClass.makeupDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Level</p>
                        <p className="font-medium">{makeupClass.batch.level.name}</p>
                      </div>
                    </div>

                    {makeupClass.reason && (
                      <div className="mt-3">
                        <p className="text-gray-500 text-sm">Reason</p>
                        <p className="text-sm">{makeupClass.reason}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <select
                      value={makeupClass.status}
                      onChange={(e) => handleStatusChange(makeupClass.id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2">
                      {!makeupClass.notified && makeupClass.status === 'SCHEDULED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleNotify(makeupClass.id)}
                          className="text-blue-600"
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(makeupClass)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(makeupClass.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
