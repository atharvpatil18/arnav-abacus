'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import MainLayout from '@/components/layout/main-layout';
import { axiosInstance } from '@/lib/axios';

interface Test {
  id: number;
  testName: string;
  date: string;
  studentId: number;
  student: {
    firstName: string;
    lastName: string;
  };
  subjects: {
    name: string;
    obtained: number;
    total: number;
  }[];
  totalObtained: number;
  totalPossible: number;
  percent: number;
}

interface ApiResponse<T> {
  data: T;
}

export default function ViewTestsPage() {
  const { toast } = useToast();

  const { data: tests, isLoading } = useQuery<Test[]>({
    queryKey: ['tests'],
    queryFn: async () => {
      const res = await axiosInstance.get<ApiResponse<Test[]>>('/tests');
      return res.data.data;
    }
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

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">All Tests</h1>
          <Button onClick={() => window.location.href = '/teacher/tests/entry'}>
            Enter New Test Results
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests?.map((test) => (
            <Card key={test.id} className="p-4">
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-lg">{test.testName}</h3>
                  <span className={`font-medium ${getStatusColor(test.percent)}`}>
                    {test.percent.toFixed(1)}%
                  </span>
                </div>
                <div className="space-y-2 flex-grow">
                  <p className="text-gray-600">
                    Date: {format(new Date(test.date), 'MMM d, yyyy')}
                  </p>
                  <p className="text-gray-600">
                    Student: {test.student.firstName} {test.student.lastName}
                  </p>
                  <p className="text-gray-600">
                    Total: {test.totalObtained} / {test.totalPossible}
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mt-4 w-full">
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{test.testName} - Details</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      <div className="mb-4">
                        <h4 className="font-medium mb-2">Student Information</h4>
                        <p>Name: {test.student.firstName} {test.student.lastName}</p>
                        <p>Date: {format(new Date(test.date), 'MMMM d, yyyy')}</p>
                      </div>
                      
                      <h4 className="font-medium mb-2">Subject Scores</h4>
                      <div className="space-y-2">
                        {test.subjects.map((subject, index) => (
                          <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <span>{subject.name}</span>
                            <span className="font-medium">
                              {subject.obtained} / {subject.total}
                              <span className="text-sm text-gray-500 ml-2">
                                ({((subject.obtained / subject.total) * 100).toFixed(1)}%)
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 p-4 bg-gray-50 rounded-md">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-500">Total Score</div>
                            <div className="text-lg font-medium">
                              {test.totalObtained} / {test.totalPossible}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">Overall Percentage</div>
                            <div className={`text-lg font-medium ${getStatusColor(test.percent)}`}>
                              {test.percent.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}