'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Save, Plus, Trash2 } from 'lucide-react';
import MainLayout from '@/components/layout/main-layout';

interface Batch {
  id: number;
  name: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  currentLevel: number;
}

interface Subject {
  name: string;
  total: number;
}

interface StudentMark {
  studentId: number;
  level: number;
  marks: Record<string, number>; // subjectName -> obtained
}

export default function GradeTestsPage() {
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [testName, setTestName] = useState('');
  const [testDate, setTestDate] = useState(new Date().toISOString().split('T')[0]);
  const [subjects, setSubjects] = useState<Subject[]>([{ name: 'Abacus', total: 100 }]);
  const [studentMarks, setStudentMarks] = useState<Record<number, StudentMark>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Batches
  const { data: batches } = useQuery<Batch[]>({
    queryKey: ['teacher-batches'],
    queryFn: async () => {
      const res = await axiosInstance.get('/teacher/dashboard');
      return res.data.data.batches;
    }
  });

  // Fetch Students for selected batch
  const { data: students, isLoading: isLoadingStudents } = useQuery<Student[]>({
    queryKey: ['batch-students', selectedBatchId],
    queryFn: async () => {
      if (!selectedBatchId) return [];
      const res = await axiosInstance.get(`/batches/${selectedBatchId}/students`);
      return res.data.data;
    },
    enabled: !!selectedBatchId
  });

  // Initialize student marks when students load
  useEffect(() => {
    if (students) {
      const initialMarks: Record<number, StudentMark> = {};
      students.forEach(student => {
        initialMarks[student.id] = {
          studentId: student.id,
          level: student.currentLevel,
          marks: {}
        };
        subjects.forEach(sub => {
          initialMarks[student.id].marks[sub.name] = 0;
        });
      });
      setStudentMarks(initialMarks);
    }
  }, [students, subjects]);

  const handleAddSubject = () => {
    setSubjects([...subjects, { name: '', total: 100 }]);
  };

  const handleRemoveSubject = (index: number) => {
    const newSubjects = [...subjects];
    newSubjects.splice(index, 1);
    setSubjects(newSubjects);
  };

  const handleSubjectChange = (index: number, field: keyof Subject, value: string | number) => {
    const newSubjects = [...subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setSubjects(newSubjects);
  };

  const handleMarkChange = (studentId: number, subjectName: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setStudentMarks(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        marks: {
          ...prev[studentId].marks,
          [subjectName]: numValue
        }
      }
    }));
  };

  const handleSubmit = async () => {
    if (!selectedBatchId || !testName || !testDate) {
      toast.error('Please fill in all test details');
      return;
    }

    if (subjects.some(s => !s.name)) {
      toast.error('Please provide names for all subjects');
      return;
    }

    setIsSubmitting(true);
    try {
      const results = Object.values(studentMarks).map(mark => ({
        studentId: mark.studentId,
        level: mark.level,
        subjects: subjects.map(sub => ({
          name: sub.name,
          total: Number(sub.total),
          obtained: mark.marks[sub.name] || 0
        }))
      }));

      await axiosInstance.post('/tests/bulk', {
        batchId: Number(selectedBatchId),
        testName,
        date: new Date(testDate),
        results
      });

      toast.success('Grades saved successfully');
      // Reset form
      setTestName('');
      setStudentMarks({});
      setSelectedBatchId('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to save grades');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Grade Tests</h1>
            <p className="text-gray-500 mt-1">Enter marks for an entire batch.</p>
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedBatchId}>
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Grades
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Test Configuration */}
          <Card className="md:col-span-1 h-fit">
            <CardHeader>
              <CardTitle>Test Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Batch</Label>
                <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a batch" />
                  </SelectTrigger>
                  <SelectContent>
                    {batches?.map(batch => (
                      <SelectItem key={batch.id} value={String(batch.id)}>
                        {batch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Test Name</Label>
                <Input 
                  value={testName} 
                  onChange={e => setTestName(e.target.value)} 
                  placeholder="e.g., Mid-Term Assessment"
                />
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Input 
                  type="date" 
                  value={testDate} 
                  onChange={e => setTestDate(e.target.value)} 
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Subjects</Label>
                  <Button variant="ghost" size="sm" onClick={handleAddSubject}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {subjects.map((subject, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input 
                        placeholder="Subject Name" 
                        value={subject.name}
                        onChange={e => handleSubjectChange(index, 'name', e.target.value)}
                      />
                    </div>
                    <div className="w-20">
                      <Input 
                        type="number" 
                        placeholder="Max" 
                        value={subject.total}
                        onChange={e => handleSubjectChange(index, 'total', e.target.value)}
                      />
                    </div>
                    {subjects.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-red-500"
                        onClick={() => handleRemoveSubject(index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Grading Table */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Student Grades</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedBatchId ? (
                <div className="text-center py-12 text-gray-500">
                  Please select a batch to start grading
                </div>
              ) : isLoadingStudents ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                </div>
              ) : students?.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No students found in this batch
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-4 py-3">Student Name</th>
                        {subjects.map((sub, i) => (
                          <th key={i} className="px-4 py-3">
                            {sub.name || `Subject ${i + 1}`} 
                            <span className="text-gray-400 ml-1">({sub.total})</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {students?.map(student => (
                        <tr key={student.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {student.firstName} {student.lastName}
                          </td>
                          {subjects.map((sub, i) => (
                            <td key={i} className="px-4 py-3">
                              <Input 
                                type="number" 
                                className="w-24"
                                min="0"
                                max={sub.total}
                                value={studentMarks[student.id]?.marks[sub.name] || ''}
                                onChange={e => handleMarkChange(student.id, sub.name, e.target.value)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
