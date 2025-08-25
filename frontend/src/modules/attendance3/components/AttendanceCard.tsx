import React from 'react';

interface AttendanceCardProps {
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  percentage: number;
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({ subject, percentage }) => {
  const getColorClass = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border">
      <div className="font-semibold text-lg mb-2">{subject.name}</div>
      <div className={`text-2xl font-bold ${getColorClass(percentage)}`}>
        {percentage.toFixed(1)}%
      </div>
      <div className="text-sm text-gray-600 mt-1">Attendance</div>
    </div>
  );
};

export default AttendanceCard;