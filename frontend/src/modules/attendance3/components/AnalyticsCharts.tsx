import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

interface ChartData {
  subject: {
    _id: string;
    name: string;
    code: string;
  };
  percentage: number;
}

interface AnalyticsChartsProps {
  data: ChartData[];
}

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ data }) => {
  const chartData = data.map(item => ({
    subjectName: item.subject.name,
    percentage: item.percentage
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Attendance by Subject</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="subjectName" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="percentage" fill="#3b82f6">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.percentage < 75 ? "#ef4444" : "#22c55e"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsCharts;