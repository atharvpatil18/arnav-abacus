'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  BookOpen, 
  Calendar, 
  Users,
  CheckCircle,
  XCircle,
  Award,
  FileText,
  Download,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { PageTransition } from '@/components/ui/page-transition';

interface Homework {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  batchId: number;
  batchName: string;
  attachmentUrl?: string;
}

interface Submission {
  id: number;
  studentId: number;
  studentName: string;
  status: 'NOT_SUBMITTED' | 'SUBMITTED' | 'LATE' | 'GRADED';
  submissionDate?: string;
  submissionText?: string;
  attachmentUrl?: string;
  grade?: number;
  feedback?: string;
}

export default function HomeworkSubmissionsPage() {
  const router = useRouter();
  const params = useParams();
  const homeworkId = params?.id as string;
  
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradeData, setGradeData] = useState({ grade: '', feedback: '' });

  // Fetch homework details
  const { data: homework, isLoading: homeworkLoading } = useQuery({
    queryKey: ['homework', homeworkId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Homework }>(`/homework/${homeworkId}`);
      return data.data;
    },
  });

  // Fetch submissions
  const { data: submissions, isLoading: submissionsLoading, refetch } = useQuery({
    queryKey: ['submissions', homeworkId],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Submission[] }>(`/homework/${homeworkId}/submissions`);
      return data.data;
    },
  });

  // Grade submission mutation
  const gradeSubmissionMutation = useMutation({
    mutationFn: async ({ submissionId, grade, feedback }: { submissionId: number; grade: number; feedback: string }) => {
      return apiClient.patch(`/homework/${homeworkId}/submissions/${submissionId}`, {
        grade,
        feedback,
        status: 'GRADED',
      });
    },
    onSuccess: () => {
      toast.success('Submission graded successfully!');
      setSelectedSubmission(null);
      setGradeData({ grade: '', feedback: '' });
      refetch();
    },
    onError: () => {
      toast.error('Failed to grade submission');
    },
  });

  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    
    const grade = parseInt(gradeData.grade);
    if (isNaN(grade) || grade < 0 || grade > 100) {
      toast.error('Grade must be between 0 and 100');
      return;
    }

    gradeSubmissionMutation.mutate({
      submissionId: selectedSubmission.id,
      grade,
      feedback: gradeData.feedback,
    });
  };

  if (homeworkLoading || submissionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  const statusConfig = {
    NOT_SUBMITTED: { 
      icon: XCircle, 
      label: 'Not Submitted',
      color: 'text-gray-600', 
      bg: 'bg-gray-50', 
      border: 'border-gray-200' 
    },
    SUBMITTED: { 
      icon: CheckCircle, 
      label: 'Submitted',
      color: 'text-blue-600', 
      bg: 'bg-blue-50', 
      border: 'border-blue-200' 
    },
    LATE: { 
      icon: AlertTriangle, 
      label: 'Late',
      color: 'text-yellow-600', 
      bg: 'bg-yellow-50', 
      border: 'border-yellow-200' 
    },
    GRADED: { 
      icon: Award, 
      label: 'Graded',
      color: 'text-green-600', 
      bg: 'bg-green-50', 
      border: 'border-green-200' 
    },
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-6 animate-in fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Back Button & Header */}
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4 hover:bg-purple-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Homework
        </Button>

        {/* Homework Details Card */}
        <Card className="mb-6 shadow-xl">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-2xl text-gray-900 mb-2">{homework?.title}</CardTitle>
                <p className="text-gray-600 mb-4">{homework?.description}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {new Date(homework?.dueDate || '').toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>Batch: {homework?.batchName}</span>
                  </div>
                  {homework?.attachmentUrl && (
                    <a
                      href={homework.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Attachment</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Submissions Table */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              Student Submissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Student</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Submitted On</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Grade</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions?.map((submission: Submission) => {
                    const config = statusConfig[submission.status];
                    const StatusIcon = config.icon;
                    
                    return (
                      <tr key={submission.id} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                        <td className="py-4 px-4">
                          <div className="font-medium text-gray-900">{submission.studentName}</div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.color} ${config.border} border`}>
                            <StatusIcon className="w-4 h-4" />
                            {config.label}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-600">
                          {submission.submissionDate 
                            ? new Date(submission.submissionDate).toLocaleDateString() 
                            : '-'}
                        </td>
                        <td className="py-4 px-4">
                          {submission.grade !== undefined && submission.grade !== null ? (
                            <span className="inline-flex items-center gap-1 font-semibold text-green-600">
                              <Award className="w-4 h-4" />
                              {submission.grade}/100
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-right">
                          {submission.status !== 'NOT_SUBMITTED' && (
                            <Button
                              onClick={() => {
                                setSelectedSubmission(submission);
                                setGradeData({
                                  grade: submission.grade?.toString() || '',
                                  feedback: submission.feedback || '',
                                });
                              }}
                              variant="outline"
                              size="sm"
                              className="border-purple-300 text-purple-600 hover:bg-purple-50"
                            >
                              {submission.status === 'GRADED' ? 'View/Edit' : 'Grade'}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {(!submissions || submissions.length === 0) && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No submissions yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grading Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in" onClick={() => setSelectedSubmission(null)}>
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Grade Submission - {selectedSubmission.studentName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleGradeSubmit} className="space-y-6">
                {/* Submission Details */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Submission</h3>
                  <p className="text-gray-700 whitespace-pre-wrap mb-3">
                    {selectedSubmission.submissionText || 'No text submitted'}
                  </p>
                  {selectedSubmission.attachmentUrl && (
                    <a
                      href={selectedSubmission.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Attachment
                    </a>
                  )}
                  {selectedSubmission.submissionDate && (
                    <p className="text-sm text-gray-500 mt-2">
                      Submitted on: {new Date(selectedSubmission.submissionDate).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Grade Input */}
                <div>
                  <label htmlFor="grade" className="block text-sm font-semibold text-gray-700 mb-2">
                    Grade (0-100) <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="grade"
                    type="number"
                    min="0"
                    max="100"
                    value={gradeData.grade}
                    onChange={(e) => setGradeData({ ...gradeData, grade: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Feedback Textarea */}
                <div>
                  <label htmlFor="feedback" className="block text-sm font-semibold text-gray-700 mb-2">
                    Feedback
                  </label>
                  <textarea
                    id="feedback"
                    value={gradeData.feedback}
                    onChange={(e) => setGradeData({ ...gradeData, feedback: e.target.value })}
                    rows={4}
                    placeholder="Enter feedback for the student..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <Button
                    type="button"
                    onClick={() => setSelectedSubmission(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={gradeSubmissionMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                  >
                    {gradeSubmissionMutation.isPending ? 'Saving...' : 'Save Grade'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
    </PageTransition>
  );
}
              <CheckCircle className="w-6 h-6 text-green-600" />
