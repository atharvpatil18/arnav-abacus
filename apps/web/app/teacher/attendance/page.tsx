'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import MainLayout from '@/components/layout/main-layout';

interface Batch {
  id: number;
  name: string;
}

interface Student {
  id: number;
  firstName: string;
  lastName: string;
}

interface AttendanceEntry {
  studentId: number;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  note?: string;
}

export default function AttendanceDashboardPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Attendance Management</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/teacher/attendance/mark')}
          >
            <h2 className="text-xl font-semibold mb-2">Mark Attendance</h2>
            <p className="text-gray-600 mb-4">
              Take daily attendance for your classes. Record student presence, absences, and late arrivals.
            </p>
            <Button className="w-full">Mark Attendance</Button>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/teacher/attendance/view')}
          >
            <h2 className="text-xl font-semibold mb-2">View Records</h2>
            <p className="text-gray-600 mb-4">
              Browse and analyze attendance records. View statistics and generate reports.
            </p>
            <Button className="w-full">View Records</Button>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push('/teacher/attendance/reports')}
          >
            <h2 className="text-xl font-semibold mb-2">Reports & Analytics</h2>
            <p className="text-gray-600 mb-4">
              Generate detailed attendance reports, analyze trends, and track student attendance patterns.
            </p>
            <Button className="w-full">View Reports</Button>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4">
              <h3 className="font-medium mb-1">Today&apos;s Overview</h3>
              <p className="text-sm text-gray-600">Quick summary of today&apos;s attendance status</p>
              <Button 
                variant="outline" 
                className="w-full mt-3"
                onClick={() => router.push('/teacher/attendance/view')}
              >
                View Today
              </Button>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-1">Missing Records</h3>
              <p className="text-sm text-gray-600">Check for any missing attendance records</p>
              <Button 
                variant="outline" 
                className="w-full mt-3"
                onClick={() => router.push('/teacher/attendance/view')}
              >
                Check Missing
              </Button>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-1">Monthly Report</h3>
              <p className="text-sm text-gray-600">Generate this month&apos;s attendance report</p>
              <Button 
                variant="outline" 
                className="w-full mt-3"
                onClick={() => router.push('/teacher/attendance/reports')}
              >
                Generate Report
              </Button>
            </Card>

            <Card className="p-4">
              <h3 className="font-medium mb-1">Search Student</h3>
              <p className="text-sm text-gray-600">Look up individual student information</p>
              <Button 
                variant="outline" 
                className="w-full mt-3"
                onClick={() => router.push('/teacher/students')}
              >
                Search Student
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
