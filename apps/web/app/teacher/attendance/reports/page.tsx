'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { BarChart3, Download, Calendar, FileText, TrendingUp, Users } from 'lucide-react';
import { axiosInstance } from '@/lib/axios';

interface Batch {
  id: number;
  name: string;
}

interface AttendanceReport {
  studentId: number;
  studentName: string;
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendanceRate: number;
}

type ReportPeriod = 'thisMonth' | 'lastMonth' | 'custom';

export default function AttendanceReportsPage() {
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [period, setPeriod] = useState<ReportPeriod>('thisMonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const { data: batches, isLoading: loadingBatches } = useQuery<Batch[]>({
    queryKey: ['batches'],
    queryFn: async () => {
      const res = await axiosInstance.get<Batch[] | { data: Batch[] }>('/batches');
      return Array.isArray(res.data) ? res.data : (res.data.data || []);
    }
  });

  interface AttendanceRecord {
    id: number;
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    studentId?: number;
    student?: { id: number; firstName: string; lastName: string } | null;
  }

  const { data: attendanceRecords, isLoading: loadingRecords } = useQuery<AttendanceRecord[]>({
    queryKey: ['attendance-records', selectedBatch],
    queryFn: async () => {
      const res = await axiosInstance.get<AttendanceRecord[] | { data: AttendanceRecord[] }>(`/attendance/batch/${selectedBatch}`);
      return Array.isArray(res.data) ? res.data : (res.data?.data || []);
    },
    enabled: !!selectedBatch
  });

  const getDateRange = () => {
    const today = new Date();
    switch (period) {
      case 'thisMonth':
        return {
          start: startOfMonth(today),
          end: endOfMonth(today)
        };
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        return {
          start: startOfMonth(lastMonth),
          end: endOfMonth(lastMonth)
        };
      case 'custom':
        return {
          start: startDate ? new Date(startDate) : startOfMonth(today),
          end: endDate ? new Date(endDate) : endOfMonth(today)
        };
    }
  };

  const generateReport = (): AttendanceReport[] => {
    if (!attendanceRecords) return [];

    const range = getDateRange();
    const filteredRecords = attendanceRecords.filter((record: any) => {
      const recordDate = new Date(record.date);
      return recordDate >= range.start && recordDate <= range.end;
    });

    // Group by student
    const studentMap = new Map<number, any>();
    
    filteredRecords.forEach((record: any) => {
      const studentId = record.student?.id || record.studentId;
      const studentName = record.student ? 
        `${record.student.firstName} ${record.student.lastName}` : 
        'Unknown Student';

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          studentId,
          studentName,
          totalClasses: 0,
          present: 0,
          absent: 0,
          late: 0,
          excused: 0
        });
      }

      const stats = studentMap.get(studentId);
      stats.totalClasses++;

      switch (record.status) {
        case 'PRESENT':
          stats.present++;
          break;
        case 'ABSENT':
          stats.absent++;
          break;
        case 'LATE':
          stats.late++;
          break;
        case 'EXCUSED':
          stats.excused++;
          break;
      }
    });

    // Calculate attendance rate
    const report = Array.from(studentMap.values()).map(stats => ({
      ...stats,
      attendanceRate: stats.totalClasses > 0 
        ? ((stats.present + stats.late) / stats.totalClasses) * 100 
        : 0
    }));

    return report.sort((a, b) => b.attendanceRate - a.attendanceRate);
  };

  const report = generateReport();

  const calculateOverallStats = () => {
    if (report.length === 0) return null;

    const totalStudents = report.length;
    const avgAttendanceRate = report.reduce((sum, s) => sum + s.attendanceRate, 0) / totalStudents;
    const totalPresent = report.reduce((sum, s) => sum + s.present, 0);
    const totalAbsent = report.reduce((sum, s) => sum + s.absent, 0);
    const totalLate = report.reduce((sum, s) => sum + s.late, 0);

    return {
      totalStudents,
      avgAttendanceRate,
      totalPresent,
      totalAbsent,
      totalLate,
      totalClasses: report[0]?.totalClasses || 0
    };
  };

  const stats = calculateOverallStats();

  const exportToCSV = () => {
    if (report.length === 0) return;

    const headers = ['Student Name', 'Total Classes', 'Present', 'Absent', 'Late', 'Excused', 'Attendance Rate (%)'];
    const csvContent = [
      headers.join(','),
      ...report.map(r => [
        r.studentName,
        r.totalClasses,
        r.present,
        r.absent,
        r.late,
        r.excused,
        r.attendanceRate.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-purple-600" />
            Attendance Reports & Analytics
          </h1>
          <p className="text-gray-600 mt-1">Generate and analyze attendance data</p>
        </div>
        {report.length > 0 && (
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Report Configuration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Batch Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Batch *
            </label>
            <select
              value={selectedBatch || ''}
              onChange={(e) => setSelectedBatch(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={loadingBatches}
            >
              <option value="">Choose a batch...</option>
              {batches?.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
          </div>

          {/* Period Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {/* Custom Date Range */}
          {period === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Overall Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <Users className="w-4 h-4" />
              Total Students
            </div>
            <div className="text-3xl font-bold text-gray-800">{stats.totalStudents}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <TrendingUp className="w-4 h-4" />
              Avg Attendance
            </div>
            <div className="text-3xl font-bold text-green-600">{stats.avgAttendanceRate.toFixed(1)}%</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <FileText className="w-4 h-4" />
              Total Classes
            </div>
            <div className="text-3xl font-bold text-blue-600">{stats.totalClasses}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center gap-2 text-gray-600 text-sm mb-1">
              <BarChart3 className="w-4 h-4" />
              Absent Rate
            </div>
            <div className="text-3xl font-bold text-red-600">
              {((stats.totalAbsent / (stats.totalStudents * stats.totalClasses)) * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      )}

      {/* Report Table */}
      {loadingRecords ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading report data...</p>
        </div>
      ) : report.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Student Name
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Total Classes
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Present
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Late
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Excused
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Attendance Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.map((student) => (
                  <tr key={student.studentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{student.studentName}</td>
                    <td className="px-6 py-4 text-center text-gray-600">{student.totalClasses}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                        {student.present}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                        {student.absent}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                        {student.late}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {student.excused}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              student.attendanceRate >= 90
                                ? 'bg-green-500'
                                : student.attendanceRate >= 75
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${student.attendanceRate}%` }}
                          />
                        </div>
                        <span className="font-semibold text-gray-800">
                          {student.attendanceRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Data Available</h3>
          <p className="text-gray-600">
            {selectedBatch
              ? 'No attendance records found for the selected batch and period'
              : 'Please select a batch to generate the report'}
          </p>
        </div>
      )}
    </div>
  );
}
