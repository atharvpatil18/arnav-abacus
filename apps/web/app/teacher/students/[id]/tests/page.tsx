'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularProgress } from '@/components/ui/circular-progress';
import MainLayout from '@/components/layout/main-layout';
import { axiosInstance } from '@/lib/axios';

interface Test {
  id: number;
  testName: string;
  date: string;
  subjects: {
    name: string;
    obtained: number;
    total: number;
  }[];
  totalObtained: number;
  totalPossible: number;
  percent: number;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  batchName: string;
  tests: Test[];
}

interface ApiResponse<T> {
  data: T;
}

export default function StudentTestsPage(props: unknown) {
  const { params } = props as { params: { id: string } };
  const { data: student, isLoading, error } = useQuery({
    queryKey: ['student', params.id, 'tests'],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<Student>>(`/students/${params.id}/tests`);
      return response.data.data;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const getStatusColor = (percent: number) => {
    if (percent >= 80) return 'text-green-600';
    if (percent >= 60) return 'text-yellow-600';
    return 'text-red-600';
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

  if (error) {
    return (
      <MainLayout>
        <div className="p-6">
          <h1 className="text-xl text-red-600">Error loading student data</h1>
          <p className="text-gray-600 mt-2">Please try refreshing the page</p>
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

  // Calculate average performance
  const averagePercent = student.tests.length > 0
    ? student.tests.reduce((sum, test) => sum + test.percent, 0) / student.tests.length
    : 0;

  return (
    <MainLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">
            {student.firstName} {student.lastName}&apos; Test History
          </h1>
          <p className="text-gray-600">Batch: {student.batchName}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Performance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-500">Average Score</div>
                  <div className={`text-2xl font-bold ${getStatusColor(averagePercent)}`}>
                    {averagePercent.toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Tests Taken</div>
                  <div className="text-2xl font-bold">{student.tests.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {student.tests
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((test) => (
                    <div 
                      key={test.id} 
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium">{test.testName}</h3>
                          <p className="text-sm text-gray-500">
                            {format(new Date(test.date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <span className={`font-medium ${getStatusColor(test.percent)}`}>
                          {test.percent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="mt-2 space-y-1">
                        {test.subjects.map((subject, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">{subject.name}</span>
                            <span>
                              {subject.obtained}/{subject.total}
                              <span className="text-gray-500 ml-1">
                                ({((subject.obtained / subject.total) * 100).toFixed(1)}%)
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}