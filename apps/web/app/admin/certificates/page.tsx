'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';
import { axiosInstance } from '@/lib/axios';
import {
  Award,
  Plus,
  Download,
  Trash2,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id: number;
  firstName: string;
  lastName: string;
  enrollmentNumber: string;
}

interface Certificate {
  id: number;
  student: Student;
  type: 'COMPLETION' | 'ACHIEVEMENT' | 'PARTICIPATION';
  issueDate: string;
  enrollmentNumber: string;
  certificateNumber: string;
  remarks?: string;
}

interface CreateCertificateDto {
  studentId: number;
  type: 'COMPLETION' | 'ACHIEVEMENT' | 'PARTICIPATION';
  issueDate: string;
  remarks?: string;
}

export default function CertificatesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const [formData, setFormData] = useState<CreateCertificateDto>({
    studentId: 0,
    type: 'COMPLETION',
    issueDate: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  const { data: certificates, isLoading } = useQuery<Certificate[]>({
    queryKey: ['certificates'],
    queryFn: async () => {
      const response = await axiosInstance.get('/certificates?page=1&limit=1000');
      return Array.isArray(response.data) ? response.data : response.data?.items || [];
    },
  });

  const { data: students } = useQuery<Student[]>({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await axiosInstance.get('/students?page=1&limit=1000');
      return Array.isArray(response.data) ? response.data : response.data?.items || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateCertificateDto) => {
      return axiosInstance.post('/certificates', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      resetForm();
      toast.success('Certificate issued successfully!');
    },
    onError: () => {
      toast.error('Failed to issue certificate');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return axiosInstance.delete(`/certificates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificates'] });
      toast.success('Certificate deleted successfully!');
    },
    onError: () => {
      toast.error('Failed to delete certificate');
    },
  });

  const resetForm = () => {
    setFormData({
      studentId: 0,
      type: 'COMPLETION',
      issueDate: new Date().toISOString().split('T')[0],
      remarks: '',
    });
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.type || !formData.issueDate) {
      toast.error('Please fill all required fields');
      return;
    }

    createMutation.mutate(formData);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this certificate?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownload = (certificate: Certificate) => {
    toast.info(`Downloading certificate for ${certificate.student.firstName} ${certificate.student.lastName}`);
  };

  const filterCertificates = () => {
    if (filterType === 'all') return certificates || [];
    return (certificates || []).filter((cert) => cert.type === filterType);
  };

  const calculateStats = () => {
    const certs = certificates || [];
    return {
      total: certs.length,
      completion: certs.filter((c) => c.type === 'COMPLETION').length,
      achievement: certs.filter((c) => c.type === 'ACHIEVEMENT').length,
      participation: certs.filter((c) => c.type === 'PARTICIPATION').length,
    };
  };

  const getCertificateColor = (type: string) => {
    switch (type) {
      case 'COMPLETION':
        return 'bg-green-100 text-green-700';
      case 'ACHIEVEMENT':
        return 'bg-purple-100 text-purple-700';
      case 'PARTICIPATION':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const stats = calculateStats();
  const filteredCertificates = filterCertificates();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Certificates Management
          </h1>
          <p className="text-gray-600 mt-1">Issue and manage student certificates</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-500 to-purple-500"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Issue Certificate'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">Total Certificates</p>
                <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
              </div>
              <Award className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700">Completion</p>
                <p className="text-2xl font-bold text-green-800">{stats.completion}</p>
              </div>
              <Award className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700">Achievement</p>
                <p className="text-2xl font-bold text-purple-800">{stats.achievement}</p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Participation</p>
                <p className="text-2xl font-bold text-orange-800">{stats.participation}</p>
              </div>
              <Award className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Issue New Certificate</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Student *</label>
                  <select
                    value={formData.studentId}
                    onChange={(e) => setFormData({ ...formData, studentId: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={0}>Select student</option>
                    {students?.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.firstName} {student.lastName} ({student.enrollmentNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Certificate Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="COMPLETION">Completion</option>
                    <option value="ACHIEVEMENT">Achievement</option>
                    <option value="PARTICIPATION">Participation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Issue Date *</label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Additional notes or remarks"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-gradient-to-r from-blue-500 to-purple-500"
                >
                  {createMutation.isPending ? 'Issuing...' : 'Issue Certificate'}
                </Button>
                <Button type="button" onClick={resetForm} variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
            >
              All Types
            </Button>
            <Button
              size="sm"
              variant={filterType === 'COMPLETION' ? 'default' : 'outline'}
              onClick={() => setFilterType('COMPLETION')}
            >
              Completion
            </Button>
            <Button
              size="sm"
              variant={filterType === 'ACHIEVEMENT' ? 'default' : 'outline'}
              onClick={() => setFilterType('ACHIEVEMENT')}
            >
              Achievement
            </Button>
            <Button
              size="sm"
              variant={filterType === 'PARTICIPATION' ? 'default' : 'outline'}
              onClick={() => setFilterType('PARTICIPATION')}
            >
              Participation
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <Card>
        <CardHeader>
          <CardTitle>Issued Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCertificates.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Certificate No.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Student</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Enrollment No.</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Issue Date</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Remarks</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCertificates.map((certificate) => (
                    <tr key={certificate.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-sm">{certificate.certificateNumber}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>
                            {certificate.student.firstName} {certificate.student.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">{certificate.enrollmentNumber}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCertificateColor(certificate.type)}`}>
                          {certificate.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(certificate.issueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {certificate.remarks || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownload(certificate)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(certificate.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No certificates issued yet</p>
              <p className="text-sm mt-1">Click &quot;Issue Certificate&quot; to create one</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
