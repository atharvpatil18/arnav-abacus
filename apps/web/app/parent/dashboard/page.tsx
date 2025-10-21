'use client';

import { useAuth } from '@/lib/auth';
import Loading from '@/app/loading';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface ParentDashboardData {
  children: Array<{
    id: number;
    name: string;
    level: number;
    batch: {
      id: number;
      name: string;
      timeSlot: string;
    };
    recentTests: Array<{
      id: number;
      testName: string;
      date: string;
      percent: number;
    }>;
    recentAttendance: Array<{
      id: number;
      date: string;
      status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    }>;
  }>;
  upcomingFees: Array<{
    id: number;
    amount: number;
    dueDate: string;
    status: 'PENDING' | 'PARTIAL' | 'PAID';
    studentName: string;
  }>;
}

export default function ParentDashboard() {
  const { user, isLoading: authLoading } = useAuth();

  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ['parentDashboard'],
    queryFn: async () => {
      const { data } = await apiClient.get<ParentDashboardData>('/parent/dashboard');
      return data;
    },
    enabled: Boolean(user?.role === 'PARENT'),
  });

  if (authLoading || dataLoading) {
    return <Loading />;
  }

  if (user?.role !== 'PARENT') {
    return <div>Access denied</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Parent Dashboard</h1>

      {data?.children.map((child) => (
        <div key={child.id} className="space-y-4">
          <h2 className="text-xl font-semibold">
            {child.name} - Level {child.level}
          </h2>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium">Batch Information</h3>
              <div className="mt-2 text-sm">
                <p>Batch: {child.batch.name}</p>
                <p>Time: {child.batch.timeSlot}</p>
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium">Recent Tests</h3>
              {child.recentTests.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {child.recentTests.map((test) => (
                    <li key={test.id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span>{test.testName}</span>
                        <span
                          className={
                            test.percent >= 75
                              ? 'text-green-600'
                              : test.percent >= 50
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }
                        >
                          {test.percent}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(test.date).toLocaleDateString()}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-gray-500">No recent tests</p>
              )}
            </div>

            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium">Recent Attendance</h3>
              {child.recentAttendance.length > 0 ? (
                <ul className="mt-2 space-y-2">
                  {child.recentAttendance.map((attendance) => (
                    <li key={attendance.id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span>{new Date(attendance.date).toLocaleDateString()}</span>
                        <span
                          className={
                            attendance.status === 'PRESENT'
                              ? 'text-green-600'
                              : attendance.status === 'LATE'
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }
                        >
                          {attendance.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-gray-500">No recent attendance records</p>
              )}
            </div>
          </div>
        </div>
      ))}

      {(data?.upcomingFees?.length ?? 0) > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h2 className="text-lg font-semibold">Upcoming Fee Payments</h2>
          <div className="mt-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Student
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Amount
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Due Date
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data?.upcomingFees?.map((fee) => (
                  <tr key={fee.id}>
                    <td className="px-4 py-2 text-sm">{fee.studentName}</td>
                    <td className="px-4 py-2 text-sm">₹{fee.amount}</td>
                    <td className="px-4 py-2 text-sm">
                      {new Date(fee.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-sm">
                      <span
                        className={
                          fee.status === 'PAID'
                            ? 'text-green-600'
                            : fee.status === 'PARTIAL'
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }
                      >
                        {fee.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}