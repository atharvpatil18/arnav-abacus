'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Plus, FileText, List, BarChart, Calendar, TrendingUp, ClipboardCheck } from 'lucide-react';

const features = [
  {
    title: 'Create Test',
    description: 'Create a new test for your batch',
    href: '/teacher/tests/create',
    icon: <Plus className="h-6 w-6" />,
    color: 'bg-blue-500',
    bgGradient: 'from-blue-50 to-blue-100'
  },
  {
    title: 'View Tests',
    description: 'View and manage existing tests',
    href: '/teacher/tests/view',
    icon: <List className="h-6 w-6" />,
    color: 'bg-green-500',
    bgGradient: 'from-green-50 to-green-100'
  },
  {
    title: 'Grade Tests',
    description: 'Enter marks and grade tests',
    href: '/teacher/tests/grade',
    icon: <FileText className="h-6 w-6" />,
    color: 'bg-purple-500',
    bgGradient: 'from-purple-50 to-purple-100'
  },
  {
    title: 'Analytics',
    description: 'View test performance analytics',
    href: '/teacher/tests/analytics',
    icon: <BarChart className="h-6 w-6" />,
    color: 'bg-orange-500',
    bgGradient: 'from-orange-50 to-orange-100'
  }
];

export default function TeacherTestsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
          <ClipboardCheck className="w-8 h-8 text-blue-600" />
          Test Management
        </h1>
        <p className="text-gray-600 mt-1">Create, manage, and grade student tests</p>
      </div>
        
      {/* Main Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature) => (
          <Link key={feature.href} href={feature.href} className="block">
            <Card className={`h-full hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 bg-gradient-to-br ${feature.bgGradient}`}>
              <CardHeader>
                <div className={`w-14 h-14 rounded-xl ${feature.color} text-white flex items-center justify-center mb-4 shadow-lg`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-sm">{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-blue-600 font-medium flex items-center gap-1">
                  Click to access →
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          Quick Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-medium">Upcoming Tests</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">View scheduled tests for next week</p>
            <Link 
              href="/teacher/tests/view?filter=upcoming" 
              className="block w-full"
            >
              <button className="w-full px-4 py-2 text-sm border border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                View Schedule
              </button>
            </Link>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-medium">Pending Grades</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Tests waiting to be graded</p>
            <Link 
              href="/teacher/tests/grade?filter=pending" 
              className="block w-full"
            >
              <button className="w-full px-4 py-2 text-sm border border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors">
                Grade Tests
              </button>
            </Link>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <ClipboardCheck className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-medium">Recent Results</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">View latest test results</p>
            <Link 
              href="/teacher/tests/view?filter=recent" 
              className="block w-full"
            >
              <button className="w-full px-4 py-2 text-sm border border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors">
                View Results
              </button>
            </Link>
          </Card>

          <Card className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <BarChart className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-medium">Performance Trends</h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">Analyze student performance</p>
            <Link 
              href="/teacher/tests/analytics" 
              className="block w-full"
            >
              <button className="w-full px-4 py-2 text-sm border border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                View Analytics
              </button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
