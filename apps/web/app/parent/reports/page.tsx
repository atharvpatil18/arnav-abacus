'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import Loading from '@/app/loading';
import { 
  TrendingUp, 
  Calendar,
  Award,
  Target,
  BarChart3,
  Download,
  Star,
  BookOpen,
  Brain,
  Clock
} from 'lucide-react';
import {
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Student {
  id: number;
  name: string;
  level: number;
  progress: number;
  stats: {
    attendanceRate: number;
    averageScore: number;
    totalTests: number;
    rank?: number;
  };
}

interface ProgressData {
  students: Student[];
  testScoresOverTime: Array<{ month: string; score: number }>;
  skillAssessment: Array<{ skill: string; score: number }>;
  achievements: Array<{
    id: number;
    title: string;
    description: string;
    earnedDate: string;
    icon: string;
  }>;
}

export default function ParentReportsPage() {
  const { user } = useAuth();
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['progress-reports', user?.id, selectedStudent],
    queryFn: async (): Promise<ProgressData> => {
      const response = await apiClient.get<{ children: any[] }>('/parents/children');
      const students = response.data.children || [];
      
      // Mock data for demonstration
      return {
        students,
        testScoresOverTime: [
          { month: 'Jan', score: 75 },
          { month: 'Feb', score: 78 },
          { month: 'Mar', score: 82 },
          { month: 'Apr', score: 85 },
          { month: 'May', score: 88 },
          { month: 'Jun', score: 90 }
        ],
        skillAssessment: [
          { skill: 'Addition', score: 90 },
          { skill: 'Subtraction', score: 85 },
          { skill: 'Multiplication', score: 88 },
          { skill: 'Division', score: 82 },
          { skill: 'Mental Math', score: 87 },
          { skill: 'Speed', score: 84 }
        ],
        achievements: [
          {
            id: 1,
            title: 'Perfect Attendance',
            description: 'Attended all classes for 3 months',
            earnedDate: '2024-09-15',
            icon: 'star'
          },
          {
            id: 2,
            title: 'Quick Learner',
            description: 'Completed Level 5 in record time',
            earnedDate: '2024-08-20',
            icon: 'brain'
          },
          {
            id: 3,
            title: 'Top Scorer',
            description: 'Scored 100% in 5 consecutive tests',
            earnedDate: '2024-07-10',
            icon: 'award'
          }
        ]
      };
    },
    enabled: !!user,
  });

  if (isLoading) return <Loading />;

  const students = data?.students || [];
  const currentStudent = selectedStudent 
    ? students.find(s => s.id === selectedStudent)
    : students[0];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Academic Progress
          </h1>
          <p className="text-gray-600">Track performance and achievements</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-medium">
          <Download className="w-5 h-5" />
          Download Report
        </button>
      </div>

      {/* Student Selector */}
      {students.length > 1 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="font-semibold text-gray-900">Select Student:</span>
            {students.map((student) => (
              <button
                key={student.id}
                onClick={() => setSelectedStudent(student.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  (selectedStudent || students[0].id) === student.id
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {student.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {!currentStudent ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-12 h-12 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Data Available</h3>
          <p className="text-gray-600">No progress data found for your children.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600">Current Level</p>
              <p className="text-3xl font-bold text-gray-900">{currentStudent.level}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600">Attendance</p>
              <p className="text-3xl font-bold text-green-600">{currentStudent.stats.attendanceRate}%</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                  <Award className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-3xl font-bold text-yellow-600">{currentStudent.stats.averageScore}%</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600">Total Tests</p>
              <p className="text-3xl font-bold text-blue-600">{currentStudent.stats.totalTests}</p>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Level Progress</h2>
            </div>
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Level {currentStudent.level}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  {currentStudent.progress}% Complete
                </span>
              </div>
              <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
                {/* eslint-disable-next-line react/forbid-dom-props */}
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-500 flex items-center justify-end pr-3"
                  style={{ width: `${currentStudent.progress}%` }}
                >
                  <span className="text-white text-xs font-bold">
                    {currentStudent.progress}%
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-6 text-sm text-gray-600">
              <span>🎯 Next Milestone: Level {currentStudent.level + 1}</span>
              <span>{100 - currentStudent.progress}% remaining</span>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Test Scores Over Time */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Test Performance Trend</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data?.testScoresOverTime || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="url(#colorGradient)" 
                    strokeWidth={3}
                    dot={{ fill: '#9333ea', r: 6 }}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Skill Assessment Radar */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center gap-3 mb-6">
                <Brain className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Skill Assessment</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={data?.skillAssessment || []}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="skill" stroke="#6b7280" />
                  <PolarRadiusAxis stroke="#6b7280" />
                  <Radar 
                    name="Score" 
                    dataKey="score" 
                    stroke="#9333ea" 
                    fill="#9333ea" 
                    fillOpacity={0.6} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Achievements */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-yellow-600" />
              <h2 className="text-2xl font-bold text-gray-900">Achievements & Milestones</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {data?.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="border-2 border-purple-200 rounded-2xl p-6 hover:shadow-lg transition-all hover:border-purple-400"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    {achievement.icon === 'star' && <Star className="w-8 h-8 text-yellow-600" />}
                    {achievement.icon === 'brain' && <Brain className="w-8 h-8 text-purple-600" />}
                    {achievement.icon === 'award' && <Award className="w-8 h-8 text-blue-600" />}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                    {achievement.title}
                  </h3>
                  <p className="text-sm text-gray-600 text-center mb-3">
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatDate(achievement.earnedDate)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
