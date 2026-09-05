import React from 'react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';

interface VWAPChartProps {
  data: Array<{ date: string; vwap: number; close: number }>;
}

export const VWAPChart: React.FC<VWAPChartProps> = ({ data }) => {
  return (
    <div style={{ width: '100%', height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line type="monotone" dataKey="vwap" name="VWAP (NPR)" stroke="#16a34a" strokeWidth={2} strokeDasharray="4 4" dot={false} />
          <Line type="monotone" dataKey="close" name="Close Price" stroke="#0f172a" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
