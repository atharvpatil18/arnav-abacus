'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { axiosInstance } from '@/lib/axios';
import { Student, Test, Fee, Attendance } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Edit, Phone, Mail, Calendar, User } from 'lucide-react';
import Image from 'next/image';

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.id as string;

  const { data: student, isLoading: studentLoading } = useQuery<Student>({
    queryKey: ['student', studentId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/students/${studentId}`);
      return response.data as Student;
    },
  });

  const { data: tests, isLoading: testsLoading } = useQuery<Test[]>({
    queryKey: ['student-tests', studentId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/tests?studentId=${studentId}`);
      const data = response.data as Test[] | { items: Test[] };
      return Array.isArray(data) ? data : data.items || [];
    },
  });

  const { data: fees, isLoading: feesLoading } = useQuery<Fee[]>({
    queryKey: ['student-fees', studentId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/fees?studentId=${studentId}`);
      const data = response.data as Fee[] | { items: Fee[] };
      return Array.isArray(data) ? data : data.items || [];
    },
  });

  const { data: attendance, isLoading: attendanceLoading } = useQuery<Attendance[]>({
    queryKey: ['student-attendance', studentId],
    queryFn: async () => {
      const response = await axiosInstance.get(`/attendance?studentId=${studentId}`);
      const data = response.data as Attendance[] | { items: Attendance[] };
      return Array.isArray(data) ? data : data.items || [];
    },
  });

  if (studentLoading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Student Not Found</h2>
          <p className="text-gray-600 mb-4">The student you&apos;re looking for doesn&apos;t exist.</p>
          <Button onClick={() => router.push('/admin/students')}>Back to Students</Button>
        </div>
      </div>
    );
  }

  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/admin/students')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Student Details</h1>
        </div>
        <Button onClick={() => router.push(`/admin/students/${studentId}/edit`)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Student
        </Button>
      </div>

      {/* Basic Info Card */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            {/* Photo */}
            <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              {student.photoUrl ? (
                <Image src={student.photoUrl} alt={student.firstName} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Info Grid */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {student.firstName} {student.lastName || ''}
                </h2>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={student.status === 'ACTIVE' ? 'default' : 'secondary'}>
                    {student.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>Parent: {student.parentName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4" />
                  <span>{student.parentPhone}</span>
                </div>
                {student.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span>{student.email}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-600">DOB:</span>
                  <span className="font-medium">{formatDate(student.dob)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-gray-600">Joined:</span>
                  <span className="font-medium">{formatDate(student.joiningDate)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm">
                  <span className="text-gray-600">Current Level:</span>
                  <span className="font-medium ml-2">Level {student.currentLevel}</span>
                </div>
                {student.batch && (
                  <div className="text-sm">
                    <span className="text-gray-600">Batch:</span>
                    <span className="font-medium ml-2">{student.batch.name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Tests, Fees, Attendance */}
      <Tabs defaultValue="tests" className="w-full">
        <TabsList>
          <TabsTrigger value="tests">Tests</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        {/* Tests Tab */}
        <TabsContent value="tests">
          <Card>
            <CardHeader>
              <CardTitle>Test Records</CardTitle>
            </CardHeader>
            <CardContent>
              {testsLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : tests && tests.length > 0 ? (
                <div className="space-y-4">
                  {tests.map((test) => (
                    <div key={test.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{test.testName}</h3>
                          <p className="text-sm text-gray-600">Level {test.level}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{test.percent.toFixed(1)}%</p>
                          <p className="text-sm text-gray-600">
                            {test.totalObtained}/{test.totalPossible}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">Date: {formatDate(test.date)}</p>
                      {test.remarks && (
                        <p className="text-sm text-gray-700 mt-2">Remarks: {test.remarks}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No test records found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fees Tab */}
        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle>Fee Records</CardTitle>
            </CardHeader>
            <CardContent>
              {feesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : fees && fees.length > 0 ? (
                <div className="space-y-4">
                  {fees.map((fee) => (
                    <div key={fee.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold">₹{fee.amount}</p>
                          <p className="text-sm text-gray-600">Due: {formatDate(fee.dueDate)}</p>
                        </div>
                        <Badge
                          variant={
                            fee.status === 'PAID'
                              ? 'default'
                              : fee.status === 'PARTIAL'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {fee.status}
                        </Badge>
                      </div>
                      {fee.paidAmount > 0 && (
                        <div className="text-sm">
                          <p className="text-gray-600">Paid: ₹{fee.paidAmount}</p>
                          <p className="text-gray-600">Paid on: {formatDate(fee.paidDate)}</p>
                          {fee.paidBy && <p className="text-gray-600">Paid by: {fee.paidBy}</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No fee records found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attendance Tab */}
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Records</CardTitle>
            </CardHeader>
            <CardContent>
              {attendanceLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : attendance && attendance.length > 0 ? (
                <div className="space-y-2">
                  {attendance.slice(0, 20).map((record) => (
                    <div key={record.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">{formatDate(record.date)}</p>
                        {record.note && <p className="text-sm text-gray-600">{record.note}</p>}
                      </div>
                      <Badge
                        variant={
                          record.status === 'PRESENT'
                            ? 'default'
                            : record.status === 'LATE'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {record.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No attendance records found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
