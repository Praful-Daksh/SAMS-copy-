import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Button } from '@/common/components/ui/button';
import { useAuthStore } from '@/modules/user-management1/store/authStore';
import AttendanceCard from '../components/AttendanceCard';
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

const AttendanceDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [attendanceData, setAttendanceData] = useState<SubjectAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const academicDetails = await dashboardService.getStudentAcademicDetails();
        setAttendanceData(academicDetails.subjects || []);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch attendance data');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading attendance data...</span>
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Attendance Dashboard</h1>
        <Button onClick={() => window.history.back()}>Back</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attendanceData.map((item) => (
          <AttendanceCard
            key={item.subject._id}
            subject={item.subject}
            percentage={item.attendance.percentage}
          />
        ))}
      </div>

      {attendanceData.length > 0 && (
        <AnalyticsCharts data={chartData} />
      )}

      {attendanceData.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500">
              No attendance data available
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AttendanceDashboard;