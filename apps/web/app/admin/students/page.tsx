'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { GridSkeleton } from '@/components/ui/loading-skeleton';
import { axiosInstance } from '@/lib/axios';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  parentName: string;
  parentPhone: string;
  email: string;
  currentLevel: number;
  batch?: { name: string };
  status: string;
}

export default function StudentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: students, isLoading } = useQuery<Student[], Error>({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await axiosInstance.get<Student[]>('/students');
      return response.data;
    },
  });

  const toggleStatusMutation = useMutation<void, unknown, number>({
    mutationFn: async (studentId: number) => {
      await axiosInstance.post(`/students/${studentId}/toggle-status`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Students</CardTitle>
          </CardHeader>
          <CardContent>
            <GridSkeleton items={9} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const studentsData = Array.isArray(students) ? students : [];
  const filteredStudents = studentsData.filter((s: Student) =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-6 animate-in fade-in">
      <Card className="shadow-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
            Students
          </CardTitle>
          <Button 
            onClick={() => router.push('/admin/students/create')}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Add New Student
          </Button>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search students..."
              className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Students Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student: Student) => (
              <Card key={student.id} className="card-hover shadow-lg animate-in slide-in-from-bottom">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-4 rounded-t-lg">
                  <h3 className="text-lg font-semibold mb-2">
                    {student.firstName} {student.lastName}
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium">Parent:</span> {student.parentName}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span> {student.parentPhone}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {student.email || 'N/A'}
                    </p>
                    <p>
                      <span className="font-medium">Level:</span> {student.currentLevel}
                    </p>
                    {student.batch && (
                      <p>
                        <span className="font-medium">Batch:</span> {student.batch.name}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Status:</span>{' '}
                      <span className={student.status === 'ACTIVE' ? 'text-green-200' : 'text-gray-300'}>
                        {student.status}
                      </span>
                    </p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => router.push(`/admin/students/${student.id}`)}
                      >
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => router.push(`/admin/students/${student.id}/edit`)}
                      >
                        Edit
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      className={`w-full ${
                        student.status === 'ACTIVE' 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                      onClick={() => toggleStatusMutation.mutate(student.id)}
                      disabled={toggleStatusMutation.isPending}
                    >
                      {toggleStatusMutation.isPending 
                        ? 'Updating...' 
                        : student.status === 'ACTIVE' 
                          ? 'Mark Inactive' 
                          : 'Mark Active'
                      }
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500 animate-in fade-in">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-lg font-medium">
                  {searchQuery ? 'No students found matching your search' : 'No students found'}
                </p>
                <p className="text-sm mt-2">
                  {searchQuery ? 'Try a different search term' : 'Add a new student to get started'}
                </p>
                {!searchQuery && (
                  <Button 
                    onClick={() => router.push('/admin/students/create')}
                    className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Add First Student
                  </Button>
                )}
              </div>
            )}
          </div>

          {studentsData.length === 0 && !searchQuery && (
            <div className="text-center py-8 text-gray-500">
              No students found. Add your first student to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}