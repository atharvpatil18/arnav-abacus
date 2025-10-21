'use client';

import { useAuth } from '@/lib/auth';
import Loading from '@/app/loading';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { 
  User, 
  GraduationCap, 
  Calendar, 
  Award, 
  Clock,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  TrendingUp,
  Users
} from 'lucide-react';

interface Student {
  id: number;
  name: string;
  level: number;
  batch: {
    id: number;
    name: string;
    timeSlot: string;
  };
  enrollmentDate: string;
  photoUrl?: string;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
  };
  stats?: {
    attendanceRate: number;
    averageScore: number;
    totalTests: number;
    rank?: number;
  };
}

interface ChildrenData {
  children: Student[];
}

export default function ParentStudentsPage() {
  const { user, isLoading: authLoading } = useAuth();

  const { data, isLoading: dataLoading } = useQuery({
    queryKey: ['parentChildren'],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<ChildrenData>('/parents/children');
        return data;
      } catch {
        return { children: [] };
      }
    },
    enabled: Boolean(user),
  });

  if (authLoading || dataLoading) {
    return <Loading />;
  }

  const children = data?.children || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          My Children
        </h1>
        <p className="text-gray-600">View and manage your children&apos;s academic profiles</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Children</p>
              <p className="text-2xl font-bold text-gray-800">{children.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Attendance</p>
              <p className="text-2xl font-bold text-gray-800">
                {children.length > 0
                  ? (children.reduce((sum, c) => sum + (c.stats?.attendanceRate || 0), 0) / children.length).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Score</p>
              <p className="text-2xl font-bold text-gray-800">
                {children.length > 0
                  ? (children.reduce((sum, c) => sum + (c.stats?.averageScore || 0), 0) / children.length).toFixed(1)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {children.map((child) => (
          <div key={child.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-lg flex items-center justify-center flex-shrink-0">
                  {child.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={child.photoUrl} alt={child.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white mb-1">{child.name}</h2>
                  <div className="flex items-center gap-2 text-white/80 mb-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>Level {child.level}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Enrolled {new Date(child.enrollmentDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-4">
              {/* Batch Info */}
              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-xl">
                <div>
                  <p className="text-sm text-gray-600">Batch</p>
                  <p className="font-semibold text-gray-800">{child.batch.name}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Time</p>
                  <p className="font-semibold text-gray-800">{child.batch.timeSlot}</p>
                </div>
              </div>

              {/* Performance Stats */}
              {child.stats && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Calendar className="w-5 h-5 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-green-600">{child.stats.attendanceRate.toFixed(0)}%</p>
                    <p className="text-xs text-gray-600">Attendance</p>
                  </div>

                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Award className="w-5 h-5 text-yellow-600" />
                    </div>
                    <p className="text-2xl font-bold text-yellow-600">{child.stats.averageScore.toFixed(0)}%</p>
                    <p className="text-xs text-gray-600">Avg Score</p>
                  </div>

                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-600">{child.stats.totalTests}</p>
                    <p className="text-xs text-gray-600">Tests</p>
                  </div>
                </div>
              )}

              {/* Contact Info */}
              {child.contact && (
                <div className="space-y-2 pt-4 border-t">
                  {child.contact.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{child.contact.phone}</span>
                    </div>
                  )}
                  {child.contact.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{child.contact.email}</span>
                    </div>
                  )}
                  {child.contact.address && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{child.contact.address}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg">
                  View Details
                </button>
                <button 
                  className="px-6 py-3 border-2 border-purple-600 text-purple-600 font-semibold rounded-lg hover:bg-purple-50 transition-all duration-300"
                  title="View Progress"
                  aria-label="View student progress"
                >
                  <TrendingUp className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {children.length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-12 h-12 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Children Found</h2>
          <p className="text-gray-600">Contact the administrator to link your children to your account.</p>
        </div>
      )}
    </div>
  );
}
