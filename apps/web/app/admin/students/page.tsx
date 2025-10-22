'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { axiosInstance } from '@/lib/axios';
import { Search, Filter, Users, UserCheck, UserX, GraduationCap } from 'lucide-react';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  parentName: string;
  parentPhone: string;
  email: string;
  currentLevel: number;
  batch?: { id?: number; name: string };
  status: string;
  joiningDate?: string;
  dob?: string;
}

export default function StudentsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [batchFilter, setBatchFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'joining' | 'age'>('name');
  const [showFilters, setShowFilters] = useState(false);

  const { data: students, isLoading } = useQuery<Student[], Error>({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await axiosInstance.get<Student[]>('/students');
      return response.data;
    },
  });

  // Fetch batches for filter
  const { data: batches } = useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const response = await axiosInstance.get('/batches?page=1&limit=1000');
      const data = response.data as { items?: unknown[] } | unknown[];
      if (data && typeof data === 'object' && 'items' in data) return data.items;
      return Array.isArray(data) ? data : [];
    },
  });

  const toggleStatusMutation = useMutation<void, unknown, number>({
    mutationFn: async (studentId: number) => {
      await axiosInstance.post(`/students/${studentId}/toggle-status`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  const studentsData = Array.isArray(students) ? students : [];
  
  // Apply filters
  const filteredStudents = studentsData.filter((s: Student) => {
    const matchesSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.parentPhone.includes(searchQuery);
    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    const matchesLevel = levelFilter === 'ALL' || s.currentLevel.toString() === levelFilter;
    const matchesBatch = batchFilter === 'ALL' || 
                        (batchFilter === 'NONE' ? !s.batch : s.batch?.id?.toString() === batchFilter);
    return matchesSearch && matchesStatus && matchesLevel && matchesBatch;
  });

  // Apply sorting
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      case 'level':
        return a.currentLevel - b.currentLevel;
      case 'joining':
        return new Date(b.joiningDate || 0).getTime() - new Date(a.joiningDate || 0).getTime();
      case 'age':
        if (!a.dob || !b.dob) return 0;
        return new Date(a.dob).getTime() - new Date(b.dob).getTime();
      default:
        return 0;
    }
  });

  const activeCount = studentsData.filter(s => s.status === 'ACTIVE').length;
  const inactiveCount = studentsData.filter(s => s.status === 'INACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Student Management
          </h1>
          <p className="text-gray-600 mt-1">Manage and track all students</p>
        </div>
        <button
          onClick={() => router.push('/admin/students/create')}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all hover:scale-105"
        >
          <Users className="w-5 h-5" />
          Add New Student
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <Users className="w-8 h-8 opacity-80" />
            <div className="text-3xl font-bold">{studentsData.length}</div>
          </div>
          <div className="text-blue-100 text-sm">Total Students</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <UserCheck className="w-8 h-8 opacity-80" />
            <div className="text-3xl font-bold">{activeCount}</div>
          </div>
          <div className="text-green-100 text-sm">Active Students</div>
        </div>
        <div className="bg-gradient-to-br from-gray-500 to-gray-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <UserX className="w-8 h-8 opacity-80" />
            <div className="text-3xl font-bold">{inactiveCount}</div>
          </div>
          <div className="text-gray-100 text-sm">Inactive Students</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex flex-col gap-4">
          {/* Search and Main Controls */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, parent name, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                Filters
              </Button>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'level' | 'joining' | 'age')}
                className="px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                aria-label="Sort by"
              >
                <option value="name">Sort by Name</option>
                <option value="level">Sort by Level</option>
                <option value="joining">Sort by Joining Date</option>
                <option value="age">Sort by Age</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters (Collapsible) */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                  aria-label="Filter by status"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                <select
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                  aria-label="Filter by level"
                >
                  <option value="ALL">All Levels</option>
                  {Array.from(new Set(studentsData.map(s => s.currentLevel)))
                    .sort((a, b) => a - b)
                    .map(level => (
                      <option key={level} value={level}>Level {level}</option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch</label>
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                  aria-label="Filter by batch"
                >
                  <option value="ALL">All Batches</option>
                  <option value="NONE">No Batch Assigned</option>
                  {batches && Array.isArray(batches) && batches.map((batchItem: unknown) => {
                    const batch = batchItem as { id: number; name: string };
                    return <option key={batch.id} value={batch.id}>{batch.name}</option>;
                  })}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Students Grid */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedStudents.length > 0 ? (
            sortedStudents.map((student: Student) => (
            <Card key={student.id} className="border-none shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-br from-purple-500 to-blue-500 text-white p-5 rounded-t-xl">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">
                        {student.firstName} {student.lastName}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        student.status === 'ACTIVE' 
                          ? 'bg-green-400/30 text-green-100' 
                          : 'bg-gray-400/30 text-gray-200'
                      }`}>
                        {student.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-white/90">
                  <p><span className="font-semibold">Level:</span> {student.currentLevel}</p>
                  {student.batch && (
                    <p><span className="font-semibold">Batch:</span> {student.batch.name}</p>
                  )}
                </div>
              </div>
              <CardContent className="p-5 space-y-3">
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium text-gray-800">Parent:</span> {student.parentName}</p>
                  <p><span className="font-medium text-gray-800">Phone:</span> {student.parentPhone}</p>
                  <p><span className="font-medium text-gray-800">Email:</span> {student.email || 'N/A'}</p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50"
                    onClick={() => router.push(`/admin/students/${student.id}`)}
                  >
                    View
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => router.push(`/admin/students/${student.id}/edit`)}
                  >
                    Edit
                  </Button>
                </div>
                <Button
                  size="sm"
                  className={`w-full ${
                    student.status === 'ACTIVE' 
                      ? 'bg-red-500 hover:bg-red-600' 
                      : 'bg-green-500 hover:bg-green-600'
                  }`}
                  onClick={() => toggleStatusMutation.mutate(student.id)}
                  disabled={toggleStatusMutation.isPending}
                >
                  {toggleStatusMutation.isPending 
                    ? 'Updating...' 
                    : student.status === 'ACTIVE' 
                      ? 'Mark Inactive' 
                      : 'Mark Active'
                  }
                </Button>
              </CardContent>
            </Card>
          ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="mb-4">
                <Users className="w-16 h-16 mx-auto text-gray-400" />
              </div>
              <p className="text-lg font-medium text-gray-700">
                {searchQuery || statusFilter !== 'ALL' ? 'No students found matching your filters' : 'No students found'}
              </p>
              <p className="text-sm mt-2 text-gray-500">
                {searchQuery || statusFilter !== 'ALL' ? 'Try adjusting your search or filters' : 'Add a new student to get started'}
              </p>
              {!searchQuery && statusFilter === 'ALL' && (
                <Button 
                  onClick={() => router.push('/admin/students/create')}
                  className="mt-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Add First Student
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}