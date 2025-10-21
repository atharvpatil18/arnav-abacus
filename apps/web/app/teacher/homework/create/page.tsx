'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, BookOpen, Upload } from 'lucide-react';
import { PageTransition } from '@/components/ui/page-transition';

interface Batch {
  id: number;
  name: string;
}

export default function CreateHomeworkPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    batchId: '',
    dueDate: '',
    attachmentUrl: ''
  });

  const { data: batches } = useQuery({
    queryKey: ['batches'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Batch[] }>('/batches');
      return data.data;
    },
  });

  const createHomeworkMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      return await apiClient.post('/homework', {
        ...data,
        batchId: parseInt(data.batchId)
      });
    },
    onSuccess: () => {
      toast.success('Homework created successfully!');
      router.push('/teacher/homework');
    },
    onError: () => {
      toast.error('Failed to create homework');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.batchId || !formData.dueDate) {
      toast.error('Please fill in all required fields');
      return;
    }
    createHomeworkMutation.mutate(formData);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 p-6 animate-in fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-2 animate-gradient">
            Create Homework
          </h1>
          <p className="text-gray-600">Assign new homework to your students</p>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BookOpen className="w-6 h-6 text-purple-600" />
              Homework Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  placeholder="Enter homework title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                  rows={5}
                  placeholder="Enter homework description and instructions"
                  required
                />
              </div>

              {/* Batch Selection */}
              <div>
                <label htmlFor="batch" className="block text-sm font-semibold text-gray-700 mb-2">
                  Batch <span className="text-red-500">*</span>
                </label>
                <select
                  id="batch"
                  value={formData.batchId}
                  onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                >
                  <option value="">Select a batch</option>
                  {batches?.map((batch: Batch) => (
                    <option key={batch.id} value={batch.id}>
                      {batch.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Due Date */}
              <div>
                <label htmlFor="dueDate" className="block text-sm font-semibold text-gray-700 mb-2">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Attachment URL (Optional) */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Attachment URL (Optional)
                </label>
                <div className="flex gap-2">
                  <Upload className="w-5 h-5 text-gray-400 mt-3" />
                  <input
                    type="url"
                    value={formData.attachmentUrl}
                    onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="https://example.com/file.pdf"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  onClick={() => router.back()}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createHomeworkMutation.isPending}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {createHomeworkMutation.isPending ? 'Creating...' : 'Create Homework'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </PageTransition>
  );
}

