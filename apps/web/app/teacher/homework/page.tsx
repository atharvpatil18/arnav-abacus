'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Loading from '@/app/loading';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { 
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  Filter,
  FileText,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageTransition } from '@/components/ui/page-transition';

interface Homework {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  batchId: number;
  batchName: string;
  status: 'PENDING' | 'SUBMITTED' | 'GRADED';
  submissionCount: number;
  totalStudents: number;
}

interface HomeworkData {
  homework: Homework[];
  summary: {
    totalAssignments: number;
    pendingGrading: number;
    completed: number;
  };
}

export default function TeacherHomeworkPage() {
  const router = useRouter();
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ['teacherHomework'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<HomeworkData>('/homework');
        return data;
      } catch {
        return { homework: [], summary: { totalAssignments: 0, pendingGrading: 0, completed: 0 } };
      }
    },
  });

  if (dataLoading) {
    return <Loading />;
  }

  const homework = data?.homework || [];
  const summary = data?.summary || { totalAssignments: 0, pendingGrading: 0, completed: 0 };

  const filteredHomework = filterStatus === 'all' 
    ? homework 
    : homework.filter((h: Homework) => h.status.toLowerCase() === filterStatus.toLowerCase());

  const statusConfig = {
    GRADED: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    PENDING: { icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
    SUBMITTED: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-6 animate-in fade-in">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-gradient">
            Homework Management
          </h1>
          <p className="text-gray-600">Create assignments, track submissions, and grade student work</p>
        </div>
        <Button
          onClick={() => router.push('/teacher/homework/create')}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Homework
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Assignments</p>
              <p className="text-2xl font-bold text-purple-600">{summary.totalAssignments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pending Grading</p>
              <p className="text-2xl font-bold text-yellow-600">{summary.pendingGrading}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 card-hover">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{summary.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-5 h-5 text-gray-600" />
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterStatus === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
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
            onClick={() => setFilterStatus('submitted')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterStatus === 'submitted'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Submitted
          </button>
          <button
            onClick={() => setFilterStatus('graded')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filterStatus === 'graded'
                ? 'bg-green-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Graded
          </button>
        </div>
      </div>

      {/* Homework Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHomework.map((hw) => {
          const config = statusConfig[hw.status as keyof typeof statusConfig] || statusConfig.PENDING;
          const StatusIcon = config.icon;

          return (
            <div 
              key={hw.id} 
              onClick={() => router.push(`/teacher/homework/${hw.id}/submissions`)}
              className={`bg-white rounded-2xl shadow-lg border-2 ${config.border} hover:shadow-xl transition-all duration-300 cursor-pointer card-hover animate-in slide-in-from-bottom`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 ${config.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                    <StatusIcon className={`w-6 h-6 ${config.color}`} />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.color}`}>
                    {hw.status}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-2">{hw.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{hw.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{hw.batchName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>Submissions: {hw.submissionCount}/{hw.totalStudents}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredHomework.length === 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center animate-in fade-in">
          <div className="mb-4">
            <BookOpen className="w-20 h-20 mx-auto text-purple-400 animate-bounce" />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">No homework assignments found</h3>
          <p className="text-gray-600 mb-6">Create your first homework assignment to get started!</p>
          <Button
            onClick={() => router.push('/teacher/homework/create')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Homework
          </Button>
        </div>
      )}
    </div>
    </PageTransition>
  );
}

