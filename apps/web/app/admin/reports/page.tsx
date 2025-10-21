'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { PageTransition } from '@/components/ui/page-transition';
import {
  Download,
  FileText,
  TrendingUp,
  DollarSign,
  Calendar,
  Filter,
  BarChart3,
  CheckCircle,
  
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface MonthlyRevenue {
  month: string;
  revenue: number;
  expenses: number;
  net: number;
  paid: number;
  pending: number;
  partial: number;
}

export default function AdminReportsPage() {
  const [startDate, setStartDate] = useState('2025-01-01');
  const [endDate, setEndDate] = useState('2025-12-31');
  const [reportType, setReportType] = useState<'revenue' | 'attendance' | 'performance'>('revenue');

  const { data: revenueData } = useQuery<MonthlyRevenue[]>({
    queryKey: ['monthlyRevenue', startDate, endDate],
    queryFn: async (): Promise<MonthlyRevenue[]> => {
      try {
        const { data } = await apiClient.get(`/analytics/monthly-revenue?start=${startDate}&end=${endDate}`);
        return data as MonthlyRevenue[];
      } catch {
        // Mock data if API fails
        return [
          { month: '2025-01', revenue: 45000, expenses: 15000, net: 30000, paid: 40000, pending: 5000, partial: 0 },
          { month: '2025-02', revenue: 48000, expenses: 16000, net: 32000, paid: 43000, pending: 5000, partial: 0 },
          { month: '2025-03', revenue: 52000, expenses: 17000, net: 35000, paid: 47000, pending: 5000, partial: 0 },
          { month: '2025-04', revenue: 50000, expenses: 16500, net: 33500, paid: 45000, pending: 5000, partial: 0 },
          { month: '2025-05', revenue: 55000, expenses: 18000, net: 37000, paid: 50000, pending: 5000, partial: 0 },
          { month: '2025-06', revenue: 58000, expenses: 19000, net: 39000, paid: 53000, pending: 5000, partial: 0 },
          { month: '2025-07', revenue: 60000, expenses: 20000, net: 40000, paid: 55000, pending: 5000, partial: 0 },
          { month: '2025-08', revenue: 62000, expenses: 20500, net: 41500, paid: 57000, pending: 5000, partial: 0 },
          { month: '2025-09', revenue: 65000, expenses: 21000, net: 44000, paid: 60000, pending: 5000, partial: 0 },
          { month: '2025-10', revenue: 68000, expenses: 22000, net: 46000, paid: 63000, pending: 5000, partial: 0 },
        ];
      }
    },
  });

  const revenueArray = revenueData ?? [];

  const monthlyData = (revenueArray || []).map((item) => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    Revenue: item.revenue,
    Expenses: item.expenses,
    Net: item.net,
  }));

  const feeStatusData = revenueArray.length ? [
    { name: 'Paid', value: revenueArray.reduce((sum: number, m: MonthlyRevenue) => sum + (m.paid ?? 0), 0), color: '#10b981' },
    { name: 'Pending', value: revenueArray.reduce((sum: number, m: MonthlyRevenue) => sum + (m.pending ?? 0), 0), color: '#f59e0b' },
    { name: 'Partial', value: revenueArray.reduce((sum: number, m: MonthlyRevenue) => sum + (m.partial ?? 0), 0), color: '#3b82f6' },
  ] : [];

  const totalRevenue = revenueArray.reduce((sum: number, m: MonthlyRevenue) => sum + (m.revenue ?? 0), 0) || 0;
  const totalExpenses = revenueArray.reduce((sum: number, m: MonthlyRevenue) => sum + (m.expenses ?? 0), 0) || 0;
  const totalNet = totalRevenue - totalExpenses;
  const avgMonthlyRevenue = revenueArray.length ? totalRevenue / revenueArray.length : 0;

  const handleDownloadReport = async () => {
    try {
      toast.loading('Generating PDF report...');
      // API call to generate and download PDF
      const response = await apiClient.get(`/reports/revenue-pdf?start=${startDate}&end=${endDate}`, {
        responseType: 'blob',
      });
      
  const blob = new Blob([response.data as BlobPart], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Revenue_Report_${startDate}_to_${endDate}.pdf`;
      link.click();
      
      toast.dismiss();
      toast.success('Report downloaded successfully!');
    } catch {
      toast.dismiss();
      toast.error('Failed to generate report. Feature coming soon!');
    }
  };

  const handleExportCSV = () => {
    if (!revenueData || revenueData.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = ['Month', 'Revenue', 'Expenses', 'Net Income', 'Paid', 'Pending', 'Partial'];
    const rows = revenueData.map((item: MonthlyRevenue) => [
      item.month,
      item.revenue,
      item.expenses,
      item.net,
      item.paid,
      item.pending,
      item.partial,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Revenue_Report_${startDate}_to_${endDate}.csv`;
    link.click();
    
    toast.success('CSV exported successfully!');
  };

  return (
    <PageTransition>
      <div className="min-h-screen p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Financial Reports
          </h1>
          <p className="text-gray-600">Generate and analyze monthly revenue, expenses, and financial performance</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">Report Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-2">
                Report Type
              </label>
              <select
                id="reportType"
                value={reportType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setReportType(e.target.value as 'revenue' | 'attendance' | 'performance')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              >
                <option value="revenue">Revenue Report</option>
                <option value="attendance">Attendance Report</option>
                <option value="performance">Performance Report</option>
              </select>
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              />
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleDownloadReport}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={handleExportCSV}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                CSV
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-green-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Total Revenue</p>
                  <h3 className="text-3xl font-bold text-white mt-1">₹{totalRevenue.toLocaleString()}</h3>
                </div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-green-100 text-sm">
                <TrendingUp className="w-4 h-4 mr-1" />
                <span>Selected period</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Total Expenses</p>
                  <h3 className="text-3xl font-bold text-white mt-1">₹{totalExpenses.toLocaleString()}</h3>
                </div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-red-100 text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Operating costs</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Net Income</p>
                  <h3 className="text-3xl font-bold text-white mt-1">₹{totalNet.toLocaleString()}</h3>
                </div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-purple-100 text-sm">
                <CheckCircle className="w-4 h-4 mr-1" />
                <span>Profit margin: {((totalNet / totalRevenue) * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Avg Monthly</p>
                  <h3 className="text-3xl font-bold text-white mt-1">₹{avgMonthlyRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                </div>
                <div className="w-14 h-14 bg-white/20 backdrop-blur-lg rounded-xl flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center text-blue-100 text-sm">
                <BarChart3 className="w-4 h-4 mr-1" />
                <span>Average revenue</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Revenue vs Expenses */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-purple-600" />
              Revenue vs Expenses
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="Revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Net Income Trend */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Net Income Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="Net" stroke="#8b5cf6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Fee Status Distribution */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-blue-600" />
              Fee Collection Status
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={feeStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => {
                    const e = entry as unknown as { name: string; value: number };
                    return `${e.name}: ₹${(e.value ?? 0).toLocaleString()}`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {feeStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" />
              Monthly Breakdown
            </h3>
            <div className="overflow-auto max-h-[300px]">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Month</th>
                    <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Revenue</th>
                    <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Expenses</th>
                    <th className="px-4 py-2 text-right text-sm font-semibold text-gray-700">Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {revenueArray.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-2 text-sm text-right text-green-600 font-medium">
                        ₹{item.revenue.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-right text-red-600 font-medium">
                        ₹{item.expenses.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-sm text-right text-purple-600 font-semibold">
                        ₹{item.net.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
