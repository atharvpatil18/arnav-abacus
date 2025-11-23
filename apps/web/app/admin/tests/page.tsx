'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { axiosInstance } from '@/lib/axios';
import { 
  ClipboardList, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp,
  Award,
  Filter,
  Download
} from 'lucide-react';
import Link from 'next/link';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
}

interface Batch {
  id: number;
  name: string;
}

interface Test {
  id: number;
  student: Student;
  batch?: Batch;
  level: number;
  testName: string;
  date: string;
  subjects: Array<{ name: string; obtained: number; total: number }>;
  totalObtained: number;
  totalPossible: number;
  percent: number;
  remarks?: string;
}

interface CreateTestDto {
  studentId: number;
  batchId?: number;
  level: number;
  testName: string;
  date: string;
  subjects: Array<{ name: string; obtained: number; total: number }>;
  remarks?: string;
}

export default function TestsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [batchFilter, setBatchFilter] = useState<string>('ALL');
  const [formData, setFormData] = useState<CreateTestDto>({
    studentId: 0,
    batchId: undefined,
    level: 1,
    testName: '',
    date: new Date().toISOString().split('T')[0],
    subjects: [{ name: '', obtained: 0, total: 100 }],
    remarks: '',
  });

  const { data: tests, isLoading } = useQuery<Test[]>({
    queryKey: ['tests', levelFilter, batchFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (levelFilter !== 'ALL') params.append('level', levelFilter);
      if (batchFilter !== 'ALL') params.append('batchId', batchFilter);
      const response = await axiosInstance.get(`/tests?${params.toString()}`);
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: students } = useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await axiosInstance.get('/students');
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: batches } = useQuery<Batch[]>({
    queryKey: ['batches'],
    queryFn: async () => {
      const response = await axiosInstance.get('/batches?page=1&limit=1000');
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data?.items) return data.items;
      return [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateTestDto) => {
      if (editingTest) {
        await axiosInstance.put(`/tests/${editingTest.id}`, data);
      } else {
        await axiosInstance.post('/tests', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      alert(`Test ${editingTest ? 'updated' : 'created'} successfully!`);
      resetForm();
    },
    onError: (error: Error) => {
      alert(`Failed to ${editingTest ? 'update' : 'create'} test: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await axiosInstance.delete(`/tests/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      alert('Test deleted successfully!');
    },
    onError: () => {
      alert('Failed to delete test');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.testName) {
      alert('Please fill in all required fields');
      return;
    }
    createMutation.mutate(formData);
  };

  const handleEdit = (test: Test) => {
    setEditingTest(test);
    setFormData({
      studentId: test.student.id,
      batchId: test.batch?.id,
      level: test.level,
      testName: test.testName,
      date: test.date.split('T')[0],
      subjects: test.subjects,
      remarks: test.remarks,
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this test?')) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTest(null);
    setFormData({
      studentId: 0,
      batchId: undefined,
      level: 1,
      testName: '',
      date: new Date().toISOString().split('T')[0],
      subjects: [{ name: '', obtained: 0, total: 100 }],
      remarks: '',
    });
  };

  const addSubject = () => {
    setFormData({
      ...formData,
      subjects: [...formData.subjects, { name: '', obtained: 0, total: 100 }],
    });
  };

  const removeSubject = (index: number) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter((_, i) => i !== index),
    });
  };

  const updateSubject = (index: number, field: string, value: string | number) => {
    const subjects = [...formData.subjects];
    subjects[index] = { ...subjects[index], [field]: value };
    setFormData({ ...formData, subjects });
  };

  const calculateStats = () => {
    const testsData = tests || [];
    const totalTests = testsData.length;
    const avgScore = testsData.length > 0
      ? testsData.reduce((sum, t) => sum + t.percent, 0) / testsData.length
      : 0;
    const passedTests = testsData.filter(t => t.percent >= 50).length;
    const passRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

    return { totalTests, avgScore, passRate };
  };

  const stats = calculateStats();

  if (isLoading) {
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Tests & Assessments
          </h1>
          <p className="text-gray-600 mt-1">Manage student test results and performance</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Test Result'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Total Tests</p>
                <p className="text-3xl font-bold text-green-800">{stats.totalTests}</p>
              </div>
              <div className="w-12 h-12 bg-green-200 rounded-full flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Average Score</p>
                <p className="text-3xl font-bold text-blue-800">{stats.avgScore.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Pass Rate</p>
                <p className="text-3xl font-bold text-purple-800">{stats.passRate.toFixed(1)}%</p>
              </div>
              <div className="w-12 h-12 bg-purple-200 rounded-full flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="border-2 border-green-200">
          <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardTitle>{editingTest ? 'Edit Test Result' : 'Add New Test Result'}</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Student *</label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  >
                    <option value={0}>Select Student</option>
                    {students?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Batch</label>
                  <select
                    value={formData.batchId || ''}
                    onChange={(e) => setFormData({ ...formData, batchId: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-4 py-2 border rounded-lg"
                  >
                    <option value="">Select Batch</option>
                    {batches?.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Test Name *</label>
                  <input
                    type="text"
                    value={formData.testName}
                    onChange={(e) => setFormData({ ...formData, testName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    placeholder="e.g., Monthly Assessment"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Level *</label>
                  <input
                    type="number"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                    min={1}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium">Subjects *</label>
                  <Button type="button" onClick={addSubject} size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Subject
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.subjects.map((subject, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Subject Name"
                        value={subject.name}
                        onChange={(e) => updateSubject(index, 'name', e.target.value)}
                        className="flex-1 px-4 py-2 border rounded-lg"
                        required
                      />
                      <input
                        type="number"
                        placeholder="Obtained"
                        value={subject.obtained}
                        onChange={(e) => updateSubject(index, 'obtained', Number(e.target.value))}
                        className="w-24 px-4 py-2 border rounded-lg"
                        min={0}
                        required
                      />
                      <span className="text-gray-500">/</span>
                      <input
                        type="number"
                        placeholder="Total"
                        value={subject.total}
                        onChange={(e) => updateSubject(index, 'total', Number(e.target.value))}
                        className="w-24 px-4 py-2 border rounded-lg"
                        min={1}
                        required
                      />
                      {formData.subjects.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeSubject(index)}
                          size="sm"
                          variant="outline"
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={2}
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-green-500 to-blue-500"
                >
                  {createMutation.isPending ? 'Saving...' : editingTest ? 'Update Test' : 'Save Test'}
                </Button>
                <Button type="button" onClick={resetForm} variant="outline" className="flex-1">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Level</label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full md:w-48 px-4 py-2 border rounded-lg"
              >
                <option value="ALL">All Levels</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <option key={level} value={level}>
                    Level {level}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Batch</label>
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value)}
                className="w-full md:w-48 px-4 py-2 border rounded-lg"
              >
                <option value="ALL">All Batches</option>
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

      {/* Tests Table */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          {tests && tests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Student</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Test Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Level</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Score</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Percentage</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tests.map((test) => (
                    <tr key={test.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {test.student.firstName} {test.student.lastName}
                      </td>
                      <td className="px-4 py-3">{test.testName}</td>
                      <td className="px-4 py-3">
                        {new Date(test.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">Level {test.level}</td>
                      <td className="px-4 py-3">
                        {test.totalObtained} / {test.totalPossible}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            test.percent >= 75
                              ? 'bg-green-100 text-green-700'
                              : test.percent >= 50
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {test.percent.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(test)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(test.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">No test results found</p>
              <p className="text-sm mt-2">Add a test result to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
