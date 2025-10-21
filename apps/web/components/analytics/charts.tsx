import { getAnalytics } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function PerformanceChart({ studentId }: { studentId: number }) {
  interface PerformanceItem {
    testName: string;
    percent: number;
  }

  const { data: performance } = useQuery<PerformanceItem[]>({
    queryKey: ['student-performance', studentId],
    queryFn: async () => {
      const res = await getAnalytics(`student/${studentId}/performance`);
      return (res as PerformanceItem[]) || [];
    },
  });

  const chartData = performance?.map((test) => ({
    name: test.testName,
    score: test.percent,
  })) || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Trends</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="score" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function AttendanceStats({ batchId }: { batchId: number }) {
  interface AttendanceRecord {
    status: string;
    date: string;
  }

  const { data: attendance } = useQuery<AttendanceRecord[]>({
    queryKey: ['batch-attendance', batchId],
    queryFn: async () => {
      const res = await getAnalytics(`batch/${batchId}/attendance`);
      return (res as AttendanceRecord[]) || [];
    },
  });

  const stats = attendance?.reduce((acc, record) => {
    acc[record.status] = (acc[record.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(stats).map(([status, count]) => (
            <div key={status} className="text-center">
              <h3 className="text-2xl font-bold">{count}</h3>
              <p className="text-sm text-muted-foreground">{status}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}