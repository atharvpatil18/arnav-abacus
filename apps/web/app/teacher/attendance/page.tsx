'use client';

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardCheck, Eye, BarChart3, Calendar, Users, FileSearch, TrendingUp } from 'lucide-react';

export default function AttendanceDashboardPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
          <ClipboardCheck className="w-8 h-8 text-blue-600" />
          Attendance Management
        </h1>
        <p className="text-gray-600 mt-1">Manage student attendance and generate reports</p>
      </div>
        
      {/* Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 bg-gradient-to-br from-white to-blue-50">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <ClipboardCheck className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold">Mark Attendance</h2>
            <p className="text-gray-600 text-sm">
              Take daily attendance for your classes. Record student presence, absences, and late arrivals.
            </p>
            <Button className="w-full mt-2" onClick={() => router.push('/teacher/attendance/mark')}>Mark Attendance</Button>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-green-500 bg-gradient-to-br from-white to-green-50">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Eye className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold">View Records</h2>
            <p className="text-gray-600 text-sm">
              Browse and analyze attendance records. View statistics and individual student history.
            </p>
            <Button className="w-full mt-2" onClick={() => router.push('/teacher/attendance/view')}>View Records</Button>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-500 bg-gradient-to-br from-white to-purple-50">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
            <h2 className="text-xl font-semibold">Reports & Analytics</h2>
            <p className="text-gray-600 text-sm">
              Generate detailed attendance reports, analyze trends, and track patterns.
            </p>
            <Button className="w-full mt-2" onClick={() => router.push('/teacher/attendance/reports')}>View Reports</Button>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-medium">Today&apos;s Overview</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Quick summary of today&apos;s attendance status</p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/teacher/attendance/view')}
            >
              View Today
            </Button>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileSearch className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-medium">Missing Records</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Check for any missing attendance records</p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/teacher/attendance/view')}
            >
              Check Missing
            </Button>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-medium">Monthly Report</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Generate this month&apos;s attendance report</p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/teacher/attendance/reports')}
            >
              Generate Report
            </Button>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-medium">Search Student</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Look up individual student information</p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => router.push('/teacher/students')}
            >
              Search Student
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
