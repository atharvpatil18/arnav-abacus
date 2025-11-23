'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { axiosInstance } from '@/lib/axios';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  IndianRupee,
  Calendar,
  User,
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  enrollmentNumber: string;
}

interface FeeRecord {
  id: number;
  student: Student;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  month: string;
  year: number;
  remarks?: string;
}

export default function TeacherFeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data: feeRecords, isLoading } = useQuery<FeeRecord[]>({
    queryKey: ['teacher-fees'],
    queryFn: async () => {
      const response = await axiosInstance.get('/fees?page=1&limit=1000');
      return Array.isArray(response.data) ? response.data : (response.data as any)?.items || [];
    },
  });

  const calculateStats = () => {
    const records = feeRecords || [];
    const totalCollected = records
      .filter((f) => f.status === 'PAID')
      .reduce((sum, f) => sum + f.amount, 0);
    const totalPending = records
      .filter((f) => f.status === 'PENDING' || f.status === 'OVERDUE')
      .reduce((sum, f) => sum + f.amount, 0);
    
    return {
      total: records.length,
      paid: records.filter((f) => f.status === 'PAID').length,
      pending: records.filter((f) => f.status === 'PENDING').length,
      overdue: records.filter((f) => f.status === 'OVERDUE').length,
      totalCollected,
      totalPending,
    };
  };

  const filterRecords = () => {
    let filtered = feeRecords || [];

    if (filterStatus !== 'all') {
      filtered = filtered.filter((record) => record.status === filterStatus);
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (record) =>
          record.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.student.enrollmentNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'OVERDUE':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDING':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'OVERDUE':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  const handleExport = () => {
    toast.info('Exporting fee records...');
  };

  const stats = calculateStats();
  const filteredRecords = filterRecords();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Fee Management
        </h1>
        <p className="text-gray-600">View and track student fee payments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-blue-100 text-sm mb-1">Total Records</p>
            <p className="text-4xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-green-100 text-sm mb-1">Paid</p>
            <p className="text-4xl font-bold">{stats.paid}</p>
            <p className="text-sm text-green-100 mt-2">₹{stats.totalCollected.toLocaleString()}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-yellow-100 text-sm mb-1">Pending</p>
            <p className="text-4xl font-bold">{stats.pending}</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-red-500 to-red-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-red-100 text-sm mb-1">Overdue</p>
            <p className="text-4xl font-bold">{stats.overdue}</p>
            <p className="text-sm text-red-100 mt-2">₹{stats.totalPending.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-lg border-none lg:col-span-2">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                asChild
                variant="outline"
                className="justify-start hover:bg-blue-50 transition-colors"
              >
                <Link href="/teacher/fees/pending">
                  <Clock className="w-4 h-4 mr-2" />
                  View Pending Fees
                </Link>
              </Button>
              <Button
                onClick={handleExport}
                variant="outline"
                className="justify-start hover:bg-green-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Records
              </Button>
              <Button
                variant="outline"
                className="justify-start hover:bg-purple-50 transition-colors"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="w-5 h-5 text-green-600" />
              Collection Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700">Total Collected</span>
                <span className="font-bold text-green-700">₹{stats.totalCollected.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm text-gray-700">Total Pending</span>
                <span className="font-bold text-red-700">₹{stats.totalPending.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-lg border-none mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by student name or enrollment number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
                className={filterStatus === 'all' ? 'bg-blue-600' : ''}
              >
                <Filter className="w-4 h-4 mr-1" />
                All
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'PAID' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('PAID')}
                className={filterStatus === 'PAID' ? 'bg-green-600' : ''}
              >
                Paid
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'PENDING' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('PENDING')}
                className={filterStatus === 'PENDING' ? 'bg-yellow-600' : ''}
              >
                Pending
              </Button>
              <Button
                size="sm"
                variant={filterStatus === 'OVERDUE' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('OVERDUE')}
                className={filterStatus === 'OVERDUE' ? 'bg-red-600' : ''}
              >
                Overdue
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fee Records Table */}
      <Card className="shadow-lg border-none">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle>Fee Records</CardTitle>
          <CardDescription>
            Showing {filteredRecords.length} of {feeRecords?.length || 0} records
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Enrollment No.
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Period
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {record.student.firstName} {record.student.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm text-gray-600">
                        {record.student.enrollmentNumber}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {record.month} {record.year}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-900">
                          ₹{record.amount.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(record.dueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(record.status)}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              record.status
                            )}`}
                          >
                            {record.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No fee records found</p>
              <p className="text-sm mt-1">Try adjusting your search or filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
