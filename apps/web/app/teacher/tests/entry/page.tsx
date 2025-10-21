'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { useToast } from '@/components/ui/use-toast';
import MainLayout from '@/components/layout/main-layout';
import { axiosInstance } from '@/lib/axios';

interface Batch {
  id: number;
  name: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
}

interface Subject {
  name: string;
  obtained: number;
  total: number;
}

export default function TestEntryPage() {
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [testName, setTestName] = useState('');
  const [testDate, setTestDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [subjects, setSubjects] = useState<Subject[]>([{ name: '', obtained: 0, total: 100 }]);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  interface ApiResponse<T> {
    data: T;
  }

  const { data: batches, isLoading: loadingBatches } = useQuery<Batch[]>({
    queryKey: ['batches'],
    queryFn: async () => {
      const res = await axiosInstance.get<Batch[] | { data: Batch[] }>('/batches');
      return Array.isArray(res.data) ? res.data : res.data.data;
    }
  });

  const { data: students } = useQuery<Student[]>({
    queryKey: ['students', selectedBatch],
    queryFn: async () => {
      const res = await axiosInstance.get<Student[] | { data: Student[] }>(`/students?batchId=${selectedBatch}`);
      return Array.isArray(res.data) ? res.data : res.data.data;
    },
    enabled: !!selectedBatch
  });

  interface TestSubmissionData {
    studentId: number;
    testName: string;
    date: string;
    subjects: Subject[];
    totalObtained: number;
    totalPossible: number;
    percent: number;
  }

  const submitTestMutation = useMutation({
    mutationFn: async (data: TestSubmissionData) => {
      const res = await axiosInstance.post<ApiResponse<void>>('/tests', data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      // Use sonner's typed API: message first, options second
      toast.success('Success', { description: 'Test results saved successfully' });
      resetForm();
    },
    onError: () => {
      toast.error('Error', { description: 'Failed to save test results' });
    }
  });

  const handleSubjectChange = (index: number, field: keyof Subject, value: string | number) => {
    const newSubjects = [...subjects];
    newSubjects[index] = { 
      ...newSubjects[index], 
      [field]: field === 'name' ? value : Number(value) 
    };
    setSubjects(newSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: '', obtained: 0, total: 100 }]);
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const computeTotals = () => {
    const totalObtained = subjects.reduce((sum, s) => sum + s.obtained, 0);
    const totalPossible = subjects.reduce((sum, s) => sum + s.total, 0);
    const percent = (totalObtained / totalPossible) * 100;
    return { totalObtained, totalPossible, percent };
  };

  const handleSubmit = () => {
    if (!selectedStudent || !testName || !testDate || subjects.length === 0) {
      // Use sonner's API: show error with description
      toast.error('Validation Error', { description: 'Please fill in all required fields' });
      return;
    }

    const { totalObtained, totalPossible, percent } = computeTotals();

    submitTestMutation.mutate({
      studentId: selectedStudent,
      testName,
      date: testDate,
      subjects,
      totalObtained,
      totalPossible,
      percent
    });
  };

  const resetForm = () => {
    setSelectedStudent(null);
    setTestName('');
    setTestDate(format(new Date(), 'yyyy-MM-dd'));
    setSubjects([{ name: '', obtained: 0, total: 100 }]);
  };

  if (loadingBatches) {
    return (
      <MainLayout>
        <div className="flex justify-center p-8"><CircularProgress /></div>
      </MainLayout>
    );
  }

  const totals = computeTotals();

  return (
    <MainLayout>
      <div className="p-6 max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Enter Test Results</CardTitle>
            <CardDescription>Record test scores for a student</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Batch Selection */}
              <div>
                <label className="block text-sm font-medium mb-1">Select Batch</label>
                <select
                  className="w-full rounded-md border border-input p-2"
                  value={selectedBatch || ''}
                  onChange={(e) => {
                    setSelectedBatch(Number(e.target.value));
                    setSelectedStudent(null);
                  }}
                  aria-label="Select Batch"
                  title="Select a batch from the list"
                >
                  <option value="">Select a batch</option>
                  {batches?.map(batch => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Selection */}
              {selectedBatch && (
                <div>
                  <label className="block text-sm font-medium mb-1">Select Student</label>
                  <select
                    className="w-full rounded-md border border-input p-2"
                    value={selectedStudent || ''}
                    onChange={(e) => setSelectedStudent(Number(e.target.value))}
                    aria-label="Select Student"
                    title="Select a student from the list"
                  >
                    <option value="">Select a student</option>
                    {students?.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Test Details */}
              {selectedStudent && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Test Name</label>
                      <input
                        type="text"
                        className="w-full rounded-md border border-input p-2"
                        value={testName}
                        onChange={(e) => setTestName(e.target.value)}
                        placeholder="Monthly Test 1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Date</label>
                      <input
                        type="date"
                        className="w-full rounded-md border border-input p-2"
                        value={testDate}
                        onChange={(e) => setTestDate(e.target.value)}
                        max={format(new Date(), 'yyyy-MM-dd')}
                      />
                    </div>
                  </div>

                  {/* Subjects */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium">Subjects</label>
                      <Button onClick={addSubject} variant="outline" size="sm">
                        Add Subject
                      </Button>
                    </div>
                    
                    {subjects.map((subject, index) => (
                      <div key={index} className="grid grid-cols-6 gap-2 items-center">
                        <div className="col-span-2">
                          <input
                            type="text"
                            placeholder="Subject Name"
                            className="w-full rounded-md border border-input p-2"
                            value={subject.name}
                            onChange={(e) => handleSubjectChange(index, 'name', e.target.value)}
                            title={`Enter subject ${index + 1} name`}
                            aria-label={`Subject ${index + 1} name`}
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            placeholder="Obtained"
                            className="w-full rounded-md border border-input p-2"
                            value={subject.obtained}
                            onChange={(e) => handleSubjectChange(index, 'obtained', e.target.value)}
                            min="0"
                            max={subject.total}
                          />
                        </div>
                        <div className="col-span-1">
                          <input
                            type="number"
                            placeholder="Total"
                            className="w-full rounded-md border border-input p-2"
                            value={subject.total}
                            onChange={(e) => handleSubjectChange(index, 'total', e.target.value)}
                            min="1"
                          />
                        </div>
                        <div className="col-span-1">
                          {((subject.obtained / subject.total) * 100).toFixed(1)}%
                        </div>
                        <div className="col-span-1">
                          {subjects.length > 1 && (
                            <Button
                              onClick={() => removeSubject(index)}
                              variant="outline"
                              size="sm"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="mt-4 p-4 bg-gray-50 rounded-md">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-gray-500">Total Marks</div>
                        <div className="text-lg font-medium">
                          {totals.totalObtained} / {totals.totalPossible}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Percentage</div>
                        <div className="text-lg font-medium">
                          {totals.percent.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={submitTestMutation.isPending}
                    className="w-full mt-4"
                  >
                    {submitTestMutation.isPending ? 'Saving...' : 'Save Test Results'}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}