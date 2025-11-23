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
  Users,
  DollarSign,
  MapPin,
  TrendingUp
} from 'lucide-react';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
}

interface EventRegistration {
  id: number;
  student: Student;
  registeredAt: string;
  paymentStatus: 'PENDING' | 'PAID' | 'CANCELLED';
}

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  fee: number;
  registrations?: EventRegistration[];
}

interface CreateEventDto {
  title: string;
  description: string;
  date: string;
  location: string;
  capacity: number;
  fee: number;
}

export default function EventsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'past'>('all');
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);

  const [formData, setFormData] = useState<CreateEventDto>({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: 50,
    fee: 0,
  });

  const { data: events, isLoading } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: async () => {
      const response = await axiosInstance.get('/events?page=1&limit=1000');
      return Array.isArray(response.data) ? response.data : response.data?.items || [];
    },
  });

  const { data: registrations } = useQuery<EventRegistration[]>({
    queryKey: ['event-registrations', selectedEvent],
    queryFn: async () => {
      if (!selectedEvent) return [];
      const response = await axiosInstance.get(`/events/${selectedEvent}/registrations`);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!selectedEvent,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateEventDto) => {
      return axiosInstance.post('/events', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      resetForm();
      alert('Event created successfully!');
    },
    onError: () => {
      alert('Failed to create event');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateEventDto }) => {
      return axiosInstance.patch(`/events/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      resetForm();
      alert('Event updated successfully!');
    },
    onError: () => {
      alert('Failed to update event');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return axiosInstance.delete(`/events/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      alert('Event deleted successfully!');
    },
    onError: () => {
      alert('Failed to delete event');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      location: '',
      capacity: 50,
      fee: 0,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (event: Event) => {
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date.split('T')[0],
      location: event.location,
      capacity: event.capacity,
      fee: event.fee,
    });
    setEditingId(event.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date || !formData.location) {
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
    if (confirm('Are you sure you want to delete this event?')) {
      deleteMutation.mutate(id);
    }
  };

  const filterEvents = () => {
    const now = new Date();
    const eventsData = events || [];

    if (filterStatus === 'upcoming') {
      return eventsData.filter(event => new Date(event.date) >= now);
    } else if (filterStatus === 'past') {
      return eventsData.filter(event => new Date(event.date) < now);
    }
    return eventsData;
  };

  const calculateStats = () => {
    const eventsData = events || [];
    const totalEvents = eventsData.length;
    const totalRegistrations = eventsData.reduce((sum, e) => sum + (e.registrations?.length || 0), 0);
    const totalRevenue = eventsData.reduce(
      (sum, e) => sum + (e.registrations?.filter(r => r.paymentStatus === 'PAID').length || 0) * e.fee,
      0
    );
    const avgCapacity = eventsData.reduce(
      (sum, e) => sum + ((e.registrations?.length || 0) / e.capacity) * 100,
      0
    ) / (totalEvents || 1);

    return {
      totalEvents,
      totalRegistrations,
      totalRevenue,
      avgCapacity,
    };
  };

  const stats = calculateStats();
  const filteredEvents = filterEvents();

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
            Events Management
          </h1>
          <p className="text-gray-600 mt-1">Create and manage school events</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-purple-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'New Event'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Total Events</p>
                <p className="text-2xl font-bold text-blue-800">{stats.totalEvents}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Total Registrations</p>
                <p className="text-2xl font-bold text-green-800">{stats.totalRegistrations}</p>
              </div>
              <Users className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-800">₹{stats.totalRevenue}</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Avg Capacity</p>
                <p className="text-2xl font-bold text-orange-800">{stats.avgCapacity.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Event' : 'Create New Event'}</CardTitle>
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
                    placeholder="Event title"
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
                  <label className="block text-sm font-medium mb-2">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Event location"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min={1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Fee (₹)</label>
                  <input
                    type="number"
                    value={formData.fee}
                    onChange={(e) => setFormData({ ...formData, fee: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    min={0}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Event description"
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
                    ? 'Update Event'
                    : 'Create Event'}
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
              variant={filterStatus === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('all')}
            >
              All Events
            </Button>
            <Button
              variant={filterStatus === 'upcoming' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('upcoming')}
            >
              Upcoming
            </Button>
            <Button
              variant={filterStatus === 'past' ? 'default' : 'outline'}
              onClick={() => setFilterStatus('past')}
            >
              Past
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event) => {
            const registeredCount = event.registrations?.length || 0;
            const capacityPercent = (registeredCount / event.capacity) * 100;
            const isPast = new Date(event.date) < new Date();

            return (
              <Card
                key={event.id}
                className={`hover:shadow-lg transition-shadow ${isPast ? 'opacity-75' : ''}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{event.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(event)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                      {isPast && (
                        <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
                          Past
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span>
                        {registeredCount}/{event.capacity} registered
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span>₹{event.fee}</span>
                    </div>

                    {/* Capacity Bar */}
                    <div className="mt-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Capacity</span>
                        <span>{capacityPercent.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            capacityPercent >= 90
                              ? 'bg-red-500'
                              : capacityPercent >= 70
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(capacityPercent, 100)}%` }}
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full mt-3"
                      variant="outline"
                      onClick={() => setSelectedEvent(selectedEvent === event.id ? null : event.id)}
                    >
                      {selectedEvent === event.id ? 'Hide' : 'View'} Registrations
                    </Button>

                    {/* Registrations */}
                    {selectedEvent === event.id && registrations && (
                      <div className="mt-3 border-t pt-3">
                        {registrations.length > 0 ? (
                          <div className="space-y-2 max-h-48 overflow-y-auto">
                            {registrations.map((reg) => (
                              <div
                                key={reg.id}
                                className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded"
                              >
                                <span>
                                  {reg.student.firstName} {reg.student.lastName}
                                </span>
                                <span
                                  className={`px-2 py-0.5 rounded text-xs ${
                                    reg.paymentStatus === 'PAID'
                                      ? 'bg-green-100 text-green-700'
                                      : reg.paymentStatus === 'PENDING'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}
                                >
                                  {reg.paymentStatus}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">No registrations yet</p>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="text-center py-12">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No events found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Create a new event to get started
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
