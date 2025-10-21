'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import MainLayout from '@/components/layout/main-layout';
import { axiosInstance } from '@/lib/axios';

interface AttendanceRecord {
  id: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  note?: string;
  student: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

interface Batch {
  id: number;
  name: string;
}

type DateRange = '7days' | '30days' | 'thisMonth';

export default function AttendanceViewPage() {
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('7days');

  const { data: batches, isLoading: loadingBatches } = useQuery<Batch[]>({
    queryKey: ['batches'],
    queryFn: async () => {
      const res = await axiosInstance.get<Batch[] | { data: Batch[] }>('/batches');
      return Array.isArray(res.data) ? res.data : (res.data.data || []);
    }
  });

  const { data: attendance, isLoading: loadingAttendance } = useQuery({
    queryKey: ['attendance', selectedBatch, dateRange],
    queryFn: async () => {
      const res = await axiosInstance.get<AttendanceRecord[] | { data: AttendanceRecord[] }>(`/attendance/batch/${selectedBatch}`);
      return Array.isArray(res.data) ? res.data : (res.data.data || []);
    },
    enabled: !!selectedBatch
  });

  const getDateRangeFilter = () => {
    const today = new Date();
    switch (dateRange) {
      case '7days':
        return {
          start: subDays(today, 7),
          end: today
        };
      case '30days':
        return {
          start: subDays(today, 30),
          end: today
        };
      case 'thisMonth':
        return {
          start: startOfMonth(today),
          end: endOfMonth(today)
        };
    }
  };

  const filteredAttendance = attendance?.filter((record: AttendanceRecord) => {
    const range = getDateRangeFilter();
    const recordDate = new Date(record.date);
    return recordDate >= range.start && recordDate <= range.end;
  });

  const calculateStatistics = () => {
    if (!filteredAttendance) return null;

    const total = filteredAttendance.length;
    const present = filteredAttendance.filter((r: AttendanceRecord) => r.status === 'PRESENT').length;
    const absent = filteredAttendance.filter((r: AttendanceRecord) => r.status === 'ABSENT').length;
    const late = filteredAttendance.filter((r: AttendanceRecord) => r.status === 'LATE').length;
    const excused = filteredAttendance.filter((r: AttendanceRecord) => r.status === 'EXCUSED').length;

    return {
      total,
      present,
      absent,
      late,
      excused,
      attendanceRate: total > 0 ? ((present + late) / total) * 100 : 0
    };
  };

  const stats = calculateStatistics();

  const getStatusColor = (status: AttendanceRecord['status']) => {
    switch (status) {
      case 'PRESENT':
        return 'text-green-600';
      case 'ABSENT':
        return 'text-red-600';
      case 'LATE':
        return 'text-yellow-600';
      case 'EXCUSED':
        return 'text-blue-600';
      default:
        return '';
    }
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Attendance Records</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Batch</CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Date Range</CardTitle>
            </CardHeader>
            <CardContent>
              <select
                className="w-full rounded-md border border-input p-2"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                title="Select date range"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
              </select>
            </CardContent>
          </Card>

          {stats && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-sm text-gray-500">
                    Attendance Rate: {stats.attendanceRate.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Status Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-green-600">Present:</span>
                      <span>{stats.present}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-red-600">Absent:</span>
                      <span>{stats.absent}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-yellow-600">Late:</span>
                      <span>{stats.late}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-600">Excused:</span>
                      <span>{stats.excused}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Log</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingAttendance || loadingBatches ? (
              <div className="p-4">
                <TableSkeleton rows={10} />
              </div>
            ) : filteredAttendance?.length ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Date</th>
                      <th className="px-4 py-2 text-left">Student</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.map((record) => (
                      <tr key={record.id} className="border-t">
                        <td className="px-4 py-2">
                          {format(new Date(record.date), 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-2">
                          {record.student.firstName} {record.student.lastName}
                        </td>
                        <td className={`px-4 py-2 ${getStatusColor(record.status)}`}>
                          {record.status}
                        </td>
                        <td className="px-4 py-2 text-gray-500">
                          {record.note || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No attendance records found for the selected criteria
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}