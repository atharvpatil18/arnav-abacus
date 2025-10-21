'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, subMonths } from 'date-fns';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CircularProgress } from '@/components/ui/circular-progress';
import MainLayout from '@/components/layout/main-layout';
import { axiosInstance } from '@/lib/axios';

interface Test {
  id: number;
  testName: string;
  date: string;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    batch: {
      id: number;
      name: string;
    };
  };
  subjects: Array<{
    name: string;
    obtained: number;
    total: number;
  }>;
  totalObtained: number;
  totalPossible: number;
  percent: number;
}

interface AnalyticsSummary {
  totalTests: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  topPerformers: Array<{
    studentId: number;
    name: string;
    averageScore: number;
  }>;
  subjectPerformance: Record<string, {
    averageScore: number;
    totalTests: number;
  }>;
  monthlyAverages: Array<{
    month: string;
    average: number;
  }>;
}

export default function TestAnalyticsPage() {
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState<'1month' | '3months' | '6months' | '1year'>('3months');

  const { data: batches, isLoading: loadingBatches } = useQuery<{ id: number; name: string; }[]>({
    queryKey: ['batches'],
    queryFn: async () => {
      const res = await axiosInstance.get<{ id: number; name: string; }[] | { data: { id: number; name: string; }[] }>('/batches');
      return Array.isArray(res.data) ? res.data : res.data.data;
    }
  });

  const { data: tests, isLoading: loadingTests } = useQuery<Test[]>({
    queryKey: ['tests', selectedBatch, timeRange],
    queryFn: async () => {
      const url = selectedBatch ? `/tests?batchId=${selectedBatch}&from=${getFromDate()}` : `/tests?from=${getFromDate()}`;
      const res = await axiosInstance.get<Test[] | { data: Test[] }>(url);
      return Array.isArray(res.data) ? res.data : res.data.data;
    },
  });

  const getFromDate = () => {
    const now = new Date();
    switch (timeRange) {
      case '1month': return format(subMonths(now, 1), 'yyyy-MM-dd');
      case '3months': return format(subMonths(now, 3), 'yyyy-MM-dd');
      case '6months': return format(subMonths(now, 6), 'yyyy-MM-dd');
      case '1year': return format(subMonths(now, 12), 'yyyy-MM-dd');
    }
  };

  const calculateAnalytics = (): AnalyticsSummary | null => {
    if (!tests?.length) return null;

    // Calculate basic statistics
    const scores = tests.map(t => t.percent);
    const totalTests = tests.length;
    const averageScore = scores.reduce((a, b) => a + b, 0) / totalTests;
    const highestScore = Math.max(...scores);
    const lowestScore = Math.min(...scores);

    // Calculate top performers
    const studentScores = tests.reduce((acc, test) => {
      const studentId = test.student.id;
      if (!acc[studentId]) {
        acc[studentId] = {
          name: `${test.student.firstName} ${test.student.lastName}`,
          scores: []
        };
      }
      acc[studentId].scores.push(test.percent);
      return acc;
    }, {} as Record<number, { name: string; scores: number[] }>);

    const topPerformers = Object.entries(studentScores)
      .map(([id, data]) => ({
        studentId: Number(id),
        name: data.name,
        averageScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length
      }))
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, 5);

    // Calculate subject-wise performance
    const subjectPerformance = tests.reduce((acc, test) => {
      test.subjects.forEach(subject => {
        if (!acc[subject.name]) {
          acc[subject.name] = { totalScore: 0, count: 0 };
        }
        acc[subject.name].totalScore += (subject.obtained / subject.total) * 100;
        acc[subject.name].count++;
      });
      return acc;
    }, {} as Record<string, { totalScore: number; count: number }>);

    // Calculate monthly averages
    const monthlyData = tests.reduce((acc, test) => {
      const month = format(new Date(test.date), 'MMM yyyy');
      if (!acc[month]) {
        acc[month] = { total: 0, count: 0 };
      }
      acc[month].total += test.percent;
      acc[month].count++;
      return acc;
    }, {} as Record<string, { total: number; count: number }>);

    return {
      totalTests,
      averageScore,
      highestScore,
      lowestScore,
      topPerformers,
      subjectPerformance: Object.entries(subjectPerformance).reduce((acc, [subject, data]) => {
        acc[subject] = {
          averageScore: data.totalScore / data.count,
          totalTests: data.count
        };
        return acc;
      }, {} as Record<string, { averageScore: number; totalTests: number }>),
      monthlyAverages: Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          average: data.total / data.count
        }))
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    };
  };

  const analytics = calculateAnalytics();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loadingBatches || loadingTests) {
    return (
      <MainLayout>
        <div className="flex justify-center p-8">
          <CircularProgress />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold">Test Analytics</h1>
          
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <select
              className="rounded-md border border-input p-2"
              value={selectedBatch || ''}
              onChange={(e) => setSelectedBatch(e.target.value ? Number(e.target.value) : null)}
              title="Filter by batch"
            >
              <option value="">All Batches</option>
              {batches?.map(batch => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>

            <select
              className="rounded-md border border-input p-2"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
              title="Select time range"
            >
              <option value="1month">Last Month</option>
              <option value="3months">Last 3 Months</option>
              <option value="6months">Last 6 Months</option>
              <option value="1year">Last Year</option>
            </select>
          </div>
        </div>

        {analytics ? (
          <div className="space-y-6">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Total Tests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analytics.totalTests}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Average Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getScoreColor(analytics.averageScore)}`}>
                    {analytics.averageScore.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Highest Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getScoreColor(analytics.highestScore)}`}>
                    {analytics.highestScore.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Lowest Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold ${getScoreColor(analytics.lowestScore)}`}>
                    {analytics.lowestScore.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Performers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>Students with highest average scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analytics.topPerformers.map((student, index) => (
                      <div key={student.studentId} className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-medium w-6">{index + 1}.</span>
                          <span>{student.name}</span>
                        </div>
                        <span className={`font-medium ${getScoreColor(student.averageScore)}`}>
                          {student.averageScore.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Subject Performance */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject-wise Performance</CardTitle>
                  <CardDescription>Average scores by subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics.subjectPerformance).map(([subject, data]) => (
                      <div key={subject} className="space-y-1">
                        <div className="flex justify-between">
                          <span className="font-medium">{subject}</span>
                          <span className={getScoreColor(data.averageScore)}>
                            {data.averageScore.toFixed(1)}%
                          </span>
                        </div>
                        <div className="relative pt-1">
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                            <div
                              style={{ width: `${data.averageScore}%` }}
                              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                                data.averageScore >= 90 ? 'bg-green-500' :
                                data.averageScore >= 75 ? 'bg-blue-500' :
                                data.averageScore >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                            />
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Based on {data.totalTests} tests
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Trends</CardTitle>
                <CardDescription>Average test scores over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-end gap-2">
                  {analytics.monthlyAverages.map((month) => (
                    <div
                      key={month.month}
                      className="flex-1 flex flex-col items-center"
                    >
                      <div
                        className={`w-full ${getScoreColor(month.average)} bg-current opacity-20`}
                        style={{ height: `${month.average}%` }}
                      />
                      <div className="text-sm mt-2 -rotate-45 origin-top-left">
                        {month.month}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-gray-500">
                No test data available for the selected criteria
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}