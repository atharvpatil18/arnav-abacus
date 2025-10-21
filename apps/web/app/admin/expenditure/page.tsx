'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardSkeleton, TableSkeleton } from '@/components/ui/LoadingSkeleton';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
import { Plus, Trash2, TrendingDown, DollarSign, FileText } from 'lucide-react';

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

interface Expenditure {
  id: number;
  category: string;
  amount: number;
  description: string;
  date: string;
  paymentMethod: string;
  receiptUrl?: string;
  recordedBy: number;
  remarks?: string;
}

interface ExpenditureSummary {
  total: number;
  categoryWise: { category: string; total: number; count: number }[];
}

const CATEGORIES = [
  'Rent',
  'Utilities',
  'Salaries',
  'Supplies',
  'Marketing',
  'Maintenance',
  'Transportation',
  'Other'
];

const PAYMENT_METHODS = ['Cash', 'Bank Transfer', 'UPI', 'Card', 'Cheque'];

export default function ExpenditurePage() {
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState({
    start: format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM-dd'),
    end: format(new Date(), 'yyyy-MM-dd'),
  });
  const [formData, setFormData] = useState({
    category: '',
    amount: 0,
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    paymentMethod: '',
    remarks: '',
  });

  const queryClient = useQueryClient();

  const { data: expenditures, isLoading: isLoadingExpenditures } = useQuery<ApiResponse<Expenditure[]>>({
    queryKey: ['expenditures', selectedCategory, dateRange],
    queryFn: async (): Promise<ApiResponse<Expenditure[]>> => {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      params.append('startDate', dateRange.start);
      params.append('endDate', dateRange.end);
      const { data } = await apiClient.get<ApiResponse<Expenditure[]>>(`/expenditure?${params.toString()}`);
      return data;
    },
  });

  const { data: summary, isLoading: isLoadingSummary } = useQuery<ApiResponse<ExpenditureSummary>>({
    queryKey: ['expenditure-summary', dateRange],
    queryFn: async (): Promise<ApiResponse<ExpenditureSummary>> => {
      const params = new URLSearchParams();
      params.append('startDate', dateRange.start);
      params.append('endDate', dateRange.end);
      const { data } = await apiClient.get<ApiResponse<ExpenditureSummary>>(`/expenditure/total?${params.toString()}`);
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { data: result } = await apiClient.post('/expenditure', data);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenditures'] });
      queryClient.invalidateQueries({ queryKey: ['expenditure-summary'] });
      toast.success('Expenditure recorded successfully');
      setShowForm(false);
      setFormData({
        category: '',
        amount: 0,
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        paymentMethod: '',
        remarks: '',
      });
    },
    onError: () => {
      toast.error('Failed to record expenditure');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/expenditure/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenditures'] });
      queryClient.invalidateQueries({ queryKey: ['expenditure-summary'] });
      toast.success('Expenditure deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete expenditure');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'amount' ? Number(value) : value }));
  };

  const totalExpenditure = summary?.data?.total || 0;
  const summaryData = summary?.data;
  const expendituresData = expenditures?.data || [];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Expenditure Tracking
          </h1>
          <p className="text-gray-600 mt-1">Manage and track all business expenses</p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenditure</p>
                <p className="text-3xl font-bold text-red-600">₹{totalExpenditure.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Transactions</p>
                <p className="text-3xl font-bold text-orange-600">{expendituresData.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg per Transaction</p>
                <p className="text-3xl font-bold text-yellow-600">
                  ₹{expendituresData.length > 0 ? Math.round(totalExpenditure / expendituresData.length).toLocaleString() : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <Card className="border-2 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50">
            <CardTitle>Add New Expense</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expCategory" className="block text-sm font-medium mb-1">Category *</label>
                  <select
                    id="expCategory"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="expAmount" className="block text-sm font-medium mb-1">Amount *</label>
                  <input
                    id="expAmount"
                    type="number"
                    name="amount"
                    required
                    min="0"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label htmlFor="expDate" className="block text-sm font-medium mb-1">Date *</label>
                  <input
                    id="expDate"
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label htmlFor="expPaymentMethod" className="block text-sm font-medium mb-1">Payment Method *</label>
                  <select
                    id="expPaymentMethod"
                    name="paymentMethod"
                    required
                    value={formData.paymentMethod}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">Select Method</option>
                    {PAYMENT_METHODS.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <input
                    type="text"
                    name="description"
                    required
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Brief description of expense"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Remarks (Optional)</label>
                  <textarea
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                    placeholder="Additional notes"
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-gradient-to-r from-red-500 to-orange-500"
                >
                  {createMutation.isPending ? 'Saving...' : 'Save Expense'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="filterCategory" className="block text-sm font-medium mb-2">Category</label>
              <select
                id="filterCategory"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label htmlFor="startDate" className="block text-sm font-medium mb-2">Start Date</label>
              <input
                id="startDate"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>

            <div className="flex-1 min-w-[200px]">
              <label htmlFor="endDate" className="block text-sm font-medium mb-2">End Date</label>
              <input
                id="endDate"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full p-2 border rounded-lg"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expenditure List */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Expenditures</h2>
          {isLoadingExpenditures ? (
            <div className="py-4">
              <TableSkeleton rows={6} />
            </div>
          ) : expendituresData && expendituresData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Date</th>
                    <th className="text-left p-3">Category</th>
                    <th className="text-left p-3">Description</th>
                    <th className="text-right p-3">Amount</th>
                    <th className="text-left p-3">Payment Method</th>
                    <th className="text-center p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expendituresData.map((exp: Expenditure) => (
                    <tr key={exp.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        {new Date(exp.date).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-3">{exp.description}</td>
                      <td className="p-3 text-right font-semibold">
                        ₹{exp.amount.toLocaleString()}
                      </td>
                      <td className="p-3">{exp.paymentMethod}</td>
                      <td className="p-3 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteMutation.mutate(exp.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No expenditures found for the selected filters.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Category Breakdown</h2>
          {isLoadingSummary ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : summaryData && summaryData.categoryWise && summaryData.categoryWise.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {summaryData.categoryWise.map((item: { category: string; total: number; count: number }) => (
                <div
                  key={item.category}
                  className="p-4 border rounded-lg bg-gradient-to-br from-purple-50 to-pink-50"
                >
                  <h3 className="font-medium text-gray-700 mb-2">{item.category}</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    ₹{item.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {item.count} transaction{item.count !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No category data available.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
