'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardSkeleton, TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { toast } from '@/components/ui/use-toast';
import MainLayout from '@/components/layout/main-layout';
import { axiosInstance } from '@/lib/axios';

interface Batch {
  id: number;
  name: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
}

interface AttendanceEntry {
  studentId: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  note?: string;
}

export default function MarkAttendancePage() {
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [entries, setEntries] = useState<Map<number, AttendanceEntry>>(new Map());
  
  const queryClient = useQueryClient();

  const { data: batches, isLoading: loadingBatches } = useQuery<Batch[]>({
    queryKey: ['batches'],
    queryFn: async () => {
      const res = await axiosInstance.get<Batch[] | { data: Batch[] }>('/batches');
      // Handle both array and object responses
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    }
  });

  const { data: students, isLoading: loadingStudents } = useQuery<Student[]>({
    queryKey: ['students', selectedBatch],
    queryFn: async () => {
      const res = await axiosInstance.get<Student[] | { data: Student[] }>(`/students?batchId=${selectedBatch}`);
      // Handle both array and object responses
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    },
    enabled: !!selectedBatch
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async (data: { batchId: number; date: string; entries: AttendanceEntry[] }) => {
      const res = await axiosInstance.post('/attendance/batch', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast.success('Attendance marked successfully');
      // Reset the form
      setEntries(new Map());
    },
    onError: () => {
      toast.error('Failed to mark attendance');
    }
  });

  const handleStatusChange = (studentId: number, status: AttendanceEntry['status']) => {
    setEntries(prev => new Map(prev).set(studentId, { studentId, status }));
  };

  const handleSubmit = () => {
    if (!selectedBatch) return;

    markAttendanceMutation.mutate({
      batchId: selectedBatch,
      date: selectedDate,
      entries: Array.from(entries.values())
    });
  };

  if (loadingBatches) {
    return (
      <MainLayout>
        <div className="p-6 max-w-3xl mx-auto">
          <CardSkeleton />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Batch Selection */}
              <div>
                <label className="block text-sm font-medium mb-1">Select Batch</label>
                <select
                  className="w-full rounded-md border border-input p-2"
                  value={selectedBatch || ''}
                  onChange={(e) => setSelectedBatch(Number(e.target.value))}
                  title="Select a batch"
                >
                  <option value="">Select a batch</option>
                  {batches?.map(batch => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection */}
              <div>
                <label htmlFor="attendanceDate" className="block text-sm font-medium mb-1">Date</label>
                <input
                  id="attendanceDate"
                  type="date"
                  className="w-full rounded-md border border-input p-2"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>

              {/* Students List */}
              {selectedBatch && (
                <div className="space-y-4 mt-4">
                  {loadingStudents ? (
                    <TableSkeleton rows={5} />
                  ) : (
                    students?.map(student => (
                      <div key={student.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="flex gap-2">
                          {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map(status => (
                            <label key={status} className="inline-flex items-center">
                              <input
                                type="radio"
                                name={`attendance-${student.id}`}
                                value={status}
                                checked={entries.get(student.id)?.status === status}
                                onChange={() => handleStatusChange(student.id, status)}
                                className="mr-1"
                              />
                              {status.charAt(0)}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                  
                  {students && students.length > 0 && (
                    <Button
                      onClick={handleSubmit}
                      disabled={markAttendanceMutation.isPending}
                      className="w-full mt-4"
                    >
                      {markAttendanceMutation.isPending ? 'Saving...' : 'Save Attendance'}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}