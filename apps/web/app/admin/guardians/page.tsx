'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Users, UserCheck, AlertTriangle, Edit2, Trash2, Phone, Mail } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: number;
  name: string | null;
  email: string;
  phoneNumber: string | null;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string | null;
  enrollmentNumber: string | null;
}

interface Guardian {
  id: number;
  userId: number;
  user: User;
  studentId: number;
  student: Student;
  relationship: string | null;
  isPrimary: boolean;
  canPickup: boolean;
  emergencyContact: boolean;
  createdAt: string;
  updatedAt: string;
}

interface GuardianFormData {
  userId: string;
  studentId: string;
  relationship: string;
  isPrimary: boolean;
  canPickup: boolean;
  emergencyContact: boolean;
}

const relationships = ['FATHER', 'MOTHER', 'GRANDFATHER', 'GRANDMOTHER', 'UNCLE', 'AUNT', 'GUARDIAN', 'OTHER'];

export default function GuardiansPage() {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStudent, setFilterStudent] = useState<string>('ALL');

  const [formData, setFormData] = useState<GuardianFormData>({
    userId: '',
    studentId: '',
    relationship: 'FATHER',
    isPrimary: false,
    canPickup: true,
    emergencyContact: false,
  });

  // Fetch guardians
  const { data, isLoading } = useQuery({
    queryKey: ['guardians'],
    queryFn: async () => {
      const response = await axiosInstance.get('/guardians');
      return response.data;
    },
  });
  
  const guardians = (data || []) as Guardian[];

  // Fetch users
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axiosInstance.get('/users');
      return (response.data as User[]).filter((u: User) => u.name); // Only users with names
    },
  });

  // Fetch students
  const { data: studentsData } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await axiosInstance.get('/students');
      return response.data;
    },
  });
  
  const students = (studentsData || []) as Student[];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axiosInstance.post('/guardians', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      resetForm();
      setIsAdding(false);
      toast.success('Guardian added successfully!');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.response?.data?.message || 'Failed to add guardian'}`);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await axiosInstance.patch(`/guardians/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      resetForm();
      setEditingId(null);
      toast.success('Guardian updated successfully!');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.response?.data?.message || 'Failed to update guardian'}`);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/guardians/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guardians'] });
      toast.success('Guardian deleted successfully!');
    },
    onError: (error: any) => {
      toast.error(`Error: ${error.response?.data?.message || 'Failed to delete guardian'}`);
    },
  });

  const resetForm = () => {
    setFormData({
      userId: '',
      studentId: '',
      relationship: 'FATHER',
      isPrimary: false,
      canPickup: true,
      emergencyContact: false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.userId || !formData.studentId) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate numeric IDs
    const userIdNum = parseInt(formData.userId, 10);
    const studentIdNum = parseInt(formData.studentId, 10);
    
    if (isNaN(userIdNum) || isNaN(studentIdNum)) {
      toast.error('User ID and Student ID must be valid numbers');
      return;
    }

    const payload = {
      userId: userIdNum,
      studentId: studentIdNum,
      relationship: formData.relationship || null,
      isPrimary: formData.isPrimary,
      canPickup: formData.canPickup,
      emergencyContact: formData.emergencyContact,
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (guardian: Guardian) => {
    setFormData({
      userId: guardian.userId.toString(),
      studentId: guardian.studentId.toString(),
      relationship: guardian.relationship || 'FATHER',
      isPrimary: guardian.isPrimary,
      canPickup: guardian.canPickup,
      emergencyContact: guardian.emergencyContact,
    });
    setEditingId(guardian.id);
    setIsAdding(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this guardian relationship?')) {
      deleteMutation.mutate(id);
    }
  };

  // Filter guardians
  const filteredGuardians = guardians.filter((guardian: Guardian) => {
    if (filterStudent !== 'ALL' && guardian.studentId.toString() !== filterStudent) return false;
    
    const searchLower = searchTerm.toLowerCase();
    const userName = guardian.user.name?.toLowerCase() || '';
    const studentName = `${guardian.student.firstName} ${guardian.student.lastName || ''}`.toLowerCase();
    
    if (searchTerm && !userName.includes(searchLower) && !studentName.includes(searchLower)) {
      return false;
    }
    
    return true;
  });

  // Calculate statistics
  const stats = {
    total: guardians.length,
    primary: guardians.filter((g: Guardian) => g.isPrimary).length,
    emergency: guardians.filter((g: Guardian) => g.emergencyContact).length,
    canPickup: guardians.filter((g: Guardian) => g.canPickup).length,
  };

  const getRelationshipColor = (relationship: string | null) => {
    if (!relationship) return 'bg-gray-100 text-gray-800';
    const colors: { [key: string]: string } = {
      FATHER: 'bg-blue-100 text-blue-800',
      MOTHER: 'bg-pink-100 text-pink-800',
      GRANDFATHER: 'bg-purple-100 text-purple-800',
      GRANDMOTHER: 'bg-purple-100 text-purple-800',
      UNCLE: 'bg-green-100 text-green-800',
      AUNT: 'bg-green-100 text-green-800',
      GUARDIAN: 'bg-orange-100 text-orange-800',
      OTHER: 'bg-gray-100 text-gray-800',
    };
    return colors[relationship] || 'bg-gray-100 text-gray-800';
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
            Guardian Management
          </h1>
          <p className="text-gray-600 mt-2">Manage parent and guardian relationships with students</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Guardians</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <Users className="h-12 w-12 text-blue-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Primary Contacts</p>
                <p className="text-3xl font-bold mt-1">{stats.primary}</p>
              </div>
              <UserCheck className="h-12 w-12 text-green-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">Emergency Contacts</p>
                <p className="text-3xl font-bold mt-1">{stats.emergency}</p>
              </div>
              <AlertTriangle className="h-12 w-12 text-red-200" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Pickup Authorized</p>
                <p className="text-3xl font-bold mt-1">{stats.canPickup}</p>
              </div>
              <UserCheck className="h-12 w-12 text-purple-200" />
            </div>
          </Card>
        </div>

        {/* Add/Edit Form */}
        {isAdding && (
          <Card className="p-6 mb-8 border-2 border-blue-200">
            <h2 className="text-xl font-semibold mb-4">
              {editingId ? 'Edit Guardian' : 'Add Guardian'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Guardian/Parent User *
                  </label>
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select User</option>
                    {users.map((user: User) => (
                      <option key={user.id} value={user.id}>
                        {user.name} - {user.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Student *
                  </label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Student</option>
                    {students.map((student: Student) => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} - {student.enrollmentNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <select
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {relationships.map((rel) => (
                      <option key={rel} value={rel}>
                        {rel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">Primary Contact</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.canPickup}
                    onChange={(e) => setFormData({ ...formData, canPickup: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">Can Pickup Student</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.checked })}
                    className="h-4 w-4"
                  />
                  <span className="text-sm font-medium">Emergency Contact</span>
                </label>
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingId ? 'Update Guardian' : 'Add Guardian'}
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

        {/* Add Button & Search */}
        {!isAdding && (
          <div className="flex flex-wrap gap-4 mb-6">
            <Button
              onClick={() => setIsAdding(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Guardian
            </Button>

            <Input
              placeholder="Search by guardian or student name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />

            <select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="ALL">All Students</option>
              {students.map((student: Student) => (
                <option key={student.id} value={student.id}>
                  {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Guardians List */}
        <div className="space-y-4">
          {filteredGuardians.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg text-gray-500">No guardians found</p>
              <p className="text-sm text-gray-400">Add a guardian relationship to get started</p>
            </Card>
          ) : (
            filteredGuardians.map((guardian: Guardian) => (
              <Card key={guardian.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-semibold">
                        {guardian.user.name || 'Unnamed User'}
                      </h3>
                      {guardian.relationship && (
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRelationshipColor(guardian.relationship)}`}>
                          {guardian.relationship}
                        </span>
                      )}
                      {guardian.isPrimary && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          PRIMARY
                        </span>
                      )}
                      {guardian.emergencyContact && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          EMERGENCY
                        </span>
                      )}
                      {guardian.canPickup && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          CAN PICKUP
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Student</p>
                        <p className="font-medium">
                          {guardian.student.firstName} {guardian.student.lastName}
                        </p>
                        <p className="text-gray-500 text-xs">{guardian.student.enrollmentNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Contact</p>
                        {guardian.user.email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-gray-400" />
                            <p className="text-xs">{guardian.user.email}</p>
                          </div>
                        )}
                        {guardian.user.phoneNumber && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-gray-400" />
                            <p className="text-xs">{guardian.user.phoneNumber}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(guardian)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(guardian.id)}
                    >
                      <Trash2 className="h-4 w-4" />
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
