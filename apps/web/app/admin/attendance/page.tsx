'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { axiosInstance } from '@/lib/axios';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  Filter,
  Download
} from 'lucide-react';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  currentLevel: number;
}

interface Batch {
  id: number;
  name: string;
  students: Student[];
}

interface Attendance {
  id: number;
  student: Student;
  batch: Batch;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  note?: string;
}

interface AttendanceStats {
  totalPresent: number;
  totalAbsent: number;
  totalLate: number;
  totalExcused: number;
  attendanceRate: number;
}

export default function AttendancePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Map<number, string>>(new Map());

  const { data: batches, isLoading: loadingBatches } = useQuery<Batch[]>({
    queryKey: ['batches-with-students'],
    queryFn: async () => {
      const response = await axiosInstance.get('/batches?page=1&limit=1000');
      const batchesData = Array.isArray(response.data) ? response.data : response.data?.items || [];
      
      // Fetch students for each batch
      const batchesWithStudents = await Promise.all(
        batchesData.map(async (batch: Batch) => {
          try {
            const studentsRes = await axiosInstance.get(`/batches/${batch.id}/students`);
            const students = Array.isArray(studentsRes.data) ? studentsRes.data : studentsRes.data?.items || [];
            return { ...batch, students };
          } catch {
            return { ...batch, students: [] };
          }
        })
      );
      
      return batchesWithStudents;
    },
  });

  const { data: existingAttendance } = useQuery<Attendance[]>({
    queryKey: ['attendance', selectedBatch, selectedDate],
    queryFn: async () => {
      if (!selectedBatch || !selectedDate) return [];
      const response = await axiosInstance.get(
        `/attendance?batchId=${selectedBatch}&date=${selectedDate}`
      );
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!selectedBatch && !!selectedDate,
  });

  const { data: attendanceHistory } = useQuery<Attendance[]>({
    queryKey: ['attendance-history', selectedBatch],
    queryFn: async () => {
      if (!selectedBatch) return [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const response = await axiosInstance.get(
        `/attendance?batchId=${selectedBatch}&startDate=${startDate.toISOString().split('T')[0]}&endDate=${new Date().toISOString().split('T')[0]}`
      );
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!selectedBatch,
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async (data: Array<{ studentId: number; status: string; note?: string }>) => {
      await axiosInstance.post('/attendance/bulk', {
        batchId: selectedBatch,
        date: selectedDate,
        attendances: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['attendance-history'] });
      alert('Attendance marked successfully!');
      setAttendanceData(new Map());
    },
    onError: () => {
      alert('Failed to mark attendance');
    },
  });

  const handleMarkAttendance = () => {
    if (!selectedBatch || !selectedDate) {
      alert('Please select batch and date');
      return;
    }

    const selectedBatchData = batches?.find(b => b.id === selectedBatch);
    if (!selectedBatchData?.students?.length) {
      alert('No students in selected batch');
      return;
    }

    const attendances = selectedBatchData.students.map(student => ({
      studentId: student.id,
      status: attendanceData.get(student.id) || 'PRESENT',
      note: '',
    }));

    if (confirm(`Mark attendance for ${attendances.length} students?`)) {
      markAttendanceMutation.mutate(attendances);
    }
  };

  const toggleStudentStatus = (studentId: number, currentStatus?: string) => {
    const statuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
    const currentIndex = currentStatus ? statuses.indexOf(currentStatus) : -1;
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
    
    const newData = new Map(attendanceData);
    newData.set(studentId, nextStatus);
    setAttendanceData(newData);
  };

  const calculateStats = (): AttendanceStats => {
    const history = attendanceHistory || [];
    return {
      totalPresent: history.filter(a => a.status === 'PRESENT').length,
      totalAbsent: history.filter(a => a.status === 'ABSENT').length,
      totalLate: history.filter(a => a.status === 'LATE').length,
      totalExcused: history.filter(a => a.status === 'EXCUSED').length,
      attendanceRate: history.length > 0
        ? (history.filter(a => a.status === 'PRESENT').length / history.length) * 100
        : 0,
    };
  };

  const stats = calculateStats();
  const selectedBatchData = batches?.find(b => b.id === selectedBatch);

  if (loadingBatches) {
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
            Attendance Management
          </h1>
          <p className="text-gray-600 mt-1">Mark and track student attendance</p>
        </div>
      </div>

      {/* Stats Cards */}
      {selectedBatch && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700">Present</p>
                  <p className="text-2xl font-bold text-green-800">{stats.totalPresent}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-700">Absent</p>
                  <p className="text-2xl font-bold text-red-800">{stats.totalAbsent}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-yellow-700">Late</p>
                  <p className="text-2xl font-bold text-yellow-800">{stats.totalLate}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700">Excused</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.totalExcused}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-700">Attendance Rate</p>
                  <p className="text-2xl font-bold text-purple-800">{stats.attendanceRate.toFixed(1)}%</p>
                </div>
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Select Batch *</label>
              <select
                value={selectedBatch || ''}
                onChange={(e) => setSelectedBatch(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a batch</option>
                {batches?.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name} ({batch.students?.length || 0} students)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Date *</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mark Attendance */}
      {selectedBatch && selectedBatchData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Mark Attendance - {selectedBatchData.name}</CardTitle>
              <Button
                onClick={handleMarkAttendance}
                disabled={markAttendanceMutation.isPending}
                className="bg-gradient-to-r from-blue-500 to-purple-500"
              >
                {markAttendanceMutation.isPending ? 'Saving...' : 'Save Attendance'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {selectedBatchData.students && selectedBatchData.students.length > 0 ? (
              <div className="space-y-2">
                {selectedBatchData.students.map((student) => {
                  const existing = existingAttendance?.find(a => a.student.id === student.id);
                  const currentStatus = attendanceData.get(student.id) || existing?.status || 'PRESENT';
                  
                  return (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <p className="font-medium">
                          {student.firstName} {student.lastName}
                        </p>
                        <p className="text-sm text-gray-500">Level {student.currentLevel}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => toggleStudentStatus(student.id, currentStatus)}
                          className={
                            currentStatus === 'PRESENT'
                              ? 'bg-green-500 hover:bg-green-600'
                              : currentStatus === 'ABSENT'
                              ? 'bg-red-500 hover:bg-red-600'
                              : currentStatus === 'LATE'
                              ? 'bg-yellow-500 hover:bg-yellow-600'
                              : 'bg-blue-500 hover:bg-blue-600'
                          }
                        >
                          {currentStatus}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p>No students in this batch</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Attendance */}
      {selectedBatch && attendanceHistory && attendanceHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Student</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {attendanceHistory.slice(0, 20).map((attendance) => (
                    <tr key={attendance.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {attendance.student.firstName} {attendance.student.lastName}
                      </td>
                      <td className="px-4 py-3">
                        {new Date(attendance.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            attendance.status === 'PRESENT'
                              ? 'bg-green-100 text-green-700'
                              : attendance.status === 'ABSENT'
                              ? 'bg-red-100 text-red-700'
                              : attendance.status === 'LATE'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {attendance.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {attendance.note || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
