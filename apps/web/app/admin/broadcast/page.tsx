'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Send, Users, CheckCircle, XCircle, Clock, Mail, MessageSquare, Smartphone } from 'lucide-react';

interface User {
  id: number;
  name: string | null;
  email: string;
}

interface BroadcastMessage {
  id: number;
  title: string | null;
  subject: string | null;
  message: string;
  channel: string;
  targetType: string;
  targetIds: number[] | null;
  status: string;
  sentAt: string | null;
  sentBy: number;
  sentByUser: User;
  recipientCount: number | null;
  successCount: number | null;
  failureCount: number | null;
  createdAt: string;
  updatedAt: string;
}

interface BroadcastFormData {
  title: string;
  subject: string;
  message: string;
  channel: string;
  targetType: string;
  targetIds: string;
}

const channels = ['IN_APP', 'EMAIL', 'SMS', 'WHATSAPP'];
const targetTypes = ['ALL', 'TEACHERS', 'PARENTS', 'STUDENTS', 'CUSTOM'];

export default function BroadcastMessagesPage() {
  const queryClient = useQueryClient();
  const [isComposing, setIsComposing] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterChannel, setFilterChannel] = useState<string>('ALL');

  const [formData, setFormData] = useState<BroadcastFormData>({
    title: '',
    subject: '',
    message: '',
    channel: 'IN_APP',
    targetType: 'ALL',
    targetIds: '',
  });

  // Fetch broadcast messages
  const { data: broadcasts = [], isLoading } = useQuery({
    queryKey: ['broadcast-messages'],
    queryFn: async () => {
      const response = await axiosInstance.get('/broadcast-messages');
      return response.data;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/broadcast-messages', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-messages'] });
      resetForm();
      setIsComposing(false);
      alert('Broadcast message sent successfully!');
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.message || 'Failed to send broadcast'}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/broadcast-messages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-messages'] });
      alert('Broadcast message deleted successfully!');
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.message || 'Failed to delete broadcast'}`);
    },
  });

  // Resend mutation
  const resendMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axiosInstance.post(`/broadcast-messages/${id}/resend`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['broadcast-messages'] });
      alert('Broadcast message resent successfully!');
    },
    onError: (error: any) => {
      alert(`Error: ${error.response?.data?.message || 'Failed to resend broadcast'}`);
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      subject: '',
      message: '',
      channel: 'IN_APP',
      targetType: 'ALL',
      targetIds: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.message || !formData.channel || !formData.targetType) {
      alert('Please fill in all required fields');
      return;
    }

    const targetIdsArray = formData.targetIds
      ? formData.targetIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id))
      : null;

    const payload = {
      title: formData.title || null,
      subject: formData.subject || null,
      message: formData.message,
      channel: formData.channel,
      targetType: formData.targetType,
      targetIds: targetIdsArray,
      status: 'PENDING',
    };

    createMutation.mutate(payload);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this broadcast?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleResend = (id: number) => {
    if (confirm('Resend this broadcast to all recipients?')) {
      resendMutation.mutate(id);
    }
  };

  // Filter broadcasts
  const filteredBroadcasts = broadcasts.filter((broadcast: BroadcastMessage) => {
    if (filterStatus !== 'ALL' && broadcast.status !== filterStatus) return false;
    if (filterChannel !== 'ALL' && broadcast.channel !== filterChannel) return false;
    return true;
  });

  // Calculate statistics
  const stats = {
    total: broadcasts.length,
    sent: broadcasts.filter((b: BroadcastMessage) => b.status === 'SENT').length,
    pending: broadcasts.filter((b: BroadcastMessage) => b.status === 'PENDING').length,
    totalRecipients: broadcasts.reduce((sum: number, b: BroadcastMessage) => sum + (b.recipientCount || 0), 0),
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      SENDING: 'bg-blue-100 text-blue-800',
      SENT: 'bg-green-100 text-green-800',
      FAILED: 'bg-red-100 text-red-800',
      PARTIAL: 'bg-orange-100 text-orange-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getChannelIcon = (channel: string) => {
    const icons: { [key: string]: any } = {
      IN_APP: MessageSquare,
      EMAIL: Mail,
      SMS: Smartphone,
      WHATSAPP: MessageSquare,
    };
    const Icon = icons[channel] || MessageSquare;
    return <Icon className="h-4 w-4" />;
  };

  const getChannelColor = (channel: string) => {
    const colors: { [key: string]: string } = {
      IN_APP: 'bg-blue-100 text-blue-800',
      EMAIL: 'bg-purple-100 text-purple-800',
      SMS: 'bg-green-100 text-green-800',
      WHATSAPP: 'bg-teal-100 text-teal-800',
    };
    return colors[channel] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not sent yet';
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
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
            Broadcast Messages
          </h1>
          <p className="text-gray-600 mt-2">Send bulk messages to multiple recipients</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Broadcasts</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <Send className="h-12 w-12 text-blue-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Sent</p>
                <p className="text-3xl font-bold mt-1">{stats.sent}</p>
              </div>
              <CheckCircle className="h-12 w-12 text-green-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Pending</p>
                <p className="text-3xl font-bold mt-1">{stats.pending}</p>
              </div>
              <Clock className="h-12 w-12 text-yellow-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Recipients</p>
                <p className="text-3xl font-bold mt-1">{stats.totalRecipients}</p>
              </div>
              <Users className="h-12 w-12 text-purple-200" />
            </div>
          </Card>
        </div>

        {/* Compose Form */}
        {isComposing && (
          <Card className="p-6 mb-8 border-2 border-blue-200">
            <h2 className="text-xl font-semibold mb-4">Compose Broadcast Message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Broadcast title (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Channel *
                  </label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    {channels.map((channel) => (
                      <option key={channel} value={channel}>
                        {channel.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                {(formData.channel === 'EMAIL' || formData.channel === 'IN_APP') && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="Message subject (for email/in-app)"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Audience *
                  </label>
                  <select
                    value={formData.targetType}
                    onChange={(e) => setFormData({ ...formData, targetType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    {targetTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.targetType === 'CUSTOM' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Target User IDs (comma-separated)
                    </label>
                    <Input
                      value={formData.targetIds}
                      onChange={(e) => setFormData({ ...formData, targetIds: e.target.value })}
                      placeholder="e.g., 1, 2, 3, 4"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter your broadcast message..."
                  rows={6}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.message.length} characters
                </p>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4 mr-2" />
                  Send Broadcast
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsComposing(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Compose Button */}
        {!isComposing && (
          <div className="mb-6">
            <Button
              onClick={() => setIsComposing(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Compose Broadcast
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
                <option value="PENDING">Pending</option>
                <option value="SENDING">Sending</option>
                <option value="SENT">Sent</option>
                <option value="FAILED">Failed</option>
                <option value="PARTIAL">Partial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
              <select
                value={filterChannel}
                onChange={(e) => setFilterChannel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="ALL">All Channels</option>
                {channels.map((channel) => (
                  <option key={channel} value={channel}>
                    {channel.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Broadcasts List */}
        <div className="space-y-4">
          {filteredBroadcasts.length === 0 ? (
            <Card className="p-12 text-center">
              <Send className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg text-gray-500">No broadcast messages found</p>
              <p className="text-sm text-gray-400">Compose a broadcast to get started</p>
            </Card>
          ) : (
            filteredBroadcasts.map((broadcast: BroadcastMessage) => (
              <Card key={broadcast.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      {broadcast.title && (
                        <h3 className="text-lg font-semibold">{broadcast.title}</h3>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(broadcast.status)}`}>
                        {broadcast.status}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getChannelColor(broadcast.channel)}`}>
                        {getChannelIcon(broadcast.channel)}
                        {broadcast.channel.replace('_', ' ')}
                      </span>
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {broadcast.targetType}
                      </span>
                    </div>

                    {broadcast.subject && (
                      <p className="font-medium mb-2">{broadcast.subject}</p>
                    )}
                    
                    <p className="text-sm text-gray-600 mb-3 whitespace-pre-wrap">
                      {broadcast.message.length > 200
                        ? broadcast.message.substring(0, 200) + '...'
                        : broadcast.message}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Sent By</p>
                        <p className="font-medium">{broadcast.sentByUser.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Sent At</p>
                        <p className="font-medium">{formatDate(broadcast.sentAt)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Recipients</p>
                        <p className="font-medium">{broadcast.recipientCount || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Success / Failure</p>
                        <p className="font-medium">
                          <span className="text-green-600">{broadcast.successCount || 0}</span>
                          {' / '}
                          <span className="text-red-600">{broadcast.failureCount || 0}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {broadcast.status === 'FAILED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResend(broadcast.id)}
                        className="text-blue-600"
                      >
                        Resend
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(broadcast.id)}
                    >
                      Delete
                    </Button>
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
