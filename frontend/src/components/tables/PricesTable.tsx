import React from 'react';
import { DailyPrice } from '../../types';
import { formatCurrency, formatNumber, formatDate } from '../../lib/formatters';

export const PricesTable: React.FC<{ prices: DailyPrice[] }> = ({ prices }) => {
  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Open</th>
            <th>High</th>
            <th>Low</th>
            <th>Close</th>
            <th>Volume</th>
            <th>Turnover (NPR)</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((p) => (
            <tr key={p.id}>
              <td style={{ fontWeight: 500 }}>{formatDate(p.trading_date)}</td>
              <td>{formatCurrency(p.open)}</td>
              <td>{formatCurrency(p.high)}</td>
              <td>{formatCurrency(p.low)}</td>
              <td style={{ fontWeight: 600 }}>{formatCurrency(p.close)}</td>
              <td>{formatNumber(p.volume)}</td>
              <td>{p.turnover ? formatCurrency(p.turnover) : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
