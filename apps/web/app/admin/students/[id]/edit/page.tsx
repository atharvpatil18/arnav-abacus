'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Student } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const studentId = params.id as string;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    email: '',
    parentName: '',
    parentPhone: '',
    currentLevel: 1,
    batchId: null as number | null,
    joiningDate: '',
  });

  // Fetch student data
  const { data: student, isLoading } = useQuery<Student>({
    queryKey: ['student', studentId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/students/${studentId}`);
      return response.data as Student;
    },
  });

  // Fetch batches for dropdown
  const { data: batches } = useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const response = await axiosInstance.get('/batches?page=1&limit=1000');
      const data = response.data as { items?: unknown[]; data?: unknown[] } | unknown[];
      if (data && typeof data === 'object' && 'items' in data) return data.items;
      if (data && typeof data === 'object' && 'data' in data) return data.data;
      return Array.isArray(data) ? data : [];
    },
  });

  // Initialize form with student data
  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName,
        lastName: student.lastName || '',
        dob: student.dob ? student.dob.split('T')[0] : '',
        email: student.email || '',
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        currentLevel: student.currentLevel,
        batchId: student.batchId,
        joiningDate: student.joiningDate.split('T')[0],
      });
    }
  }, [student]);

  const updateMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const payload = {
        ...data,
        batchId: data.batchId ? Number(data.batchId) : null,
        currentLevel: Number(data.currentLevel),
      };
      return await axiosInstance.put(`/students/${studentId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      router.push(`/admin/students/${studentId}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <p>Loading...</p>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Student Not Found</h2>
          <Button onClick={() => router.push('/admin/students')}>Back to Students</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Edit Student</h1>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="dob" className="block text-sm font-medium mb-1">
                  Date of Birth
                </label>
                <input
                  id="dob"
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Parent Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="parentName" className="block text-sm font-medium mb-1">
                  Parent Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="parentName"
                  type="text"
                  name="parentName"
                  required
                  value={formData.parentName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="parentPhone" className="block text-sm font-medium mb-1">
                  Parent Phone <span className="text-red-500">*</span>
                </label>
                <input
                  id="parentPhone"
                  type="tel"
                  name="parentPhone"
                  required
                  value={formData.parentPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Academic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="currentLevel" className="block text-sm font-medium mb-1">
                  Current Level <span className="text-red-500">*</span>
                </label>
                <input
                  id="currentLevel"
                  type="number"
                  name="currentLevel"
                  required
                  min="1"
                  value={formData.currentLevel}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="batchId" className="block text-sm font-medium mb-1">
                  Batch
                </label>
                <select
                  id="batchId"
                  name="batchId"
                  value={formData.batchId || ''}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">No Batch</option>
                  {batches && Array.isArray(batches) && batches.map((batchItem: unknown) => {
                    const batch = batchItem as { id: number; name: string; level?: { name: string }; levelId?: number };
                    return (
                      <option key={batch.id} value={batch.id}>
                        {batch.name} - {batch.level?.name || `Level ${batch.levelId}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label htmlFor="joiningDate" className="block text-sm font-medium mb-1">
                  Joining Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="joiningDate"
                  type="date"
                  name="joiningDate"
                  required
                  value={formData.joiningDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            <Save className="h-4 w-4 mr-2" />
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </div>
  );
}
