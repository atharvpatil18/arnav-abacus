'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { axiosInstance } from '@/lib/axios';
import {
  Megaphone,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';

interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  targetRoles: string[];
  isPublished: boolean;
  expiryDate?: string;
  createdAt: string;
}

interface CreateAnnouncementDto {
  title: string;
  content: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  targetRoles: string[];
  expiryDate?: string;
}

export default function AnnouncementsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const [formData, setFormData] = useState<CreateAnnouncementDto>({
    title: '',
    content: '',
    priority: 'MEDIUM',
    targetRoles: ['ALL'],
    expiryDate: '',
  });

  const { data: announcements, isLoading } = useQuery<Announcement[]>({
    queryKey: ['announcements'],
    queryFn: async () => {
      const response = await axiosInstance.get('/announcements?page=1&limit=1000');
      return Array.isArray(response.data) ? response.data : (response.data as any)?.items || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateAnnouncementDto) => {
      return axiosInstance.post('/announcements', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      resetForm();
      alert('Announcement created successfully!');
    },
    onError: () => {
      alert('Failed to create announcement');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateAnnouncementDto }) => {
      return axiosInstance.patch(`/announcements/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      resetForm();
      alert('Announcement updated successfully!');
    },
    onError: () => {
      alert('Failed to update announcement');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return axiosInstance.delete(`/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      alert('Announcement deleted successfully!');
    },
    onError: () => {
      alert('Failed to delete announcement');
    },
  });

  const togglePublishMutation = useMutation({
    mutationFn: async ({ id, isPublished }: { id: number; isPublished: boolean }) => {
      return axiosInstance.patch(`/announcements/${id}`, { isPublished });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
    },
    onError: () => {
      alert('Failed to update announcement');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      priority: 'MEDIUM',
      targetRoles: ['ALL'],
      expiryDate: '',
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority,
      targetRoles: announcement.targetRoles,
      expiryDate: announcement.expiryDate ? announcement.expiryDate.split('T')[0] : '',
    });
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
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
    if (confirm('Are you sure you want to delete this announcement?')) {
      deleteMutation.mutate(id);
    }
  };

  const togglePublish = (id: number, currentStatus: boolean) => {
    togglePublishMutation.mutate({ id, isPublished: !currentStatus });
  };

  const filterAnnouncements = () => {
    if (filterPriority === 'all') return announcements || [];
    return (announcements || []).filter((ann) => ann.priority === filterPriority);
  };

  const calculateStats = () => {
    const anns = announcements || [];
    return {
      total: anns.length,
      active: anns.filter((a) => a.isPublished).length,
      high: anns.filter((a) => a.priority === 'HIGH').length,
      medium: anns.filter((a) => a.priority === 'MEDIUM').length,
    };
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'LOW':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const stats = calculateStats();
  const filteredAnnouncements = filterAnnouncements();

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
            Announcements
          </h1>
          <p className="text-gray-600 mt-1">Broadcast announcements to users</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-purple-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'New Announcement'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Total</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
              <Megaphone className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Active</p>
                <p className="text-2xl font-bold text-green-800">{stats.active}</p>
              </div>
              <Eye className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">High Priority</p>
                <p className="text-2xl font-bold text-red-800">{stats.high}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Medium Priority</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.medium}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Announcement' : 'Create New Announcement'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Announcement title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Priority *</label>
                  <select
                    value={formData.priority}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, priority: e.target.value as 'HIGH' | 'MEDIUM' | 'LOW' })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Target Audience *</label>
                  <select
                    value={formData.targetRoles[0]}
                    onChange={(e) => setFormData({ ...formData, targetRoles: [e.target.value] })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="ALL">All Users</option>
                    <option value="TEACHER">Teachers</option>
                    <option value="PARENT">Parents</option>
                    <option value="STUDENT">Students</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Expiry Date</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={5}
                  placeholder="Announcement content"
                  required
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
                    ? 'Update Announcement'
                    : 'Create Announcement'}
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
              variant={filterPriority === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterPriority('all')}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={filterPriority === 'HIGH' ? 'default' : 'outline'}
              onClick={() => setFilterPriority('HIGH')}
            >
              High Priority
            </Button>
            <Button
              size="sm"
              variant={filterPriority === 'MEDIUM' ? 'default' : 'outline'}
              onClick={() => setFilterPriority('MEDIUM')}
            >
              Medium Priority
            </Button>
            <Button
              size="sm"
              variant={filterPriority === 'LOW' ? 'default' : 'outline'}
              onClick={() => setFilterPriority('LOW')}
            >
              Low Priority
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((announcement) => {
            const isExpired = announcement.expiryDate && new Date(announcement.expiryDate) < new Date();
            return (
              <Card
                key={announcement.id}
                className={`${getPriorityColor(announcement.priority)} border-l-4`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-lg">{announcement.title}</CardTitle>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPriorityColor(announcement.priority)}`}>
                          {announcement.priority}
                        </span>
                        {announcement.isPublished ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            Published
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                            Draft
                          </span>
                        )}
                        {isExpired && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                            Expired
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">
                        Target: {announcement.targetRoles.join(', ')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePublish(announcement.id, announcement.isPublished)}
                      >
                        {announcement.isPublished ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(announcement)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                  <div className="flex gap-4 mt-4 text-xs text-gray-500">
                    <span>Created: {new Date(announcement.createdAt).toLocaleDateString()}</span>
                    {announcement.expiryDate && (
                      <span>Expires: {new Date(announcement.expiryDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Megaphone className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No announcements yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Create a new announcement to get started
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
