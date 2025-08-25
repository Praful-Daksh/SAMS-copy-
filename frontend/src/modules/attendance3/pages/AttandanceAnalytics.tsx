import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { useAuthStore } from '@/modules/user-management1/store/authStore';
import AnalyticsCharts from '../components/AnalyticsCharts';
import { dashboardService } from '@/modules/user-management1/services/dashboard.service';
import { Loader2 } from 'lucide-react';

interface SubjectAttendance {
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  attendance: {
    totalClasses: number;
    attendedClasses: number;
    percentage: number;
  };
}

const AttendanceAnalytics: React.FC = () => {
  const { user } = useAuthStore();
  const [attendanceData, setAttendanceData] = useState<SubjectAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const academicDetails = await dashboardService.getStudentAcademicDetails();
        setAttendanceData(academicDetails.subjects || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading analytics data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-red-600 text-center">{error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const chartData = attendanceData.map(item => ({
    subject: item.subject,
    percentage: item.attendance.percentage
  }));

  const averageAttendance = attendanceData.length > 0 
    ? attendanceData.reduce((sum, item) => sum + item.attendance.percentage, 0) / attendanceData.length
    : 0;

  const totalClasses = attendanceData.reduce((sum, item) => sum + item.attendance.totalClasses, 0);
  const totalAttended = attendanceData.reduce((sum, item) => sum + item.attendance.attendedClasses, 0);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Attendance Analytics</h1>
        <Button onClick={() => window.history.back()}>Back</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Average Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {averageAttendance.toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {totalClasses}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classes Attended</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {totalAttended}
            </div>
          </CardContent>
        </Card>
      </div>

      {attendanceData.length > 0 && (
        <AnalyticsCharts data={chartData} />
      )}

      {attendanceData.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              No analytics data available
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceAnalytics;