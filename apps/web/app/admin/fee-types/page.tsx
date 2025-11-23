'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, DollarSign, CalendarRange, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface FeeTypeConfig {
  id: number;
  name: string;
  description: string | null;
  amount: number;
  frequency: string;
  category: string | null;
  applicableLevels: number[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface FeeTypeFormData {
  name: string;
  description: string;
  amount: string;
  frequency: string;
  category: string;
  applicableLevels: string;
}

const frequencies = ['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'YEARLY', 'ONE_TIME'];
const categories = ['TUITION', 'REGISTRATION', 'EXAM', 'MATERIAL', 'EVENT', 'OTHER'];

export default function FeeTypesPage() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterActive, setFilterActive] = useState<string>('ALL');

  const [formData, setFormData] = useState<FeeTypeFormData>({
    name: '',
    description: '',
    amount: '',
    frequency: 'MONTHLY',
    category: 'TUITION',
    applicableLevels: '',
  });

  // Fetch fee types
  const { data, isLoading } = useQuery({
    queryKey: ['fee-types'],
    queryFn: async () => {
      const response = await axiosInstance.get('/fee-types');
      return response.data;
    },
  });
  
  const feeTypes = (data || []) as FeeTypeConfig[];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/fee-types', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-types'] });
      resetForm();
      setIsAdding(false);
      alert('Fee type created successfully!');
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.message || 'Failed to create fee type'}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await axiosInstance.patch(`/fee-types/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-types'] });
      resetForm();
      setEditingId(null);
      alert('Fee type updated successfully!');
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.message || 'Failed to update fee type'}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/fee-types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-types'] });
      alert('Fee type deleted successfully!');
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.message || 'Failed to delete fee type'}`);
    },
  });

  // Toggle active mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const response = await axiosInstance.patch(`/fee-types/${id}`, { isActive });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-types'] });
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.message || 'Failed to update status'}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      amount: '',
      frequency: 'MONTHLY',
      category: 'TUITION',
      applicableLevels: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    const applicableLevelsArray = formData.applicableLevels
      ? formData.applicableLevels.split(',').map(l => parseInt(l.trim())).filter(l => !isNaN(l))
      : [];

    const payload = {
      name: formData.name,
      description: formData.description || null,
      amount: parseFloat(formData.amount),
      frequency: formData.frequency,
      category: formData.category || null,
      applicableLevels: applicableLevelsArray.length > 0 ? applicableLevelsArray : null,
      isActive: true,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (feeType: FeeTypeConfig) => {
    setFormData({
      name: feeType.name,
      description: feeType.description || '',
      amount: feeType.amount.toString(),
      frequency: feeType.frequency,
      category: feeType.category || 'TUITION',
      applicableLevels: feeType.applicableLevels ? feeType.applicableLevels.join(', ') : '',
    });
    setEditingId(feeType.id);
    setIsAdding(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this fee type?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleActive = (id: number, currentStatus: boolean) => {
    toggleActiveMutation.mutate({ id, isActive: !currentStatus });
  };

  // Filter fee types
  const filteredFeeTypes = feeTypes.filter((ft: FeeTypeConfig) => {
    if (filterCategory !== 'ALL' && ft.category !== filterCategory) return false;
    if (filterActive === 'ACTIVE' && !ft.isActive) return false;
    if (filterActive === 'INACTIVE' && ft.isActive) return false;
    return true;
  });

  // Calculate statistics
  const stats = {
    total: feeTypes.length,
    active: feeTypes.filter((ft: FeeTypeConfig) => ft.isActive).length,
    monthly: feeTypes.filter((ft: FeeTypeConfig) => ft.frequency === 'MONTHLY').length,
    yearly: feeTypes.filter((ft: FeeTypeConfig) => ft.frequency === 'YEARLY').length,
  };

  const getFrequencyColor = (frequency: string) => {
    const colors: { [key: string]: string } = {
      MONTHLY: 'bg-blue-100 text-blue-800',
      QUARTERLY: 'bg-purple-100 text-purple-800',
      HALF_YEARLY: 'bg-orange-100 text-orange-800',
      YEARLY: 'bg-green-100 text-green-800',
      ONE_TIME: 'bg-gray-100 text-gray-800',
    };
    return colors[frequency] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-gray-100 text-gray-800';
    const colors: { [key: string]: string } = {
      TUITION: 'bg-blue-100 text-blue-800',
      REGISTRATION: 'bg-green-100 text-green-800',
      EXAM: 'bg-orange-100 text-orange-800',
      MATERIAL: 'bg-purple-100 text-purple-800',
      EVENT: 'bg-pink-100 text-pink-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
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
            Fee Type Configuration
          </h1>
          <p className="text-gray-600 mt-2">Manage fee structures and pricing templates</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Fee Types</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <DollarSign className="h-12 w-12 text-blue-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Active Fee Types</p>
                <p className="text-3xl font-bold mt-1">{stats.active}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Monthly Plans</p>
                <p className="text-3xl font-bold mt-1">{stats.monthly}</p>
              </div>
              <CalendarRange className="h-12 w-12 text-purple-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Yearly Plans</p>
                <p className="text-3xl font-bold mt-1">{stats.yearly}</p>
              </div>
              <CalendarRange className="h-12 w-12 text-orange-200" />
            </div>
          </Card>
        </div>

        {/* Add/Edit Form */}
        {isAdding && (
          <Card className="p-6 mb-8 border-2 border-blue-200">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit Fee Type' : 'Create New Fee Type'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Monthly Tuition Fee"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount (₹) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="e.g., 1500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {frequencies.map((freq) => (
                      <option key={freq} value={freq}>
                        {freq.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Applicable Levels (comma-separated)
                  </label>
                  <Input
                    value={formData.applicableLevels}
                    onChange={(e) => setFormData({ ...formData, applicableLevels: e.target.value })}
                    placeholder="e.g., 1, 2, 3"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter fee type description..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingId ? 'Update Fee Type' : 'Create Fee Type'}
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
              Add Fee Type
            </Button>
          </div>
        )}

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="ALL">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Fee Types Table */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Fee Types</h2>
          {filteredFeeTypes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No fee types found</p>
              <p className="text-sm">Create a new fee type to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Name</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Frequency</th>
                    <th className="text-left py-3 px-4">Category</th>
                    <th className="text-left py-3 px-4">Levels</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeeTypes.map((feeType: FeeTypeConfig) => (
                    <tr key={feeType.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{feeType.name}</div>
                        {feeType.description && (
                          <div className="text-sm text-gray-500">{feeType.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-green-600">
                          ₹{feeType.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFrequencyColor(feeType.frequency)}`}>
                          {feeType.frequency.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {feeType.category ? (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(feeType.category)}`}>
                            {feeType.category}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {feeType.applicableLevels ? (
                          <span className="text-sm">
                            Levels: {feeType.applicableLevels.join(', ')}
                          </span>
                        ) : (
                          <span className="text-gray-400">All Levels</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(feeType.id, feeType.isActive)}
                          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                            feeType.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {feeType.isActive ? (
                            <>
                              <CheckCircle className="h-3 w-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              Inactive
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(feeType)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(feeType.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
