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
    <div className="p-8 space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Parent Dashboard</h1>
        <p className="text-slate-500">Overview of your children&apos;s progress and upcoming activities</p>
      </div>

      {data?.children.map((child) => (
        <div key={child.id} className="space-y-6">
          <div className="flex items-center gap-4 pb-2 border-b border-slate-200">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
              {child.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                {child.name}
              </h2>
              <p className="text-slate-500">Level {child.level}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-sm border border-slate-200 bg-white hover:shadow-md transition-shadow">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800">Batch Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-500">Batch</span>
                    <span className="font-medium text-slate-900">{child.batch.name}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="text-slate-500">Time</span>
                    <span className="font-medium text-slate-900">{child.batch.timeSlot}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-slate-200 bg-white hover:shadow-md transition-shadow">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800">Recent Tests</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {child.recentTests.length > 0 ? (
                  <ul className="space-y-3">
                    {child.recentTests.map((test) => (
                      <li key={test.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-slate-900">{test.testName}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              test.percent >= 75
                                ? 'bg-emerald-100 text-emerald-700'
                                : test.percent >= 50
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {test.percent}%
                          </span>
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(test.date).toLocaleDateString()}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center py-4 text-slate-500">No recent tests</p>
                )}
              </CardContent>
            </Card>

            <Card className="shadow-sm border border-slate-200 bg-white hover:shadow-md transition-shadow">
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800">Recent Attendance</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {child.recentAttendance.length > 0 ? (
                  <ul className="space-y-3">
                    {child.recentAttendance.map((attendance) => (
                      <li key={attendance.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-700">{new Date(attendance.date).toLocaleDateString()}</span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                              attendance.status === 'PRESENT'
                                ? 'bg-emerald-100 text-emerald-700'
                                : attendance.status === 'LATE'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {attendance.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center py-4 text-slate-500">No recent attendance records</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ))}

      {(data?.upcomingFees?.length ?? 0) > 0 && (
        <Card className="shadow-sm border border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-800">Upcoming Fee Payments</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {data?.upcomingFees?.map((fee) => (
                    <tr key={fee.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">{fee.studentName}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">₹{fee.amount}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(fee.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            fee.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-700'
                              : fee.status === 'PARTIAL'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {fee.status}
                        </span>
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