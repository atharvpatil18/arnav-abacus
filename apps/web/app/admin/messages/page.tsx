'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { axiosInstance } from '@/lib/axios';
import {
  Mail,
  Send,
  Inbox,
  Trash2,
  Eye,
  Search,
  User
} from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface Message {
  id: number;
  sender: User;
  recipient: User;
  subject: string;
  body: string;
  type: 'DIRECT' | 'NOTIFICATION' | 'ANNOUNCEMENT';
  channel: 'EMAIL' | 'SMS' | 'IN_APP';
  isRead: boolean;
  sentAt: string;
}

interface CreateMessageDto {
  recipientId: number;
  subject: string;
  body: string;
  type: 'DIRECT' | 'NOTIFICATION' | 'ANNOUNCEMENT';
  channel: 'EMAIL' | 'SMS' | 'IN_APP';
}

export default function MessagesPage() {
  const queryClient = useQueryClient();
  const [showCompose, setShowCompose] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [view, setView] = useState<'inbox' | 'sent'>('inbox');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState<CreateMessageDto>({
    recipientId: 0,
    subject: '',
    body: '',
    type: 'DIRECT',
    channel: 'IN_APP',
  });

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ['messages', view],
    queryFn: async () => {
      const endpoint = view === 'inbox' ? '/messages/inbox' : '/messages/sent';
      const response = await axiosInstance.get(`${endpoint}?page=1&limit=1000`);
      return Array.isArray(response.data) ? response.data : (response.data as any)?.items || [];
    },
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ['users-all'],
    queryFn: async () => {
      const response = await axiosInstance.get('/users?page=1&limit=1000');
      return Array.isArray(response.data) ? response.data : (response.data as any)?.items || [];
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: CreateMessageDto) => {
      return axiosInstance.post('/messages', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      resetForm();
      toast.success('Message sent successfully!');
    },
    onError: () => {
      toast.error('Failed to send message');
    },
  });

  const markReadMutation = useMutation({
    mutationFn: async (id: number) => {
      return axiosInstance.patch(`/messages/${id}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return axiosInstance.delete(`/messages/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      setSelectedMessage(null);
      toast.success('Message deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete message');
    },
  });

  const resetForm = () => {
    setFormData({
      recipientId: 0,
      subject: '',
      body: '',
      type: 'DIRECT',
      channel: 'IN_APP',
    });
    setShowCompose(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipientId || !formData.subject || !formData.body) {
      toast.error('Please fill all required fields');
      return;
    }

    sendMessageMutation.mutate(formData);
  };

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    if (view === 'inbox' && !message.isRead) {
      markReadMutation.mutate(message.id);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this message?')) {
      deleteMutation.mutate(id);
    }
  };

  const filterMessages = () => {
    const messagesList = messages || [];
    if (!searchQuery) return messagesList;
    
    return messagesList.filter(
      (msg) =>
        msg.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
        `${msg.sender.firstName} ${msg.sender.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const calculateStats = () => {
    const allMessages = messages || [];
    return {
      total: allMessages.length,
      unread: allMessages.filter((m) => !m.isRead && view === 'inbox').length,
      sent: view === 'sent' ? allMessages.length : 0,
    };
  };

  const stats = calculateStats();
  const filteredMessages = filterMessages();

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
            Messages
          </h1>
          <p className="text-gray-600 mt-1">Send and receive messages</p>
        </div>
        <Button
          onClick={() => setShowCompose(!showCompose)}
          className="bg-gradient-to-r from-blue-500 to-purple-500"
        >
          <Send className="w-4 h-4 mr-2" />
          {showCompose ? 'Cancel' : 'Compose'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Total Messages</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Unread</p>
                <p className="text-2xl font-bold text-orange-800">{stats.unread}</p>
              </div>
              <Eye className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Sent</p>
                <p className="text-2xl font-bold text-green-800">{stats.sent || messages?.length || 0}</p>
              </div>
              <Send className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compose Form */}
      {showCompose && (
        <Card>
          <CardHeader>
            <CardTitle>Compose Message</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Recipient *</label>
                  <select
                    value={formData.recipientId}
                    onChange={(e) => setFormData({ ...formData, recipientId: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={0}>Select recipient</option>
                    {users?.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Channel *</label>
                  <select
                    value={formData.channel}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFormData({ ...formData, channel: e.target.value as 'EMAIL' | 'SMS' | 'IN_APP' })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="IN_APP">In-App</option>
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Message subject"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message *</label>
                <textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={6}
                  placeholder="Type your message here..."
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={sendMessageMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-500"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
                </Button>
                <Button type="button" onClick={resetForm} variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Messages View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Message List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={view === 'inbox' ? 'default' : 'outline'}
                  onClick={() => setView('inbox')}
                >
                  <Inbox className="w-4 h-4 mr-1" />
                  Inbox
                </Button>
                <Button
                  size="sm"
                  variant={view === 'sent' ? 'default' : 'outline'}
                  onClick={() => setView('sent')}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Sent
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Search messages..."
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              {filteredMessages.length > 0 ? (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                    } ${!message.isRead && view === 'inbox' ? 'bg-blue-50/50' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-semibold text-sm">
                          {view === 'inbox'
                            ? `${message.sender.firstName} ${message.sender.lastName}`
                            : `${message.recipient.firstName} ${message.recipient.lastName}`}
                        </span>
                      </div>
                      {!message.isRead && view === 'inbox' && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="font-medium text-sm mb-1 truncate">{message.subject}</p>
                    <p className="text-xs text-gray-500 truncate">{message.body}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(message.sentAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                  <p>No messages found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Message Detail */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Message Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMessage ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between pb-4 border-b">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{selectedMessage.subject}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>
                          <strong>From:</strong> {selectedMessage.sender.firstName}{' '}
                          {selectedMessage.sender.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>
                          <strong>To:</strong> {selectedMessage.recipient.firstName}{' '}
                          {selectedMessage.recipient.lastName}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(selectedMessage.sentAt).toLocaleString()}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {selectedMessage.channel}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        {selectedMessage.type}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(selectedMessage.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
                <div className="prose max-w-none">
                  <p className="whitespace-pre-wrap text-gray-700">{selectedMessage.body}</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Mail className="w-16 h-16 mb-4" />
                <p>Select a message to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
