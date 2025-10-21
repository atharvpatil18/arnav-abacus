'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import Loading from '@/app/loading';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { 
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  Download,
  CreditCard,
  Filter,
  AlertCircle,
  TrendingDown
} from 'lucide-react';

interface Fee {
  id: number;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: 'PENDING' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  category: string;
  studentId: number;
  studentName: string;
  partialAmount?: number;
}

interface FeesData {
  fees: Fee[];
  summary: {
    totalPaid: number;
    totalPending: number;
    totalOverdue: number;
  };
}

export default function ParentFeesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ['parentFees'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<FeesData>('/fees');
        return data;
      } catch {
        return { fees: [], summary: { totalPaid: 0, totalPending: 0, totalOverdue: 0 } };
      }
    },
    enabled: Boolean(user),
  });

  if (authLoading || dataLoading) {
    return <Loading />;
  }

  const fees = data?.fees || [];
  const summary = data?.summary || { totalPaid: 0, totalPending: 0, totalOverdue: 0 };

  const filteredFees = filterStatus === 'all' 
    ? fees 
    : fees.filter(f => f.status.toLowerCase() === filterStatus.toLowerCase());

  const statusConfig = {
    PAID: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    PENDING: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    PARTIAL: { icon: TrendingDown, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
    OVERDUE: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Fee Management
        </h1>
        <p className="text-gray-600">Track payments, view history, and manage outstanding fees</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold text-green-600">₹{summary.totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">₹{summary.totalPending.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">₹{summary.totalOverdue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="w-5 h-5 text-gray-600" />
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === 'all'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilterStatus('paid')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === 'paid'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setFilterStatus('overdue')}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                filterStatus === 'overdue'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Overdue
            </button>
          </div>

          <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg">
            <CreditCard className="w-5 h-5" />
            Pay Now
          </button>
        </div>
      </div>

      {/* Fee Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredFees.map((fee) => {
          const config = statusConfig[fee.status];
          const StatusIcon = config.icon;
          const isOverdue = new Date(fee.dueDate) < new Date() && fee.status !== 'PAID';

          return (
            <div key={fee.id} className={`bg-white rounded-2xl shadow-lg border-2 ${config.border} hover:shadow-xl transition-all duration-300 overflow-hidden`}>
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${config.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <StatusIcon className={`w-6 h-6 ${config.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">{fee.studentName}</h3>
                        <p className="text-gray-600 mb-2">{fee.category}</p>
                        <div className="flex flex-wrap gap-4 text-sm">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {new Date(fee.dueDate).toLocaleDateString()}</span>
                          </div>
                          {fee.paidDate && (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="w-4 h-4" />
                              <span>Paid: {new Date(fee.paidDate).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col items-end justify-between">
                    <div className="text-right mb-4">
                      <p className="text-sm text-gray-600 mb-1">Amount</p>
                      <p className="text-3xl font-bold text-gray-800">₹{fee.amount.toLocaleString()}</p>
                      {fee.status === 'PARTIAL' && fee.partialAmount && (
                        <p className="text-sm text-blue-600 mt-1">
                          Paid: ₹{fee.partialAmount.toLocaleString()}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {fee.status !== 'PAID' && (
                        <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all">
                          Pay
                        </button>
                      )}
                      {fee.status === 'PAID' && (
                        <button className="px-4 py-2 border-2 border-green-600 text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-all flex items-center gap-2">
                          <Download className="w-4 h-4" />
                          Receipt
                        </button>
                      )}
                      <span className={`px-4 py-2 ${config.bg} ${config.color} font-semibold rounded-lg`}>
                        {fee.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Overdue Warning */}
                {isOverdue && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-600 font-medium">
                      This payment is overdue. Please pay as soon as possible to avoid late fees.
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredFees.length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-12 h-12 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {filterStatus === 'all' ? 'No Fee Records' : `No ${filterStatus} Fees`}
          </h2>
          <p className="text-gray-600">
            {filterStatus === 'all' 
              ? 'No fee records available at the moment.'
              : `No fees with status "${filterStatus}" found.`}
          </p>
        </div>
      )}
    </div>
  );
}
