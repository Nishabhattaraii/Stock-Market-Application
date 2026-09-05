import React from 'react';
import { BrokerBreakdown } from '../../types';
import { formatNumber } from '../../lib/formatters';

export const BrokerBreakdownTable: React.FC<{ breakdown?: BrokerBreakdown }> = ({ breakdown }) => {
  if (!breakdown) return <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Floorsheet broker breakdown unavailable for this date.</div>;

  return (
    <div className="grid-2">
      <div>
        <h4 style={{ fontSize: '13.5px', fontWeight: 600, marginBottom: '10px', color: '#16a34a' }}>Top Buyer Brokers</h4>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Broker #</th>
                <th>Buy Quantity</th>
                <th>Share %</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.top_buyers.map((b) => (
                <tr key={b.broker_id}>
                  <td style={{ fontWeight: 600 }}>Broker #{b.broker_id}</td>
                  <td>{formatNumber(b.buy_quantity)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div style={{ width: '60px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, b.percentage_contribution * 2)}%`, height: '100%', backgroundColor: '#22c55e' }} />
                      </div>
                      <span>{b.percentage_contribution.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '13.5px', fontWeight: 600, marginBottom: '10px', color: '#dc2626' }}>Top Seller Brokers</h4>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Broker #</th>
                <th>Sell Quantity</th>
                <th>Share %</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.top_sellers.map((s) => (
                <tr key={s.broker_id}>
                  <td style={{ fontWeight: 600 }}>Broker #{s.broker_id}</td>
                  <td>{formatNumber(s.sell_quantity)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div style={{ width: '60px', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, s.percentage_contribution * 2)}%`, height: '100%', backgroundColor: '#ef4444' }} />
                      </div>
                      <span>{s.percentage_contribution.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
