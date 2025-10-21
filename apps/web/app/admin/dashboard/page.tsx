'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { toast } from '@/components/ui/use-toast';
import { axiosInstance } from '@/lib/axios';
import type { ApiResponse, DashboardStats, AttendanceIssue } from '@/types/api';
import { 
  Users, 
  GraduationCap, 
  TrendingUp, 
  IndianRupee,
  AlertCircle,
  Download,
  FileText,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

export default function AdminDashboard() {
  const [attendanceIssues, setAttendanceIssues] = useState<AttendanceIssue[]>([]);

  const { data: stats, isLoading, error } = useQuery<DashboardStats, Error>({
    queryKey: ['dashboardStats'],
    queryFn: async () => {
      const response = await axiosInstance.get<ApiResponse<DashboardStats>>('/reports/dashboard');
      return response.data.data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  useEffect(() => {
    const getAttendanceIssues = async () => {
      try {
        const response = await axiosInstance.get<ApiResponse<AttendanceIssue[]>>('/reports/attendance-issues');
        setAttendanceIssues(response.data.data);
      } catch (err) {
        console.error('Failed to fetch attendance issues:', err);
        toast.error('Failed to fetch attendance issues');
      }
    };
    void getAttendanceIssues();
  }, []);

  const handleExport = async (type: string) => {
    try {
      const response = await axiosInstance.get(`/reports/export/${type}`, {
        responseType: 'text'
      });
      
      const csv = response.data as string;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success(`${type} data exported successfully`);
    } catch (err) {
      console.error('Failed to export file:', err);
      toast.error('Could not generate export file');
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><CircularProgress /></div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">Error loading dashboard data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">No data available</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your academy today.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Students Card */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center text-sm bg-white/20 px-2 py-1 rounded-full">
                <ArrowUp className="w-4 h-4 mr-1" />
                <span>12%</span>
              </div>
            </div>
            <p className="text-blue-100 text-sm mb-1">Total Students</p>
            <p className="text-4xl font-bold">{stats?.totalStudents || 0}</p>
          </CardContent>
        </Card>

        {/* Active Batches Card */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-purple-500 to-purple-600 text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center text-sm bg-white/20 px-2 py-1 rounded-full">
                <ArrowUp className="w-4 h-4 mr-1" />
                <span>5%</span>
              </div>
            </div>
            <p className="text-purple-100 text-sm mb-1">Active Batches</p>
            <p className="text-4xl font-bold">{stats?.activeBatches || 0}</p>
          </CardContent>
        </Card>

        {/* Attendance Card */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-green-500 to-green-600 text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center text-sm bg-white/20 px-2 py-1 rounded-full">
                <ArrowUp className="w-4 h-4 mr-1" />
                <span>3%</span>
              </div>
            </div>
            <p className="text-green-100 text-sm mb-1">Overall Attendance</p>
            <p className="text-4xl font-bold">
              {stats?.attendancePercentOverall?.toFixed(1) || 0}%
            </p>
          </CardContent>
        </Card>

        {/* Fees Due Card */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-orange-500 to-red-500 text-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center text-sm bg-white/20 px-2 py-1 rounded-full">
                <ArrowDown className="w-4 h-4 mr-1" />
                <span>8%</span>
              </div>
            </div>
            <p className="text-orange-100 text-sm mb-1">Fees Due</p>
            <p className="text-4xl font-bold">₹{stats?.feesDue?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Quick Actions Card */}
        <Card className="shadow-lg border-none">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-purple-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-3">
              <Button variant="outline" asChild className="justify-start hover:bg-purple-50 transition-colors">
                <a href="/admin/students">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Students
                </a>
              </Button>
              <Button variant="outline" asChild className="justify-start hover:bg-blue-50 transition-colors">
                <a href="/admin/batches">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Manage Batches
                </a>
              </Button>
              <Button variant="outline" asChild className="justify-start hover:bg-green-50 transition-colors">
                <a href="/admin/levels">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Manage Levels
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Data Card */}
        <Card className="shadow-lg border-none">
          <CardHeader className="bg-gradient-to-r from-green-50 to-teal-50">
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-green-600" />
              Export Data
            </CardTitle>
            <CardDescription>Download data in CSV format</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={() => handleExport('students')} 
                className="bg-green-600 hover:bg-green-700 justify-start"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export Students
              </Button>
              <Button 
                onClick={() => handleExport('attendance')}
                className="bg-blue-600 hover:bg-blue-700 justify-start"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export Attendance
              </Button>
              <Button 
                onClick={() => handleExport('fees')}
                className="bg-purple-600 hover:bg-purple-700 justify-start"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export Fees
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Issues Card */}
        <Card className="shadow-lg border-none">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              Attendance Alerts
            </CardTitle>
            <CardDescription>
              Students with low attendance this month
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {attendanceIssues.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {attendanceIssues.slice(0, 5).map((issue: AttendanceIssue, index: number) => (
                  <div key={index} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <p className="font-medium text-gray-900">{issue.studentName}</p>
                    <p className="text-sm text-gray-600">
                      {issue.batchName}
                    </p>
                    <p className="text-sm text-orange-600 font-semibold">
                      {issue.absencesThisMonth} absences
                    </p>
                    <p className="text-xs text-gray-500">
                      Last: {issue.lastAttendance ? format(new Date(issue.lastAttendance), 'MMM d') : 'Never'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No attendance issues</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}