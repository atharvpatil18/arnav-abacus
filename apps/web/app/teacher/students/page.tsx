'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import Loading from '@/app/loading';
import { useRouter } from 'next/navigation';
import {
  Users,
  Search,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { useState, useMemo } from 'react';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  parentName: string;
  parentPhone: string;
  currentLevel: number;
  joiningDate: string;
  status: string;
  batch: {
    id: number;
    name: string;
  };
}

export default function TeacherStudentsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<number | 'all'>('all');
  const [batchFilter, setBatchFilter] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'age'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const { data: students, isLoading } = useQuery({
    queryKey: ['teacher-students'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Student[] }>('/students');
      return data.data;
    },
  });

  // Get unique levels and batches for filters
  const levels = useMemo(() => {
    if (!students) return [];
    return [...new Set(students.map(s => s.currentLevel))].sort((a, b) => a - b);
  }, [students]);

  const batches = useMemo(() => {
    if (!students) return [];
    const uniqueBatches = students
      .filter(s => s.batch)
      .map(s => s.batch)
      .filter((batch, index, self) => 
        index === self.findIndex(b => b.id === batch.id)
      );
    return uniqueBatches;
  }, [students]);

  // Filter and sort students
  const filteredAndSortedStudents = useMemo(() => {
    if (!students) return [];
    
    let filtered = students.filter(student =>
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.parentName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply level filter
    if (levelFilter !== 'all') {
      filtered = filtered.filter(s => s.currentLevel === levelFilter);
    }

    // Apply batch filter
    if (batchFilter !== 'all') {
      filtered = filtered.filter(s => s.batch?.id === batchFilter);
    }

    // Sort students
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case 'name':
          const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
          const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
          compareValue = nameA.localeCompare(nameB);
          break;
        case 'level':
          compareValue = a.currentLevel - b.currentLevel;
          break;
        case 'age':
          // Approximate age from joining date (assuming younger students join earlier)
          compareValue = new Date(a.joiningDate).getTime() - new Date(b.joiningDate).getTime();
          break;
      }
      
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [students, searchQuery, levelFilter, batchFilter, sortBy, sortOrder]);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              My Students
            </h1>
            <p className="text-gray-600 mt-1">Manage and view student information</p>
          </div>
          <div className="text-lg font-semibold text-gray-700">
            Total: {filteredAndSortedStudents?.length || 0}
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name, email, or parent name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Level Filter */}
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-4 h-4" />
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                aria-label="Filter by level"
              >
                <option value="all">All Levels</option>
                {levels.map(level => (
                  <option key={level} value={level}>Level {level}</option>
                ))}
              </select>
            </div>

            {/* Batch Filter */}
            <div className="flex items-center gap-2">
              <Filter className="text-gray-400 w-4 h-4" />
              <select
                value={batchFilter}
                onChange={(e) => setBatchFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                aria-label="Filter by batch"
              >
                <option value="all">All Batches</option>
                {batches.map(batch => (
                  <option key={batch.id} value={batch.id}>{batch.name}</option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="text-gray-400 w-4 h-4" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'level' | 'age')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                aria-label="Sort by"
              >
                <option value="name">Sort by Name</option>
                <option value="level">Sort by Level</option>
                <option value="age">Sort by Age</option>
              </select>
            </div>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              {sortOrder === 'asc' ? '↑ A-Z' : '↓ Z-A'}
            </button>
          </div>
        </div>
      </div>

      {/* Students Grid */}
      {filteredAndSortedStudents && filteredAndSortedStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedStudents.map((student) => (
            <div
              key={student.id}
              onClick={() => router.push(`/teacher/students/${student.id}`)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border-2 border-transparent hover:border-blue-500"
            >
              {/* Student Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {student.firstName.charAt(0)}{student.lastName?.charAt(0) || ''}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">
                      {student.firstName} {student.lastName}
                    </h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                      student.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {student.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Student Info */}
              <div className="space-y-3">
                {student.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <span className="truncate">{student.email}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  <span>Level {student.currentLevel}</span>
                </div>

                {student.batch && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4 text-green-500" />
                    <span>{student.batch.name}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <span>Joined {new Date(student.joiningDate).toLocaleDateString()}</span>
                </div>

                {/* Parent Info */}
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-1">Parent/Guardian</p>
                  <div className="space-y-1">
                    {student.parentName && (
                      <p className="text-sm font-medium text-gray-700">{student.parentName}</p>
                    )}
                    {student.parentPhone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        <span>{student.parentPhone}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Hint */}
              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <span className="text-xs text-blue-600 font-medium">
                  Click to view details →
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Students Found</h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'Try adjusting your search criteria'
              : 'Students will appear here once they are assigned to your batches'}
          </p>
        </div>
      )}
    </div>
  );
}
