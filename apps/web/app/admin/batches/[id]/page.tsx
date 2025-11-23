'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { axiosInstance } from '@/lib/axios';
import Link from 'next/link';

interface Student {
  id: number;
  firstName: string;
  lastName?: string;
  email?: string;
  currentLevel: number;
  age?: number;
  parentName?: string;
  parentPhone?: string;
}

interface Batch {
  id: number;
  name: string;
  level: {
    id: number;
    name: string;
  };
  teacher?: {
    user: {
      name: string;
    };
  };
  timeSlot: string;
  capacity?: number;
  _count?: {
    students: number;
  };
}

export default function BatchViewPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const batchId = parseInt(resolvedParams.id);

  const { data: batch, isLoading: loadingBatch } = useQuery<Batch>({
    queryKey: ['batch', batchId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/batches/${batchId}`);
      return response.data as Batch;
    },
  });

  const { data: studentsData, isLoading: loadingStudents } = useQuery<{ items: Student[]; total: number }>({
    queryKey: ['batch-students', batchId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/batches/${batchId}/students?page=1&limit=100`);
      return response.data as { items: Student[]; total: number };
    },
  });

  const removeStudentMutation = useMutation({
    mutationFn: async (studentId: number) => {
      await axiosInstance.delete(`/batches/${batchId}/remove-student/${studentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batch-students', batchId] });
      queryClient.invalidateQueries({ queryKey: ['batch', batchId] });
      alert('Student removed from batch successfully');
    },
    onError: () => {
      alert('Failed to remove student');
    },
  });

  if (loadingBatch || loadingStudents) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <h3 className="text-red-800 font-semibold mb-2">⚠️ Batch Not Found</h3>
            <Button onClick={() => router.push('/admin/batches')}>Back to Batches</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const students = studentsData?.items || [];

  return (
    <div className="p-6 space-y-6">
      {/* Batch Details Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{batch.name}</CardTitle>
          <div className="flex gap-2">
            <Link href={`/admin/batches/${batchId}/edit`}>
              <Button variant="outline">Edit Batch</Button>
            </Link>
            <Button variant="outline" onClick={() => router.push('/admin/batches')}>
              Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Level</p>
              <p className="font-semibold">{batch.level.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Teacher</p>
              <p className="font-semibold">{batch.teacher?.user?.name || 'Not Assigned'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Time Slot</p>
              <p className="font-semibold">{batch.timeSlot}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Capacity</p>
              <p className="font-semibold">
                {batch._count?.students || students.length} / {batch.capacity || 'Unlimited'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <Card>
        <CardHeader>
          <CardTitle>Enrolled Students ({students.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No students enrolled in this batch yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Age</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Level</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Parent Contact</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map((student: Student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {student.firstName} {student.lastName}
                      </td>
                      <td className="px-4 py-3">{student.age || 'N/A'}</td>
                      <td className="px-4 py-3">Level {student.currentLevel}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div>{student.parentName}</div>
                          <div className="text-gray-500">{student.parentPhone}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Link href={`/admin/students/${student.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (confirm('Remove student from this batch?')) {
                                removeStudentMutation.mutate(student.id);
                              }
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
