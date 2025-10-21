'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/ui/loading-skeleton';
import { axiosInstance } from '@/lib/axios';
import { toast } from 'sonner';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
}

interface Score {
  studentId: number;
  marksObtained: number;
  grade: string;
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

export default function TestScoresPage() {
  const router = useRouter();
  const params = useParams();
  const testId = params.id as string;
  const queryClient = useQueryClient();
  const [scores, setScores] = useState<Record<number, number>>({});

  // Fetch test details with existing scores
  const { data: test, isLoading: loadingTest } = useQuery<ApiResponse<Test>, Error>({
    queryKey: ['test', testId],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<Test>>(`/tests/${testId}`);
      return response.data;
    },
    enabled: !!testId,
  });

  // Fetch students in the test's batch
  const { data: students, isLoading: loadingStudents } = useQuery<ApiResponse<Student[]>, Error>({
    queryKey: ['students', test?.data?.batch?.id],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<Student[]>>(`/students?batchId=${test?.data?.batch?.id}`);
      return response.data;
    },
    enabled: !!test?.data?.batch?.id,
  });

  // Save scores mutation
  const saveMutation = useMutation({
    mutationFn: async (scoresData: { studentId: number; marksObtained: number }[]) => {
      const response = await axiosInstance.post(`/tests/${testId}/scores`, { scores: scoresData });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Scores saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['test', testId] });
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      router.push('/teacher/tests');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Failed to save scores');
    },
  });

  // Initialize scores from existing data
  const existingScores = test?.data?.scores || [];
  const studentsData = Array.isArray(students?.data) ? students.data : [];

  // Calculate grade based on marks
  const calculateGrade = (marks: number, maxMarks: number): string => {
    const percentage = (marks / maxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C';
    if (percentage >= 40) return 'D';
    return 'F';
  };

  // Get grade color
  const getGradeColor = (grade: string): string => {
    if (grade === 'A+' || grade === 'A') return 'bg-green-100 text-green-800 border-green-300';
    if (grade === 'B+' || grade === 'B') return 'bg-blue-100 text-blue-800 border-blue-300';
    if (grade === 'C' || grade === 'D') return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const handleScoreChange = (studentId: number, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= (test?.data?.maxMarks || 100)) {
      setScores(prev => ({ ...prev, [studentId]: numValue }));
    } else if (value === '') {
      setScores(prev => {
        const newScores = { ...prev };
        delete newScores[studentId];
        return newScores;
      });
    }
  };

  const handleSave = () => {
    const scoresArray = Object.entries(scores).map(([studentId, marksObtained]) => ({
      studentId: parseInt(studentId),
      marksObtained,
    }));

    if (scoresArray.length === 0) {
      toast.error('Please enter at least one score');
      return;
    }

    saveMutation.mutate(scoresArray);
  };

  if (loadingTest || loadingStudents) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Record Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={10} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const testData = test?.data;
  if (!testData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Test not found</p>
            <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6 animate-in fade-in">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-in slide-in-from-top">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
              Record Scores
            </h1>
            <p className="text-gray-600 mt-2">
              {testData.testName} - {testData.batch.name} ({testData.level.name})
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Date: {new Date(testData.date).toLocaleDateString()} | Max Marks: {testData.maxMarks}
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

        {/* Scores Table */}
        <Card className="shadow-xl animate-in slide-in-from-bottom">
          <CardHeader>
            <CardTitle>Student Scores</CardTitle>
            <p className="text-sm text-gray-500 mt-2">
              Enter marks obtained for each student (out of {testData.maxMarks})
            </p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gray-50">
                    <th className="text-left p-4 font-semibold text-gray-700">Student Name</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Marks Obtained</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Grade</th>
                    <th className="text-center p-4 font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData.map((student) => {
                    const existingScore = existingScores.find((s: Score) => s.studentId === student.id);
                    const currentScore = scores[student.id] ?? existingScore?.marksObtained;
                    const grade = currentScore !== undefined && currentScore !== null ? calculateGrade(Number(currentScore), testData.maxMarks) : '';

                    return (
                      <tr 
                        key={student.id} 
                        className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200"
                      >
                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </div>
                        </td>
                        <td className="p-4">
                          <input
                            type="number"
                            min="0"
                            max={testData.maxMarks}
                            step="0.5"
                            placeholder="Enter marks"
                            value={currentScore ?? ''}
                            onChange={(e) => handleScoreChange(student.id, e.target.value)}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 shadow-sm hover:shadow-md mx-auto block"
                          />
                        </td>
                        <td className="p-4 text-center">
                          {grade && (
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getGradeColor(grade)} shadow-sm`}>
                              {grade}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {existingScore ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Recorded
                            </span>
                          ) : scores[student.id] !== undefined ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-300">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              Pending Save
                            </span>
                          ) : (
                            <span className="text-gray-400 text-sm">Not recorded</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {studentsData.length === 0 && (
              <div className="text-center py-12 text-gray-500 animate-in fade-in">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <p className="text-lg font-medium">No students found in this batch</p>
              </div>
            )}

            {/* Action Buttons */}
            {studentsData.length > 0 && (
              <div className="mt-6 flex justify-end space-x-4">
                <Button
                  variant="outline"
                  onClick={() => router.back()}
                  className="hover:bg-gray-100 transition-all duration-300"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saveMutation.isPending || Object.keys(scores).length === 0}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {saveMutation.isPending ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    'Save Scores'
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {Object.keys(scores).length > 0 && (
          <Card className="shadow-lg animate-in slide-in-from-bottom">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-cyan-100 p-4 rounded-lg border border-blue-200">
                  <div className="text-sm text-blue-600 font-medium mb-1">Scores Entered</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {Object.keys(scores).length} / {studentsData.length}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-4 rounded-lg border border-green-200">
                  <div className="text-sm text-green-600 font-medium mb-1">Average (Current)</div>
                  <div className="text-2xl font-bold text-green-900">
                    {(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length).toFixed(1)}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-4 rounded-lg border border-purple-200">
                  <div className="text-sm text-purple-600 font-medium mb-1">Highest (Current)</div>
                  <div className="text-2xl font-bold text-purple-900">
                    {Math.max(...Object.values(scores))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
