'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { CheckCircle, XCircle, FileText, Calendar, User, DollarSign } from 'lucide-react';

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

interface FeePayment {
  id: number;
  feeId: number;
  studentId: number;
  amount: number;
  receiptUrl: string;
  transactionId: string;
  paymentDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  rejectionReason?: string;
  student: {
    firstName: string;
    lastName: string;
  };
  fee: {
    amount: number;
    invoiceNumber: string;
  };
}

interface ApprovalForm {
  paymentId: number | null;
  note?: string;
  rejectionReason?: string;
}

export default function TeacherFeeApprovalPage() {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'history'>('pending');
  const [approvalForm, setApprovalForm] = useState<ApprovalForm>({
    paymentId: null,
    note: '',
    rejectionReason: '',
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Fetch pending fee payments
  const { data: pendingPayments, isLoading: isLoadingPending } = useQuery<ApiResponse<FeePayment[]>>({
    queryKey: ['fee-payments', 'pending'],
    queryFn: async (): Promise<ApiResponse<FeePayment[]>> => {
      const { data } = await apiClient.get<ApiResponse<FeePayment[]>>('/fee-payments/pending');
      return data;
    },
  });

  // Fetch payment history (approved + rejected)
  const { data: paymentHistory, isLoading: isLoadingHistory } = useQuery<ApiResponse<FeePayment[]>>({
    queryKey: ['fee-payments', 'history'],
    queryFn: async (): Promise<ApiResponse<FeePayment[]>> => {
      const { data } = await apiClient.get<ApiResponse<FeePayment[]>>('/fee-payments/history');
      return data;
    },
  });

  // Approve payment mutation
  const approveMutation = useMutation({
    mutationFn: async ({ id, note }: { id: number; note?: string }) => {
      const { data } = await apiClient.patch(`/fee-payments/${id}/approve`, { note });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-payments'] });
      toast.success('Payment approved successfully');
      setApprovalForm({ paymentId: null, note: '', rejectionReason: '' });
    },
    onError: () => {
      toast.error('Failed to approve payment');
    },
  });

  // Reject payment mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: number; reason: string }) => {
      const { data } = await apiClient.patch(`/fee-payments/${id}/reject`, { rejectionReason: reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fee-payments'] });
      toast.success('Payment rejected');
      setApprovalForm({ paymentId: null, note: '', rejectionReason: '' });
    },
    onError: () => {
      toast.error('Failed to reject payment');
    },
  });

  const pendingData = pendingPayments?.data || [];
  const historyData = paymentHistory?.data || [];

  const handleApprove = (payment: FeePayment) => {
    if (approvalForm.paymentId === payment.id) {
      // Submit approval
      approveMutation.mutate({ id: payment.id, note: approvalForm.note });
    } else {
      // Show approval form
      setApprovalForm({ paymentId: payment.id, note: '', rejectionReason: '' });
    }
  };

  const handleReject = (payment: FeePayment) => {
    if (approvalForm.paymentId === payment.id) {
      // Submit rejection
      if (!approvalForm.rejectionReason?.trim()) {
        toast.error('Rejection reason is required');
        return;
      }
      rejectMutation.mutate({ id: payment.id, reason: approvalForm.rejectionReason });
    } else {
      // Show rejection form
      setApprovalForm({ paymentId: payment.id, note: '', rejectionReason: '' });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return colors[status as keyof typeof colors] || colors.PENDING;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            Fee Payment Approvals
          </h1>
          <p className="text-gray-600 mt-1">Review and approve student fee payment submissions</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setSelectedTab('pending')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            selectedTab === 'pending'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-blue-600'
          }`}
        >
          Pending ({pendingData.length})
        </button>
        <button
          onClick={() => setSelectedTab('history')}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            selectedTab === 'history'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-blue-600'
          }`}
        >
          History ({historyData.length})
        </button>
      </div>

      {/* Pending Payments Tab */}
      {selectedTab === 'pending' && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Payment Proofs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingPending ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <TableSkeleton rows={6} />
              </div>
            ) : pendingData.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingData.map((payment) => (
                  <Card key={payment.id} className="border-2 border-yellow-200">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold">
                          {payment.student.firstName} {payment.student.lastName}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4 text-gray-600" />
                        <span>Invoice: {payment.fee.invoiceNumber}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="w-4 h-4 text-gray-600" />
                        <span className="font-medium">â‚¹{payment.amount.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span>{new Date(payment.paymentDate).toLocaleDateString()}</span>
                      </div>

                      <div className="text-sm">
                        <p className="text-gray-600">Transaction ID:</p>
                        <p className="font-mono text-xs">{payment.transactionId}</p>
                      </div>

                      {/* Receipt Image */}
                      {payment.receiptUrl && (
                        <div className="mt-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={payment.receiptUrl}
                            alt="Receipt"
                            className="w-full h-32 object-cover rounded cursor-pointer hover:opacity-80"
                            onClick={() => setSelectedImage(payment.receiptUrl)}
                          />
                        </div>
                      )}

                      {/* Approval Form */}
                      {approvalForm.paymentId === payment.id && (
                        <div className="space-y-2 pt-2 border-t">
                          <textarea
                            placeholder={approvalForm.rejectionReason !== undefined ? "Rejection reason (required)" : "Optional note"}
                            value={approvalForm.rejectionReason !== undefined ? approvalForm.rejectionReason : approvalForm.note}
                            onChange={(e) => setApprovalForm({
                              ...approvalForm,
                              [approvalForm.rejectionReason !== undefined ? 'rejectionReason' : 'note']: e.target.value
                            })}
                            className="w-full p-2 border rounded text-sm"
                            rows={2}
                          />
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => handleApprove(payment)}
                          disabled={approveMutation.isPending}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          size="sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          {approvalForm.paymentId === payment.id && approvalForm.rejectionReason === '' ? 'Confirm' : 'Approve'}
                        </Button>
                        <Button
                          onClick={() => handleReject(payment)}
                          disabled={rejectMutation.isPending}
                          variant="destructive"
                          className="flex-1"
                          size="sm"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          {approvalForm.paymentId === payment.id && approvalForm.rejectionReason !== '' ? 'Confirm' : 'Reject'}
                        </Button>
                      </div>

                      {approvalForm.paymentId === payment.id && (
                        <Button
                          onClick={() => setApprovalForm({ paymentId: null, note: '', rejectionReason: '' })}
                          variant="outline"
                          size="sm"
                          className="w-full"
                        >
                          Cancel
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No pending payment approvals
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* History Tab */}
      {selectedTab === 'history' && (
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingHistory ? (
              <div className="space-y-3">
                <TableSkeleton rows={5} />
              </div>
            ) : historyData.length > 0 ? (
              <div className="space-y-3">
                {historyData.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">
                          {payment.student.firstName} {payment.student.lastName}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(payment.status)}`}>
                          {payment.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Invoice: {payment.fee.invoiceNumber} â€¢ â‚¹{payment.amount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </div>
                      {payment.status === 'REJECTED' && payment.rejectionReason && (
                        <div className="text-sm text-red-600 mt-2">
                          Reason: {payment.rejectionReason}
                        </div>
                      )}
                    </div>
                    {payment.receiptUrl && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={payment.receiptUrl}
                          alt="Receipt"
                          className="w-16 h-16 object-cover rounded cursor-pointer"
                          onClick={() => setSelectedImage(payment.receiptUrl)}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No payment history
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div className="max-w-4xl max-h-screen p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedImage} alt="Receipt" className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
