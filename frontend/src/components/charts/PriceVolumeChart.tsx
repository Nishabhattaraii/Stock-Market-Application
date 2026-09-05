import React from 'react';
import {
  ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from 'recharts';
import { DailyPrice } from '../../types';
import { formatDate } from '../../lib/formatters';

interface PriceVolumeChartProps {
  prices: DailyPrice[];
}

export const PriceVolumeChart: React.FC<PriceVolumeChartProps> = ({ prices }) => {
  const data = [...prices].reverse().map(p => ({
    date: formatDate(p.trading_date),
    close: p.close,
    volume: p.volume,
    high: p.high,
    low: p.low,
  }));

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis yAxisId="left" orientation="left" domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#64748b' }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#64748b' }} />
          <Tooltip
            contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
          <Bar yAxisId="right" dataKey="volume" name="Volume" fill="#cbd5e1" radius={[2, 2, 0, 0]} opacity={0.6} />
          <Line yAxisId="left" type="monotone" dataKey="close" name="Close Price (NPR)" stroke="#2563eb" strokeWidth={2} dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
