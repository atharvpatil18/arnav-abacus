'use client';

import { useAuth } from '@/lib/auth';
import Loading from '@/app/loading';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Calendar, Users, BookOpen, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  const totalStudents = data?.batches.reduce((sum, batch) => sum + batch.studentCount, 0) || 0;

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-slate-500">Here&apos;s what&apos;s happening today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-primary-600 to-primary-700 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BookOpen className="w-24 h-24" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-primary-100 text-sm mb-1 font-medium">My Batches</p>
            <p className="text-4xl font-bold tracking-tight">{data?.batches.length || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-24 h-24" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-emerald-100 text-sm mb-1 font-medium">Total Students</p>
            <p className="text-4xl font-bold tracking-tight">{totalStudents}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-24 h-24" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-secondary-100 text-sm mb-1 font-medium">Today&apos;s Classes</p>
            <p className="text-4xl font-bold tracking-tight">{data?.todayBatches.length || 0}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-rose-500 to-rose-600 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-24 h-24" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-rose-100 text-sm mb-1 font-medium">Upcoming Tests</p>
            <p className="text-4xl font-bold tracking-tight">{data?.upcomingTests.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Batches */}
        <Card className="shadow-sm border border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Calendar className="w-5 h-5 text-secondary-600" />
              Today&apos;s Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {data?.todayBatches && data.todayBatches.length > 0 ? (
              <div className="space-y-3">
                {data.todayBatches.map((batch) => (
                  <div
                    key={batch.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <span className="font-medium text-slate-900">{batch.name}</span>
                    <span className="text-sm text-slate-500 flex items-center gap-1 bg-white px-2 py-1 rounded border border-slate-200">
                      <Clock className="w-3 h-3" />
                      {batch.timeSlot}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p>No classes scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tests */}
        <Card className="shadow-sm border border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <TrendingUp className="w-5 h-5 text-rose-600" />
              Upcoming Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {data?.upcomingTests && data.upcomingTests.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-200 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-slate-900">{test.batchName}</div>
                      <div className="text-sm text-slate-500 mt-1">
                        {new Date(test.testDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <BookOpen className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p>No upcoming tests</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Batches */}
      <Card className="shadow-sm border border-slate-200 bg-white">
        <CardHeader className="border-b border-slate-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
            <BookOpen className="w-5 h-5 text-primary-600" />
            My Batches
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {data?.batches && data.batches.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.batches.map((batch) => (
                <div
                  key={batch.id}
                  className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all bg-white hover:border-primary-200 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg text-slate-900 group-hover:text-primary-700 transition-colors">{batch.name}</h3>
                    <span className="px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-full border border-primary-100">
                      {batch.level.name}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      <span>{batch.studentCount} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{batch.timeSlot}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-slate-300" />
              <p>No batches assigned yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}