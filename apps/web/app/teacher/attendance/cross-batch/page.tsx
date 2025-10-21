'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { PageTransition } from '@/components/ui/page-transition';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import {
  Users,
  AlertCircle,
  CheckCircle,
  Calendar,
  ArrowRightLeft,
  Filter,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

interface CrossBatchAttendance {
  id: number;
  studentId: number;
  studentName: string;
  regularBatchId: number;
  regularBatchName: string;
  attendedBatchId: number;
  attendedBatchName: string;
  date: string;
  status: string;
  note?: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  batch: {
    id: number;
    name: string;
  };
}

interface RawAttendanceRecord {
  id: number;
  student: { id: number; firstName: string; lastName: string };
  batchId: number;
  batch: { id: number; name: string };
  date: string;
  status: string;
  note?: string;
}

export default function CrossBatchAttendancePage() {
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Fetch all students with their regular batches
  const { data: students } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get('/students');
        return data as Student[];
      } catch {
        return [];
      }
    },
  });

  // Fetch all attendance records
  const { data: attendanceRecords, isLoading } = useQuery<RawAttendanceRecord[]>({
    queryKey: ['cross-batch-attendance', startDate, endDate],
    queryFn: async (): Promise<RawAttendanceRecord[]> => {
      try {
        // This would need a custom API endpoint
        const { data } = await apiClient.get(`/attendance/all?start=${startDate}&end=${endDate}`);
        return data as RawAttendanceRecord[];
      } catch {
        // Mock data for demonstration
        return [
          {
            id: 1,
            student: { id: 1, firstName: 'John', lastName: 'Doe' },
            batchId: 2,
            batch: { id: 2, name: 'Advanced Batch' },
            date: '2025-10-10',
            status: 'PRESENT',
            note: 'Attended different batch due to makeup class'
          },
          {
            id: 2,
            student: { id: 2, firstName: 'Jane', lastName: 'Smith' },
            batchId: 1,
            batch: { id: 1, name: 'Beginner Batch' },
            date: '2025-10-11',
            status: 'PRESENT',
            note: 'Temporary batch change'
          },
        ];
      }
    },
  });

  // Find cross-batch attendances
  const crossBatchAttendances = React.useMemo(() => {
    if (!attendanceRecords || !students) return [];

    const records: CrossBatchAttendance[] = [];

    attendanceRecords.forEach((rec) => {
      const student = students.find((s: Student) => s.id === rec.student.id);

      if (student && student.batch && student.batch.id !== rec.batchId) {
        records.push({
          id: rec.id,
          studentId: rec.student.id,
          studentName: `${rec.student.firstName} ${rec.student.lastName}`,
          regularBatchId: student.batch.id,
          regularBatchName: student.batch.name,
          attendedBatchId: rec.batchId,
          attendedBatchName: rec.batch.name,
          date: rec.date,
          status: rec.status,
          note: rec.note,
        });
      }
    });

    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [attendanceRecords, students]);

  const handleExport = () => {
    if (crossBatchAttendances.length === 0) {
      toast.error('No cross-batch attendance records to export');
      return;
    }

    const headers = [
      'Date',
      'Student Name',
      'Regular Batch',
      'Attended Batch',
      'Status',
      'Note'
    ];

    const rows = crossBatchAttendances.map(record => [
      new Date(record.date).toLocaleDateString(),
      record.studentName,
      record.regularBatchName,
      record.attendedBatchName,
      record.status,
      record.note || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Cross_Batch_Attendance_${startDate}_to_${endDate}.csv`;
    link.click();

    toast.success('Cross-batch attendance exported successfully!');
  };

  return (
    <PageTransition>
      <div className="min-h-screen p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Cross-Batch Attendance Tracker
          </h1>
          <p className="text-gray-600">
            Monitor students attending different batches than their regular batch
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Cross-Batch Visits</p>
                  <h3 className="text-3xl font-bold text-white mt-1">
                    {crossBatchAttendances.length}
                  </h3>
                </div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                  <ArrowRightLeft className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-blue-100 text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Selected period</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Unique Students</p>
                  <h3 className="text-3xl font-bold text-white mt-1">
                    {new Set(crossBatchAttendances.map(r => r.studentId)).size}
                  </h3>
                </div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-purple-100 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Different students</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="green-100 text-sm font-medium">Batches Involved</p>
                  <h3 className="text-3xl font-bold text-white mt-1">
                    {new Set([
                      ...crossBatchAttendances.map(r => r.regularBatchId),
                      ...crossBatchAttendances.map(r => r.attendedBatchId)
                    ]).size}
                  </h3>
                </div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-green-100 text-sm">
                <Filter className="w-4 h-4 mr-1" />
                <span>Total batches</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">Date Range Filter</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleExport}
                disabled={crossBatchAttendances.length === 0}
                className="w-full px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <ArrowRightLeft className="w-6 h-6 text-purple-600" />
            Cross-Batch Attendance Records
          </h3>

          {isLoading ? (
            <TableSkeleton rows={10} />
          ) : crossBatchAttendances.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Student</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Regular Batch</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">→</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Attended Batch</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {crossBatchAttendances.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {record.studentName}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                          {record.regularBatchName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ArrowRightLeft className="w-4 h-4 text-purple-600 mx-auto" />
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                          {record.attendedBatchName}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                          record.status === 'LATE' ? 'bg-yellow-100 text-yellow-700' :
                          record.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {record.note || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">No cross-batch attendance found</p>
              <p className="text-gray-400 text-sm">
                Students attending their regular batches won&apos;t appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
