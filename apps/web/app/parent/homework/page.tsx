'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import Loading from '@/app/loading';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  Calendar,
  Download,
  Upload,
  AlertCircle,
  FileText,
  Award,
  Filter
} from 'lucide-react';

interface Homework {
  id: number;
  title: string;
  description: string;
  subject: string;
  dueDate: string;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED' | 'OVERDUE';
  studentName: string;
  studentId: number;
  submittedDate?: string;
  grade?: number;
  feedback?: string;
  attachmentUrl?: string;
}

interface HomeworkData {
  homework: Homework[];
  stats: {
    total: number;
    pending: number;
    submitted: number;
    graded: number;
    overdue: number;
  };
}

export default function ParentHomeworkPage() {
  const { user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['homework', user?.id],
    queryFn: async (): Promise<HomeworkData> => {
      const response = await apiClient.get<HomeworkData>('/homework/parent');
      return response.data;
    },
    enabled: !!user,
  });

  if (isLoading) return <Loading />;

  const homework = data?.homework || [];
  const stats = data?.stats || { total: 0, pending: 0, submitted: 0, graded: 0, overdue: 0 };

  const statusConfig = {
    PENDING: {
      icon: Clock,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      label: 'Pending'
    },
    SUBMITTED: {
      icon: Upload,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      label: 'Submitted'
    },
    GRADED: {
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-200',
      label: 'Graded'
    },
    OVERDUE: {
      icon: AlertCircle,
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: 'Overdue'
    }
  };

  const filteredHomework = homework.filter(hw => {
    if (filterStatus === 'all') return true;
    return hw.status.toLowerCase() === filterStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate: string, status: string) => {
    return status === 'PENDING' && new Date(dueDate) < new Date();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          Homework & Assignments
        </h1>
        <p className="text-gray-600">Track assignments and submissions for all your children</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Submitted</p>
          <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Graded</p>
          <p className="text-2xl font-bold text-green-600">{stats.graded}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Overdue</p>
          <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-semibold text-gray-900">Filter:</span>
          </div>
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === 'pending'
                ? 'bg-yellow-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilterStatus('submitted')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === 'submitted'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Submitted
          </button>
          <button
            onClick={() => setFilterStatus('graded')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === 'graded'
                ? 'bg-green-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Graded
          </button>
          <button
            onClick={() => setFilterStatus('overdue')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filterStatus === 'overdue'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overdue
          </button>
        </div>
      </div>

      {/* Homework List */}
      {filteredHomework.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BookOpen className="w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Homework Found</h3>
          <p className="text-gray-600">
            {filterStatus === 'all' 
              ? "No homework assignments at the moment." 
              : `No ${filterStatus} homework assignments.`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredHomework.map((hw) => {
            const config = statusConfig[hw.status];
            const StatusIcon = config.icon;
            const overdueStatus = isOverdue(hw.dueDate, hw.status);

            return (
              <div
                key={hw.id}
                className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all border-l-4 ${
                  overdueStatus ? 'border-red-500' : config.border
                }`}
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 ${config.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <StatusIcon className={`w-6 h-6 ${config.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">{hw.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{hw.studentName}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            {hw.subject}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Due: {formatDate(hw.dueDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className={`px-4 py-2 ${config.bg} ${config.border} border rounded-lg`}>
                      <span className={`font-semibold ${config.color}`}>{config.label}</span>
                    </div>
                  </div>

                  {/* Overdue Warning */}
                  {overdueStatus && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-sm text-red-700 font-medium">
                        This assignment is overdue! Please submit as soon as possible.
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-gray-700 mb-4 pl-16">{hw.description}</p>

                  {/* Submission Info */}
                  {hw.submittedDate && (
                    <div className="pl-16 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span>Submitted on {formatDate(hw.submittedDate)}</span>
                      </div>
                    </div>
                  )}

                  {/* Grade and Feedback */}
                  {hw.status === 'GRADED' && (
                    <div className="pl-16 mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <Award className="w-5 h-5 text-green-600" />
                        <span className="font-semibold text-green-900">
                          Grade: {hw.grade}/100
                        </span>
                      </div>
                      {hw.feedback && (
                        <p className="text-sm text-gray-700 ml-8">{hw.feedback}</p>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pl-16">
                    {hw.attachmentUrl && (
                      <button className="flex items-center gap-2 px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-all font-medium">
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    )}
                    {hw.status === 'PENDING' && (
                      <button className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all font-medium">
                        <Upload className="w-4 h-4" />
                        Submit
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
