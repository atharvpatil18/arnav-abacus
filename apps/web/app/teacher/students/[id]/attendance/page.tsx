'use client';

import { useQuery } from '@tanstack/react-query';
import { format, subMonths, isWeekend } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { CircularProgress } from '@/components/ui/circular-progress';
import MainLayout from '@/components/layout/main-layout';
import { axiosInstance } from '@/lib/axios';

interface AttendanceRecord {
  id: number;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  note?: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  batchName: string;
  attendance: AttendanceRecord[];
}

interface ApiResponse<T> {
  data: T;
}

export default function StudentAttendancePage(props: unknown) {
  const { params } = props as { params: { id: string } };
  // Fetch student details and attendance
  const { data: student, isLoading } = useQuery<Student>({
    queryKey: ['student', params.id, 'attendance'],
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<Student>>(`/students/${params.id}/attendance`);
      return res.data.data;
    }
  });

  // Calculate attendance statistics
  const calculateStats = (attendance: AttendanceRecord[]) => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'PRESENT').length;
    const absent = attendance.filter(a => a.status === 'ABSENT').length;
    const late = attendance.filter(a => a.status === 'LATE').length;
    const excused = attendance.filter(a => a.status === 'EXCUSED').length;

    return {
      total,
      present,
      absent,
      late,
      excused,
      attendanceRate: total > 0 ? ((present + late) / total) * 100 : 0
    };
  };

  // Generate attendance calendar data
  type CalendarStatus = AttendanceRecord['status'] | 'WEEKEND' | 'NO_DATA';
  interface CalendarDay {
    date: Date;
    status: CalendarStatus;
    note?: string;
  }

  const generateCalendarData = (): CalendarDay[] => {
    if (!student?.attendance) return [];

    const today = new Date();
    const threeMonthsAgo = subMonths(today, 3);
    
    // generate array of dates between start and end (inclusive)
    const days: Date[] = [];
    for (let dt = new Date(threeMonthsAgo); dt <= today; dt.setDate(dt.getDate() + 1)) {
      days.push(new Date(dt));
    }

    return days.map((day): CalendarDay => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const record = student.attendance.find(a => a.date === dateStr);
      const isWeekendDay = isWeekend(day);

      const status: CalendarStatus = record?.status || (isWeekendDay ? 'WEEKEND' : 'NO_DATA');

      return {
        date: day,
        status,
        note: record?.note
      };
    });
  };

  const getStatusColor = (status: AttendanceRecord['status'] | 'WEEKEND' | 'NO_DATA') => {
    switch (status) {
      case 'PRESENT':
        return 'bg-green-500';
      case 'ABSENT':
        return 'bg-red-500';
      case 'LATE':
        return 'bg-yellow-500';
      case 'EXCUSED':
        return 'bg-blue-500';
      case 'WEEKEND':
        return 'bg-gray-200';
      default:
        return 'bg-gray-100';
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center p-8">
          <CircularProgress />
        </div>
      </MainLayout>
    );
  }

  if (!student) {
    return (
      <MainLayout>
        <div className="p-6">
          <h1 className="text-xl text-gray-600">Student not found</h1>
        </div>
      </MainLayout>
    );
  }

  const stats = calculateStats(student.attendance);
  const calendarData = generateCalendarData();

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {student.firstName} {student.lastName}&apos;s Attendance
          </h1>
          <p className="text-gray-600">Batch: {student.batchName}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.attendanceRate.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Present Days</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.present}</div>
              <div className="text-sm text-gray-500">Out of {stats.total} days</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Absences</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.absent}</div>
              <div className="text-sm text-gray-500">Including excused</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Late Arrivals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.late}</div>
            </CardContent>
          </Card>
        </div>

        {/* Attendance Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Calendar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium p-2">
                  {day}
                </div>
              ))}
              {calendarData.map((day, index) => (
                <div
                  key={index}
                  className={`aspect-square rounded-md ${getStatusColor(day.status)} 
                    relative group cursor-pointer transition-colors`}
                  title={`${format(day.date, 'MMM d, yyyy')}: ${day.status}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center text-xs">
                    {format(day.date, 'd')}
                  </div>
                  {day.note && (
                    <div className="hidden group-hover:block absolute z-10 bottom-full left-1/2 transform -translate-x-1/2 p-2 bg-black text-white text-xs rounded whitespace-nowrap">
                      {day.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500"></div>
                <span className="text-sm">Present</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500"></div>
                <span className="text-sm">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500"></div>
                <span className="text-sm">Late</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-500"></div>
                <span className="text-sm">Excused</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-200"></div>
                <span className="text-sm">Weekend</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Attendance Records */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Date</th>
                    <th className="text-left p-2">Status</th>
                    <th className="text-left p-2">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {student.attendance
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .slice(0, 10)
                    .map((record) => (
                      <tr key={record.id} className="border-b">
                        <td className="p-2">
                          {format(new Date(record.date), 'MMM d, yyyy')}
                        </td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded text-sm ${
                            record.status === 'PRESENT' ? 'bg-green-100 text-green-800' :
                            record.status === 'ABSENT' ? 'bg-red-100 text-red-800' :
                            record.status === 'LATE' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-blue-100 text-blue-800'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="p-2 text-gray-600">
                          {record.note || '-'}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}