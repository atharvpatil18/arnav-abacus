'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { axiosInstance } from '@/lib/axios';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  User
} from 'lucide-react';

interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
}

interface LeaveRequest {
  id: number;
  teacher: Teacher;
  type: 'MEDICAL' | 'CASUAL' | 'EMERGENCY' | 'VACATION';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  responseNote?: string;
  createdAt: string;
}

export default function LeaveRequestsPage() {
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const { data: leaveRequests, isLoading } = useQuery<LeaveRequest[]>({
    queryKey: ['leave-requests'],
    queryFn: async () => {
      const response = await axiosInstance.get('/leave?page=1&limit=1000');
      return Array.isArray(response.data) ? response.data : (response.data as any)?.items || [];
    },
  });

  const { data: teachers } = useQuery<Teacher[]>({
    queryKey: ['teachers'],
    queryFn: async () => {
      const response = await axiosInstance.get('/teacher?page=1&limit=1000');
      return Array.isArray(response.data) ? response.data : (response.data as any)?.items || [];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      responseNote,
    }: {
      id: number;
      status: 'APPROVED' | 'REJECTED';
      responseNote: string;
    }) => {
      return axiosInstance.patch(`/leave/${id}`, {
        status,
        responseNote,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      alert('Leave request updated successfully!');
    },
    onError: () => {
      alert('Failed to update leave request');
    },
  });

  const handleApprove = (id: number) => {
    const note = prompt('Add a note (optional):');
    if (note !== null) {
      updateStatusMutation.mutate({
        id,
        status: 'APPROVED',
        responseNote: note,
      });
    }
  };

  const handleReject = (id: number) => {
    const note = prompt('Reason for rejection:');
    if (note) {
      updateStatusMutation.mutate({
        id,
        status: 'REJECTED',
        responseNote: note,
      });
    }
  };

  const filterRequests = () => {
    let filtered = leaveRequests || [];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((req) => req.status === filterStatus);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((req) => req.type === filterType);
    }

    return filtered;
  };

  const calculateStats = () => {
    const requests = leaveRequests || [];
    return {
      totalRequests: requests.length,
      pending: requests.filter((r) => r.status === 'PENDING').length,
      approved: requests.filter((r) => r.status === 'APPROVED').length,
      rejected: requests.filter((r) => r.status === 'REJECTED').length,
    };
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'MEDICAL':
        return 'bg-red-100 text-red-700';
      case 'CASUAL':
        return 'bg-blue-100 text-blue-700';
      case 'EMERGENCY':
        return 'bg-orange-100 text-orange-700';
      case 'VACATION':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const stats = calculateStats();
  const filteredRequests = filterRequests();

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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Leave Requests
          </h1>
          <p className="text-gray-600 mt-1">Manage teacher leave requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Total Requests</p>
                <p className="text-2xl font-bold text-blue-800">{stats.totalRequests}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Approved</p>
                <p className="text-2xl font-bold text-green-800">{stats.approved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Rejected</p>
                <p className="text-2xl font-bold text-red-800">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'PENDING' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('PENDING')}
              >
                Pending
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'APPROVED' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('APPROVED')}
              >
                Approved
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'REJECTED' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('REJECTED')}
              >
                Rejected
              </Button>
            </div>

            <div className="flex-1">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full md:w-48 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                aria-label="Filter by leave type"
              >
                <option value="all">All Types</option>
                <option value="MEDICAL">Medical</option>
                <option value="CASUAL">Casual</option>
                <option value="EMERGENCY">Emergency</option>
                <option value="VACATION">Vacation</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leave Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const days = calculateDays(request.startDate, request.endDate);
                return (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="font-semibold">
                            {request.teacher.firstName} {request.teacher.lastName}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getLeaveTypeColor(request.type)}`}>
                            {request.type}
                          </span>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              request.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : request.status === 'APPROVED'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {request.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(request.startDate).toLocaleDateString()} -{' '}
                              {new Date(request.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <span className="font-semibold">{days} day{days > 1 ? 's' : ''}</span>
                        </div>

                        <p className="text-gray-700 mb-2">
                          <span className="font-medium">Reason:</span> {request.reason}
                        </p>

                        {request.responseNote && (
                          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                            <span className="font-medium">Response:</span> {request.responseNote}
                          </p>
                        )}

                        <p className="text-xs text-gray-400 mt-2">
                          Requested on {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      {request.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            disabled={updateStatusMutation.isPending}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleReject(request.id)}
                            disabled={updateStatusMutation.isPending}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No leave requests found</p>
              <p className="text-sm mt-1">
                {filterStatus !== 'all' || filterType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Leave requests will appear here'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
