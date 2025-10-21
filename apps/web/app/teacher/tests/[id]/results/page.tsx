'use client';

import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardSkeleton, TableSkeleton } from '@/components/ui/loading-skeleton';
import { axiosInstance } from '@/lib/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
}

interface Score {
  studentId: number;
  marksObtained: number;
  grade: string;
  student: Student;
}

interface Test {
  id: number;
  testName: string;
  date: string;
  maxMarks: number;
  level: {
    id: number;
    name: string;
  };
  batch: {
    id: number;
    name: string;
  };
  scores: Score[];
}

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export default function TestResultsPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;

  // Fetch test details with scores
  const { data: test, isLoading } = useQuery<ApiResponse<Test>, Error>({
    queryKey: ['test', testId],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<Test>>(`/tests/${testId}`);
      return response.data;
    },
    enabled: !!testId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <CardSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <TableSkeleton rows={8} />
        </div>
      </div>
    );
  }

  const testData = test?.data;
  if (!testData || testData.scores.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
        <Card>
          <CardContent className="text-center py-12 animate-in fade-in">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-500 mb-2">No scores recorded yet</p>
            <p className="text-sm text-gray-400 mb-4">Record student scores first to view results</p>
            <Button onClick={() => router.push(`/teacher/tests/${testId}/scores`)}>
              Record Scores
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate statistics
  const scores = testData.scores.map((s) => s.marksObtained);
  const highest = Math.max(...scores);
  const lowest = Math.min(...scores);
  const average = scores.reduce((a, b) => a + b, 0) / scores.length;
  const median = scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)];
  
  // Calculate pass/fail
  const passingMarks = (testData.maxMarks * 40) / 100; // 40% passing
  const passed = scores.filter((s) => s >= passingMarks).length;
  const failed = scores.length - passed;
  const passPercentage = (passed / scores.length) * 100;

  // Grade distribution
  const gradeCount: Record<string, number> = {};
  testData.scores.forEach((score) => {
    gradeCount[score.grade] = (gradeCount[score.grade] || 0) + 1;
  });

  const gradeDistribution = Object.entries(gradeCount).map(([grade, count]) => ({
    grade,
    count,
    percentage: ((count / testData.scores.length) * 100).toFixed(1),
  }));

  // Score ranges for histogram
  const ranges = [
    { range: '0-20', min: 0, max: 20 },
    { range: '21-40', min: 21, max: 40 },
    { range: '41-60', min: 41, max: 60 },
    { range: '61-80', min: 61, max: 80 },
    { range: '81-100', min: 81, max: 100 },
  ];

  const scoreDistribution = ranges.map((r) => ({
    range: r.range,
    count: scores.filter((s) => s >= r.min && s <= r.max).length,
  }));

  // Pass/Fail pie chart data
  const passFailData = [
    { name: 'Passed', value: passed, color: '#10b981' },
    { name: 'Failed', value: failed, color: '#ef4444' },
  ];

  // Get grade color
  const getGradeColor = (grade: string): string => {
    if (grade === 'A+' || grade === 'A') return 'bg-green-100 text-green-800 border-green-300';
    if (grade === 'B+' || grade === 'B') return 'bg-blue-100 text-blue-800 border-blue-300';
    if (grade === 'C' || grade === 'D') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  // Sort students by marks for ranking
  const rankedScores = [...testData.scores].sort((a, b) => b.marksObtained - a.marksObtained);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 animate-in fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-in slide-in-from-top">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
              Test Results & Analytics
            </h1>
            <p className="text-gray-600 mt-2">
              {testData.testName} - {testData.batch.name} ({testData.level.name})
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Date: {new Date(testData.date).toLocaleDateString()} | Max Marks: {testData.maxMarks} | Students: {testData.scores.length}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="hover:bg-gray-100 transition-all duration-300"
          >
            Back to Tests
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="shadow-lg card-hover animate-in slide-in-from-left">
            <CardContent className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium mb-1">Highest Score</p>
                  <p className="text-3xl font-bold text-green-900">{highest}</p>
                  <p className="text-xs text-green-600 mt-1">out of {testData.maxMarks}</p>
                </div>
                <div className="bg-green-200 p-3 rounded-full">
                  <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg card-hover animate-in slide-in-from-left" style={{ animationDelay: '100ms' }}>
            <CardContent className="p-6 bg-gradient-to-br from-blue-50 to-cyan-100 border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium mb-1">Average Score</p>
                  <p className="text-3xl font-bold text-blue-900">{average.toFixed(1)}</p>
                  <p className="text-xs text-blue-600 mt-1">Median: {median}</p>
                </div>
                <div className="bg-blue-200 p-3 rounded-full">
                  <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg card-hover animate-in slide-in-from-right" style={{ animationDelay: '200ms' }}>
            <CardContent className="p-6 bg-gradient-to-br from-orange-50 to-red-100 border border-orange-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium mb-1">Lowest Score</p>
                  <p className="text-3xl font-bold text-orange-900">{lowest}</p>
                  <p className="text-xs text-orange-600 mt-1">out of {testData.maxMarks}</p>
                </div>
                <div className="bg-orange-200 p-3 rounded-full">
                  <svg className="w-8 h-8 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg card-hover animate-in slide-in-from-right" style={{ animationDelay: '300ms' }}>
            <CardContent className="p-6 bg-gradient-to-br from-purple-50 to-pink-100 border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium mb-1">Pass Rate</p>
                  <p className="text-3xl font-bold text-purple-900">{passPercentage.toFixed(0)}%</p>
                  <p className="text-xs text-purple-600 mt-1">{passed} passed, {failed} failed</p>
                </div>
                <div className="bg-purple-200 p-3 rounded-full">
                  <svg className="w-8 h-8 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Distribution */}
          <Card className="shadow-xl animate-in slide-in-from-bottom">
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Pass/Fail Distribution */}
          <Card className="shadow-xl animate-in slide-in-from-bottom" style={{ animationDelay: '100ms' }}>
            <CardHeader>
              <CardTitle>Pass/Fail Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={passFailData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: Record<string, unknown>) => {
                      const name = props.name as string;
                      const value = props.value as number;
                      const percent = props.percent as number;
                      return `${name}: ${value} (${(percent * 100).toFixed(0)}%)`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {passFailData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Grade Distribution */}
        <Card className="shadow-xl animate-in slide-in-from-bottom">
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {gradeDistribution.map((item) => (
                <div
                  key={item.grade}
                  className={`p-4 rounded-lg border text-center card-hover ${getGradeColor(item.grade)}`}
                >
                  <div className="text-2xl font-bold mb-1">{item.grade}</div>
                  <div className="text-sm font-medium">{item.count} students</div>
                  <div className="text-xs mt-1">{item.percentage}%</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Student Ranking */}
        <Card className="shadow-xl animate-in slide-in-from-bottom">
          <CardHeader>
            <CardTitle>Student Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left p-4 font-semibold text-gray-700">Rank</th>
                    <th className="text-left p-4 font-semibold text-gray-700">Student Name</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Marks Obtained</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Percentage</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {rankedScores.map((score, index) => {
                    const percentage = ((score.marksObtained / testData.maxMarks) * 100).toFixed(1);
                    return (
                      <tr
                        key={score.studentId}
                        className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200"
                      >
                        <td className="p-4">
                          <div className="flex items-center">
                            {index === 0 && (
                              <span className="text-2xl mr-2">🥇</span>
                            )}
                            {index === 1 && (
                              <span className="text-2xl mr-2">🥈</span>
                            )}
                            {index === 2 && (
                              <span className="text-2xl mr-2">🥉</span>
                            )}
                            <span className="font-bold text-gray-700">{index + 1}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            {score.student.firstName} {score.student.lastName}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="font-semibold text-gray-900">
                            {score.marksObtained} / {testData.maxMarks}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="text-gray-700">{percentage}%</span>
                        </td>
                        <td className="p-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getGradeColor(score.grade)} shadow-sm`}>
                            {score.grade}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
