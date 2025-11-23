'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { axiosInstance } from '@/lib/axios';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'sonner';

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
}

interface Batch {
  id: number;
  name: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
}

interface HomeworkSubmission {
  id: number;
  student: Student;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'LATE' | 'MISSING';
  submittedAt?: string;
  grade?: number;
  feedback?: string;
}

interface Homework {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  assignedDate: string;
  batch: Batch;
  teacher: Teacher;
  submissions?: HomeworkSubmission[];
}

interface CreateHomeworkDto {
  title: string;
  description: string;
  dueDate: string;
  batchId: number;
  teacherId: number;
}

export default function HomeworkPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [selectedHomework, setSelectedHomework] = useState<number | null>(null);
  
  // Grading modal state
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState<{ id: number; studentName: string } | null>(null);
  const [gradeFormData, setGradeFormData] = useState({
    grade: '',
    feedback: '',
  });

  const [formData, setFormData] = useState<CreateHomeworkDto>({
    title: '',
    description: '',
    dueDate: '',
    batchId: 0,
    teacherId: 0,
  });

  const { data: homework, isLoading: loadingHomework, error: homeworkError, isError: isHomeworkError } = useQuery<Homework[]>({
    queryKey: ['homework', selectedBatch],
    queryFn: async () => {
      const url = selectedBatch
        ? `/homework?batchId=${selectedBatch}`
        : '/homework?page=1&limit=1000';
      const response = await axiosInstance.get(url);
      return Array.isArray(response.data) ? response.data : response.data?.items || [];
    }
  });

  const { data: batches, error: batchesError, isError: isBatchesError } = useQuery<Batch[]>({
    queryKey: ['batches'],
    queryFn: async () => {
      const response = await axiosInstance.get('/batches?page=1&limit=1000');
      return Array.isArray(response.data) ? response.data : response.data?.items || [];
    }
  });

  const { data: teachers, error: teachersError, isError: isTeachersError } = useQuery<Teacher[]>({
    queryKey: ['teachers'],
    queryFn: async () => {
      const response = await axiosInstance.get('/teacher?page=1&limit=1000');
      return Array.isArray(response.data) ? response.data : response.data?.items || [];
    }
  });

  const { data: submissions } = useQuery<HomeworkSubmission[]>({
    queryKey: ['submissions', selectedHomework],
    queryFn: async () => {
      if (!selectedHomework) return [];
      const response = await axiosInstance.get(`/homework/${selectedHomework}/submissions`);
      return Array.isArray(response.data) ? response.data : [];
    },
    enabled: !!selectedHomework,
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateHomeworkDto) => {
      return axiosInstance.post('/homework', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      resetForm();
      toast.success('Homework created successfully!');
    },
    onError: () => {
      toast.error('Failed to create homework');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateHomeworkDto }) => {
      return axiosInstance.patch(`/homework/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      resetForm();
      toast.success('Homework updated successfully!');
    },
    onError: () => {
      toast.error('Failed to update homework');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return axiosInstance.delete(`/homework/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homework'] });
      toast.success('Homework deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete homework');
    },
  });

  const gradeSubmissionMutation = useMutation({
    mutationFn: async ({ id, grade, feedback }: { id: number; grade: number; feedback: string }) => {
      return axiosInstance.patch(`/homework/submissions/${id}`, {
        grade,
        feedback,
        status: 'GRADED',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      toast.success('Submission graded successfully!');
    },
    onError: () => {
      toast.error('Failed to grade submission');
    },
  });

  // Error handling - after all hooks
  if (isHomeworkError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">Failed to load homework</h2>
          <p className="text-red-600">{homeworkError?.message || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  if (isBatchesError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">Failed to load batches</h2>
          <p className="text-red-600">{batchesError?.message || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  if (isTeachersError) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-red-800 font-semibold mb-2">Failed to load teachers</h2>
          <p className="text-red-600">{teachersError?.message || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }


  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      dueDate: '',
      batchId: 0,
      teacherId: 0,
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (hw: Homework) => {
    setFormData({
      title: hw.title,
      description: hw.description,
      dueDate: hw.dueDate.split('T')[0],
      batchId: hw.batch.id,
      teacherId: hw.teacher.id,
    });
    setEditingId(hw.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.dueDate || !formData.batchId || !formData.teacherId) {
      alert('Please fill all required fields');
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this homework?')) {
      deleteMutation.mutate(id);
    }
  };

  const calculateStats = () => {
    const homeworkData = homework || [];
    const now = new Date();
    const overdue = homeworkData.filter(hw => new Date(hw.dueDate) < now).length;
    
    let totalSubmissions = 0;
    let gradedSubmissions = 0;
    let avgGrade = 0;
    
    homeworkData.forEach(hw => {
      const subs = hw.submissions || [];
      totalSubmissions += subs.length;
      const graded = subs.filter(s => s.status === 'GRADED');
      gradedSubmissions += graded.length;
      avgGrade += graded.reduce((sum, s) => sum + (s.grade || 0), 0);
    });

    const totalHomework = homeworkData.length;

    return {
      totalHomework,
      overdueCount: overdue,
      submissionRate: totalHomework > 0 ? (totalSubmissions / totalHomework) * 100 : 0,
      avgGrade: gradedSubmissions > 0 ? avgGrade / gradedSubmissions : 0,
    };
  };

  const stats = calculateStats();

  if (loadingHomework) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Homework Management
          </h1>
          <p className="text-gray-600 mt-1">Assign and track homework assignments</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-purple-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'New Homework'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Total Homework</p>
                <p className="text-2xl font-bold text-blue-800">{stats.totalHomework}</p>
              </div>
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Overdue</p>
                <p className="text-2xl font-bold text-red-800">{stats.overdueCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Submission Rate</p>
                <p className="text-2xl font-bold text-green-800">{stats.submissionRate.toFixed(1)}%</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Avg Grade</p>
                <p className="text-2xl font-bold text-purple-800">{stats.avgGrade.toFixed(1)}</p>
              </div>
              <User className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Homework' : 'Create New Homework'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter homework title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Due Date *</label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Batch *</label>
                  <select
                    value={formData.batchId}
                    onChange={(e) => setFormData({ ...formData, batchId: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={0}>Select batch</option>
                    {batches?.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Teacher *</label>
                  <select
                    value={formData.teacherId}
                    onChange={(e) => setFormData({ ...formData, teacherId: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={0}>Select teacher</option>
                    {teachers?.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter homework description"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-500"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingId
                    ? 'Update Homework'
                    : 'Create Homework'}
                </Button>
                <Button type="button" onClick={resetForm} variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <select
                value={selectedBatch || ''}
                onChange={(e) => setSelectedBatch(e.target.value ? Number(e.target.value) : null)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Filter by batch"
              >
                <option value="">All Batches</option>
                {batches?.map((batch) => (
                  <option key={batch.id} value={batch.id}>
                    {batch.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Homework List */}
      <Card>
        <CardHeader>
          <CardTitle>Homework Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          {homework && homework.length > 0 ? (
            <div className="space-y-4">
              {homework.map((hw) => {
                const isOverdue = new Date(hw.dueDate) < new Date();
                return (
                  <div
                    key={hw.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedHomework(selectedHomework === hw.id ? null : hw.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{hw.title}</h3>
                          {isOverdue && (
                            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                              Overdue
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-1">{hw.description}</p>
                        <div className="flex gap-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Due: {new Date(hw.dueDate).toLocaleDateString()}
                          </span>
                          <span>Batch: {hw.batch.name}</span>
                          <span>
                            Teacher: {hw.teacher.firstName} {hw.teacher.lastName}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(hw);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(hw.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    {/* Submissions */}
                    {selectedHomework === hw.id && submissions && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="font-semibold mb-2">Submissions</h4>
                        {submissions.length > 0 ? (
                          <div className="space-y-2">
                            {submissions.map((sub) => (
                              <div key={sub.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                                <div>
                                  <p className="font-medium">
                                    {sub.student.firstName} {sub.student.lastName}
                                  </p>
                                  <span
                                    className={`text-xs px-2 py-1 rounded-full ${
                                      sub.status === 'GRADED'
                                        ? 'bg-green-100 text-green-700'
                                        : sub.status === 'SUBMITTED'
                                        ? 'bg-blue-100 text-blue-700'
                                        : sub.status === 'LATE'
                                        ? 'bg-yellow-100 text-yellow-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {sub.status}
                                  </span>
                                </div>
                                {sub.status === 'SUBMITTED' && (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setGradingSubmission({
                                        id: sub.id,
                                        studentName: sub.student.firstName + ' ' + sub.student.lastName,
                                      });
                                      setGradeFormData({ grade: '', feedback: '' });
                                      setShowGradeModal(true);
                                    }}
                                  >
                                    Grade
                                  </Button>
                                )}
                                {sub.status === 'GRADED' && (
                                  <p className="text-sm">Grade: {sub.grade}/100</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No submissions yet</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No homework assignments yet</p>
              <p className="text-sm">Click &quot;New Homework&quot; to create one</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grade Submission Modal */}
      <Dialog open={showGradeModal} onOpenChange={(open) => {
        setShowGradeModal(open);
        if (!open) {
          setGradingSubmission(null);
          setGradeFormData({ grade: '', feedback: '' });
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grade Submission</DialogTitle>
            <DialogDescription>
              Grade the homework submission for {gradingSubmission?.studentName}
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (gradingSubmission && gradeFormData.grade && gradeFormData.feedback) {
                const gradeNum = Number(gradeFormData.grade);
                if (gradeNum >= 0 && gradeNum <= 100) {
                  gradeSubmissionMutation.mutate({
                    id: gradingSubmission.id,
                    grade: gradeNum,
                    feedback: gradeFormData.feedback,
                  });
                  setShowGradeModal(false);
                  setGradingSubmission(null);
                  setGradeFormData({ grade: '', feedback: '' });
                } else {
                  toast.error('Grade must be between 0 and 100');
                }
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium mb-2">Grade (0-100) *</label>
              <input
                type="number"
                min="0"
                max="100"
                value={gradeFormData.grade}
                onChange={(e) => setGradeFormData({ ...gradeFormData, grade: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter grade"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Feedback *</label>
              <textarea
                value={gradeFormData.feedback}
                onChange={(e) => setGradeFormData({ ...gradeFormData, feedback: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Enter feedback for the student"
                rows={4}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowGradeModal(false);
                  setGradingSubmission(null);
                  setGradeFormData({ grade: '', feedback: '' });
                }}
              >
                Cancel
              </Button>
              <Button type="submit">Submit Grade</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
