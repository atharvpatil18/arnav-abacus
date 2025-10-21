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
      const response = await axiosInstance.get<Blob>(`/reports/export/${type}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.totalStudents}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Batches</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{stats.activeBatches}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">
              {stats.attendancePercentOverall.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fees Due</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">₹{stats.feesDue.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <Button variant="outline" asChild>
                <a href="/admin/students">Manage Students</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/admin/batches">Manage Batches</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/admin/levels">Manage Levels</a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Export Data</CardTitle>
            <CardDescription>Download data in CSV format</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-2">
              <Button onClick={() => handleExport('students')}>
                Export Students
              </Button>
              <Button onClick={() => handleExport('attendance')}>
                Export Attendance
              </Button>
              <Button onClick={() => handleExport('fees')}>
                Export Fees
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Attendance Issues</CardTitle>
            <CardDescription>
              Students with attendance below threshold this month
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceIssues.length > 0 ? (
              <div className="divide-y">
                {attendanceIssues.map((issue: AttendanceIssue, index: number) => (
                  <div key={index} className="py-3">
                    <p className="font-medium">{issue.studentName}</p>
                    <p className="text-sm text-gray-500">
                      {issue.batchName} - {issue.absencesThisMonth} absences
                    </p>
                    <p className="text-sm text-gray-500">
                      Last attended: {issue.lastAttendance ? format(new Date(issue.lastAttendance), 'MMM d, yyyy') : 'Never'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No attendance issues to report</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}