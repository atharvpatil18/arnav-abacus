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
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-slate-500">Welcome back! Here&apos;s what&apos;s happening with your academy today.</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Students Card */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-primary-600 to-primary-700 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-24 h-24" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center text-sm bg-white/20 px-2 py-1 rounded-full">
                <ArrowUp className="w-4 h-4 mr-1" />
                <span>12%</span>
              </div>
            </div>
            <p className="text-primary-100 text-sm mb-1 font-medium">Total Students</p>
            <p className="text-4xl font-bold tracking-tight">{stats?.totalStudents || 0}</p>
          </CardContent>
        </Card>

        {/* Active Batches Card */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <GraduationCap className="w-24 h-24" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center text-sm bg-white/20 px-2 py-1 rounded-full">
                <ArrowUp className="w-4 h-4 mr-1" />
                <span>5%</span>
              </div>
            </div>
            <p className="text-secondary-100 text-sm mb-1 font-medium">Active Batches</p>
            <p className="text-4xl font-bold tracking-tight">{stats?.activeBatches || 0}</p>
          </CardContent>
        </Card>

        {/* Attendance Card */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="w-24 h-24" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center text-sm bg-white/20 px-2 py-1 rounded-full">
                <ArrowUp className="w-4 h-4 mr-1" />
                <span>3%</span>
              </div>
            </div>
            <p className="text-emerald-100 text-sm mb-1 font-medium">Overall Attendance</p>
            <p className="text-4xl font-bold tracking-tight">
              {stats?.attendancePercentOverall?.toFixed(1) || 0}%
            </p>
          </CardContent>
        </Card>

        {/* Fees Due Card */}
        <Card className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-rose-500 to-rose-600 text-white overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <IndianRupee className="w-24 h-24" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                <IndianRupee className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center text-sm bg-white/20 px-2 py-1 rounded-full">
                <ArrowDown className="w-4 h-4 mr-1" />
                <span>8%</span>
              </div>
            </div>
            <p className="text-rose-100 text-sm mb-1 font-medium">Fees Due</p>
            <p className="text-4xl font-bold tracking-tight">₹{stats?.feesDue?.toLocaleString() || 0}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions Card */}
        <Card className="shadow-sm border border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <GraduationCap className="w-5 h-5 text-primary-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-3">
              <Button variant="outline" asChild className="justify-start hover:bg-slate-50 hover:text-primary-600 hover:border-primary-200 transition-all duration-200">
                <a href="/admin/students">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Students
                </a>
              </Button>
              <Button variant="outline" asChild className="justify-start hover:bg-slate-50 hover:text-primary-600 hover:border-primary-200 transition-all duration-200">
                <a href="/admin/batches">
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Manage Batches
                </a>
              </Button>
              <Button variant="outline" asChild className="justify-start hover:bg-slate-50 hover:text-primary-600 hover:border-primary-200 transition-all duration-200">
                <a href="/admin/levels">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Manage Levels
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Data Card */}
        <Card className="shadow-sm border border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <Download className="w-5 h-5 text-secondary-600" />
              Export Data
            </CardTitle>
            <CardDescription className="text-slate-500">Download data in CSV format</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-3">
              <Button 
                onClick={() => handleExport('students')} 
                className="bg-emerald-600 hover:bg-emerald-700 justify-start text-white shadow-sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export Students
              </Button>
              <Button 
                onClick={() => handleExport('attendance')}
                className="bg-primary-600 hover:bg-primary-700 justify-start text-white shadow-sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export Attendance
              </Button>
              <Button 
                onClick={() => handleExport('fees')}
                className="bg-secondary-600 hover:bg-secondary-700 justify-start text-white shadow-sm"
              >
                <FileText className="w-4 h-4 mr-2" />
                Export Fees
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Issues Card */}
        <Card className="shadow-sm border border-slate-200 bg-white">
          <CardHeader className="border-b border-slate-100 pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              Attendance Alerts
            </CardTitle>
            <CardDescription className="text-slate-500">
              Students with low attendance this month
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {attendanceIssues.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {attendanceIssues.slice(0, 5).map((issue: AttendanceIssue, index: number) => (
                  <div key={index} className="p-3 bg-rose-50 rounded-lg border border-rose-100 hover:border-rose-200 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-slate-900">{issue.studentName}</p>
                        <p className="text-sm text-slate-500">
                          {issue.batchName}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-medium rounded-full">
                        {issue.absencesThisMonth} absences
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Last: {issue.lastAttendance ? format(new Date(issue.lastAttendance), 'MMM d') : 'Never'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <AlertCircle className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                <p>No attendance issues</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}