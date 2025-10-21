'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import Loading from '@/app/loading';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  Download
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface AttendanceRecord {
  id: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  studentId: number;
  studentName: string;
}

interface Student {
  id: number;
  name: string;
  attendanceRecords: AttendanceRecord[];
  stats: {
    present: number;
    absent: number;
    late: number;
    excused: number;
    percentage: number;
  };
}

interface AttendanceData {
  children: Student[];
}

export default function ParentAttendancePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ['parentAttendance', selectedMonth],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<AttendanceData>('/parents/children');
        return data;
      } catch {
        return { children: [] };
      }
    },
    enabled: Boolean(user),
  });

  if (authLoading || dataLoading) {
    return <Loading />;
  }

  const children = data?.children || [];
  const activeStudent = selectedStudent 
    ? children.find(c => c.id === selectedStudent) 
    : children[0];

  // Calendar calculations
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const previousMonth = () => {
    setSelectedMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setSelectedMonth(new Date(year, month + 1, 1));
  };

  // Status colors
  const statusColors = {
    PRESENT: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' },
    ABSENT: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
    LATE: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    EXCUSED: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-300' },
  };

  // Pie chart data
  const pieData = activeStudent ? [
    { name: 'Present', value: activeStudent.stats.present, color: '#10b981' },
    { name: 'Absent', value: activeStudent.stats.absent, color: '#ef4444' },
    { name: 'Late', value: activeStudent.stats.late, color: '#f59e0b' },
    { name: 'Excused', value: activeStudent.stats.excused, color: '#3b82f6' },
  ] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Attendance Tracker
        </h1>
        <p className="text-gray-600">Monitor your children&apos;s attendance patterns and records</p>
      </div>

      {/* Student Selector */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Select Student</h2>
          <button className="flex items-center gap-2 px-4 py-2 border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all">
            <Download className="w-4 h-4" />
            Download Report
          </button>
        </div>
        <div className="flex gap-3 flex-wrap">
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedStudent(child.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                (selectedStudent === child.id || (!selectedStudent && child === children[0]))
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {child.name}
            </button>
          ))}
        </div>
      </div>

      {activeStudent && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Present</p>
                  <p className="text-2xl font-bold text-green-600">{activeStudent.stats.present}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{activeStudent.stats.absent}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Late</p>
                  <p className="text-2xl font-bold text-yellow-600">{activeStudent.stats.late}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  activeStudent.stats.percentage >= 75 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <TrendingUp className={`w-6 h-6 ${
                    activeStudent.stats.percentage >= 75 ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Attendance Rate</p>
                  <p className={`text-2xl font-bold ${
                    activeStudent.stats.percentage >= 75 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {activeStudent.stats.percentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar and Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Calendar */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-purple-600" />
                  Monthly Calendar
                </h2>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={previousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                    title="Previous month"
                    aria-label="Go to previous month"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="font-semibold text-gray-800 min-w-[150px] text-center">
                    {selectedMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </span>
                  <button 
                    onClick={nextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                    title="Next month"
                    aria-label="Go to next month"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center font-semibold text-gray-600 text-sm py-2">
                    {day}
                  </div>
                ))}
                
                {/* Empty cells before first day */}
                {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                
                {/* Calendar days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const date = new Date(year, month, day);
                  const dateStr = date.toISOString().split('T')[0];
                  const record = activeStudent.attendanceRecords?.find(
                    r => r.date.startsWith(dateStr)
                  );
                  const status = record?.status;
                  const colors = status ? statusColors[status] : { bg: 'bg-gray-50', text: 'text-gray-800', border: 'border-gray-200' };

                  return (
                    <div
                      key={day}
                      className={`aspect-square flex items-center justify-center rounded-lg border-2 ${colors.bg} ${colors.border} ${colors.text} font-semibold text-sm transition-all hover:shadow-md cursor-pointer`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 pt-6 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100 border-2 border-green-300"></div>
                  <span className="text-sm text-gray-600">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-100 border-2 border-red-300"></div>
                  <span className="text-sm text-gray-600">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-100 border-2 border-yellow-300"></div>
                  <span className="text-sm text-gray-600">Late</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-blue-100 border-2 border-blue-300"></div>
                  <span className="text-sm text-gray-600">Excused</span>
                </div>
              </div>
            </div>

            {/* Pie Chart */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => {
                      const total = pieData.reduce((sum, item) => sum + item.value, 0);
                      const percent = ((entry.value / total) * 100).toFixed(0);
                      return `${entry.name}: ${percent}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {/* Empty State */}
      {children.length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-12 h-12 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Attendance Data</h2>
          <p className="text-gray-600">No children found or no attendance records available.</p>
        </div>
      )}
    </div>
  );
}
