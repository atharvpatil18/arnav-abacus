'use client';

import { useAuth } from '@/lib/auth';
import Loading from '@/app/loading';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface TeacherDashboardData {
  batches: Array<{
    id: number;
    name: string;
    studentCount: number;
    level: {
      id: number;
      name: string;
    };
    dayMask: number;
    timeSlot: string;
  }>;
  todayBatches: Array<{
    id: number;
    name: string;
    timeSlot: string;
  }>;
  upcomingTests: Array<{
    id: number;
    batchName: string;
    testDate: string;
    students: number;
  }>;
}

export default function TeacherDashboard() {
  const { user, isLoading: authLoading } = useAuth();

  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ['teacherDashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get<TeacherDashboardData>('/teacher/dashboard');
      return data;
    },
    enabled: Boolean(user?.role === 'TEACHER'),
  });

  if (authLoading || dataLoading) {
    return <Loading />;
  }

  if (user?.role !== 'TEACHER') {
    return <div>Access denied</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold">Today&apos;s Batches</h2>
          {data?.todayBatches.length ? (
            <ul className="mt-4 space-y-3">
              {data.todayBatches.map((batch) => (
                <li key={batch.id} className="flex items-center justify-between">
                  <span>{batch.name}</span>
                  <span className="text-sm text-gray-500">{batch.timeSlot}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-500">No batches scheduled for today</p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold">My Batches</h2>
          {data?.batches.length ? (
            <ul className="mt-4 space-y-3">
              {data.batches.map((batch) => (
                <li key={batch.id} className="flex items-center justify-between">
                  <div>
                    <div>{batch.name}</div>
                    <div className="text-sm text-gray-500">Level: {batch.level.name}</div>
                  </div>
                  <span className="text-sm text-gray-500">{batch.studentCount} students</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-500">No batches assigned</p>
          )}
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold">Upcoming Tests</h2>
          {data?.upcomingTests.length ? (
            <ul className="mt-4 space-y-3">
              {data.upcomingTests.map((test) => (
                <li key={test.id} className="flex items-center justify-between">
                  <div>
                    <div>{test.batchName}</div>
                    <div className="text-sm text-gray-500">
                      Date: {new Date(test.testDate).toLocaleDateString()}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{test.students} students</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 text-sm text-gray-500">No upcoming tests</p>
          )}
        </div>
      </div>
    </div>
  );
}