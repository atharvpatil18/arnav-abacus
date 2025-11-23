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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">Here&apos;s what&apos;s happening today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">My Batches</p>
                <p className="text-3xl font-bold text-blue-600">{data?.batches.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-green-600">{totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today&apos;s Classes</p>
                <p className="text-3xl font-bold text-purple-600">{data?.todayBatches.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Upcoming Tests</p>
                <p className="text-3xl font-bold text-orange-600">{data?.upcomingTests.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Batches */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              Today&apos;s Schedule
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {data?.todayBatches && data.todayBatches.length > 0 ? (
              <div className="space-y-3">
                {data.todayBatches.map((batch) => (
                  <div
                    key={batch.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <span className="font-medium">{batch.name}</span>
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {batch.timeSlot}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No classes scheduled for today</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tests */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              Upcoming Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {data?.upcomingTests && data.upcomingTests.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingTests.map((test) => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <div className="font-medium">{test.batchName}</div>
                      <div className="text-sm text-gray-600">
                        {new Date(test.testDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No upcoming tests</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* All Batches */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            My Batches
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {data?.batches && data.batches.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {data.batches.map((batch) => (
                <div
                  key={batch.id}
                  className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-br from-white to-gray-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-lg">{batch.name}</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {batch.level.name}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{batch.studentCount} students</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>{batch.timeSlot}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No batches assigned yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}