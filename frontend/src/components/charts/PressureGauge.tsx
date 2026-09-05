import React from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import { formatNumber } from '../../lib/formatters';

interface PressureGaugeProps {
  buyQty: number;
  sellQty: number;
  score: number;
}

export const PressureGauge: React.FC<PressureGaugeProps> = ({ buyQty, sellQty, score }) => {
  const total = buyQty + sellQty;
  const buyPct = total > 0 ? Math.round((buyQty / total) * 100) : 50;
  const sellPct = 100 - buyPct;

  const getScoreLabel = () => {
    if (score > 0.3) return { text: 'Strong Buy Pressure', color: '#16a34a' };
    if (score > 0.05) return { text: 'Moderate Buy Interest', color: '#2563eb' };
    if (score < -0.3) return { text: 'Heavy Sell Pressure', color: '#dc2626' };
    if (score < -0.05) return { text: 'Moderate Selling', color: '#d97706' };
    return { text: 'Balanced Order Flow', color: '#475569' };
  };

  const labelInfo = getScoreLabel();

  const chartData = [
    { type: 'Buy Volume', volume: buyQty, percentage: buyPct, color: '#16a34a' },
    { type: 'Sell Volume', volume: sellQty, percentage: sellPct, color: '#dc2626' }
  ];

  return (
    <div style={{ padding: '8px 0' }}>
      <div className="flex justify-between items-center" style={{ marginBottom: '12px', fontSize: '13px' }}>
        <span style={{ fontWeight: 600, color: labelInfo.color }}>{labelInfo.text}</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Score: {score > 0 ? `+${score}` : score}</span>
      </div>

      <div style={{ width: '100%', height: 180 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
            <XAxis dataKey="type" tick={{ fontSize: 12, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
            <Tooltip
              formatter={(value: any) => [formatNumber(Number(value)), 'Volume']}
              contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '6px', fontSize: '12px' }}
            />
            <Bar dataKey="volume" radius={[6, 6, 0, 0]} barSize={45}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex justify-between items-center" style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
        <span>Buyers: <strong style={{ color: '#16a34a' }}>{buyPct}%</strong> ({formatNumber(buyQty)})</span>
        <span>Sellers: <strong style={{ color: '#dc2626' }}>{sellPct}%</strong> ({formatNumber(sellQty)})</span>
      </div>
    </div>
  );
};

