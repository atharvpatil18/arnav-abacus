'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axios';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  currentLevel: {
    id: number;
    name: string;
  };
}

interface Fee {
  id: number;
  studentId: number;
  amount: number;
  dueDate: string;
  paidAmount: number;
  status: 'PENDING' | 'PARTIAL' | 'PAID';
  invoiceNumber: string;
  createdAt: string;
}

export default function FeesPage() {
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newFee, setNewFee] = useState({
    amount: 0,
    dueDate: format(new Date(), 'yyyy-MM-dd'),
  });

  const queryClient = useQueryClient();

  const { data: students, isLoading: loadingStudents } = useQuery<Student[], Error>({
    queryKey: ['students', searchQuery],
    queryFn: async () => {
      const response = await axiosInstance.get<Student[]>(
        `/students${searchQuery ? `?search=${searchQuery}` : ''}`
      );
      return response.data;
    },
  });

  const { data: fees, isLoading: loadingFees } = useQuery<Fee[], Error>({
    queryKey: ['fees', selectedStudent],
    queryFn: async () => {
      const response = await axiosInstance.get<Fee[]>(
        `/fees${selectedStudent ? `?studentId=${selectedStudent}` : ''}`
      );
      return response.data;
    },
    enabled: !!selectedStudent,
  });

  const createFeeMutation = useMutation<Fee, Error, {
    studentId: number;
    amount: number;
    dueDate: string;
  }>({
    mutationFn: async (data) => {
      const response = await axiosInstance.post<Fee>('/fees', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      toast('Fee invoice created successfully');
      setNewFee({ amount: 0, dueDate: format(new Date(), 'yyyy-MM-dd') });
    },
    onError: () => {
      toast('Failed to create fee invoice');
    },
  });

  const markPaidMutation = useMutation<Fee, Error, number>({
    mutationFn: async (feeId) => {
      const response = await axiosInstance.post<Fee>(`/fees/${feeId}/mark-paid`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      toast('Payment recorded successfully');
    },
    onError: () => {
      toast('Failed to record payment');
    },
  });

  const handleCreateFee = () => {
    if (!selectedStudent) return;
    createFeeMutation.mutate({
      studentId: selectedStudent,
      ...newFee,
    });
  };

  if (loadingStudents) {
    return <div className="flex justify-center p-8"><CircularProgress /></div>;
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Select Student</CardTitle>
            <CardDescription>Search and select a student to manage fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Search students..."
                className="w-full px-4 py-2 border rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="max-h-96 overflow-y-auto">
                {students?.map((student: Student) => (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudent(student.id)}
                    className={`p-3 rounded-lg cursor-pointer ${
                      selectedStudent === student.id
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="font-medium">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-sm">Level: {student.currentLevel.name}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fees Management */}
        <div className="lg:col-span-2">
          {selectedStudent ? (
            <div className="space-y-6">
              {/* Create New Fee */}
              <Card>
                <CardHeader>
                  <CardTitle>Create New Fee</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Amount</label>
                        <input
                          type="number"
                          className="w-full px-4 py-2 border rounded-lg"
                          value={newFee.amount}
                          onChange={(e) =>
                            setNewFee({ ...newFee, amount: Number(e.target.value) })
                          }
                          min="0"
                          step="100"
                          title="Fee amount"
                          aria-label="Fee amount"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Due Date</label>
                        <input
                          type="date"
                          className="w-full px-4 py-2 border rounded-lg"
                          value={newFee.dueDate}
                          onChange={(e) =>
                            setNewFee({ ...newFee, dueDate: e.target.value })
                          }
                          title="Due date"
                          aria-label="Due date"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handleCreateFee}
                      disabled={createFeeMutation.isPending}
                      className="w-full"
                    >
                      {createFeeMutation.isPending
                        ? 'Creating...'
                        : 'Create Fee Invoice'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Fee History */}
              <Card>
                <CardHeader>
                  <CardTitle>Fee History</CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingFees ? (
                    <div className="flex justify-center p-4">
                      <CircularProgress />
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                          <tr>
                            <th className="px-6 py-3">Invoice #</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Due Date</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {fees?.map((fee: Fee) => (
                            <tr
                              key={fee.id}
                              className="bg-white border-b hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 font-medium">
                                {fee.invoiceNumber}
                              </td>
                              <td className="px-6 py-4">
                                ₹{fee.amount.toFixed(2)}
                                {fee.paidAmount > 0 && fee.paidAmount < fee.amount && (
                                  <div className="text-xs text-gray-500">
                                    Paid: ₹{fee.paidAmount.toFixed(2)}
                                  </div>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                {format(new Date(fee.dueDate), 'dd MMM yyyy')}
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    fee.status === 'PAID'
                                      ? 'bg-green-100 text-green-800'
                                      : fee.status === 'PARTIAL'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {fee.status}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                {fee.status !== 'PAID' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => markPaidMutation.mutate(fee.id)}
                                    disabled={markPaidMutation.isPending}
                                  >
                                    Mark as Paid
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                Select a student to manage fees
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}