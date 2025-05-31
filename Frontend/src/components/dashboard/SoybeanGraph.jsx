import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import LoadingSpinner from '../common/LoadingSpinner';
import { colors } from '../../styles/theme';

const SoybeanGraph = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const mockData = [
      { name: 'Current', price: 1342.75 },
      { name: 'Last Close', price: 1340.50 },
      { name: 'Open', price: 1338.25 }
    ];

    const timer = setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
    
  }, []);

  if (loading) return <LoadingSpinner />;
  if (error) return <div style={{ color: colors.text.error }}>Error loading soybean data: {error}</div>;

  return (
    <div style={{
      backgroundColor: colors.background.elevated,
      padding: '20px',
      borderRadius: '12px',
      marginTop: '20px',
      boxShadow: '0 4px 16px rgba(99,102,241,0.08)',
      border: `1px solid ${colors.primary}22`,
      maxWidth: 700,
      marginLeft: 'auto',
      marginRight: 'auto',
      position: 'relative',
      overflow: 'visible'
    }}>
      <h3 style={{
        color: colors.primary,
        marginBottom: 18,
        fontWeight: 700,
        letterSpacing: 1.2,
        textShadow: '0 2px 8px #6366F144'
      }}>Soybean Futures (Mock Data)</h3>
      <LineChart width={600} height={320} data={data} style={{margin: '0 auto'}}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.primary} stopOpacity={0.7}/>
            <stop offset="100%" stopColor={colors.primary} stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#6366F133" />
        <XAxis dataKey="name" tick={{ fill: colors.text.secondary, fontWeight: 600 }} axisLine={{ stroke: colors.primary }} />
        <YAxis tick={{ fill: colors.text.secondary, fontWeight: 600 }} axisLine={{ stroke: colors.primary }} />
        <Tooltip contentStyle={{ background: '#23263a', border: `1px solid ${colors.primary}`, color: '#fff', borderRadius: 8, fontWeight: 600 }} cursor={{ stroke: colors.primary, strokeWidth: 2, opacity: 0.2 }} />
        <Legend iconType="circle" wrapperStyle={{ color: colors.primary, fontWeight: 600 }} />
        <Line 
          type="monotone" 
          dataKey="price" 
          stroke={colors.primary} 
          strokeWidth={3}
          dot={{ r: 7, fill: '#fff', stroke: colors.primary, strokeWidth: 3, filter: 'drop-shadow(0 0 8px #6366F188)' }}
          activeDot={{ r: 10, fill: colors.primary, stroke: '#fff', strokeWidth: 3, filter: 'drop-shadow(0 0 12px #6366F1)' }}
          fill="url(#colorPrice)"
        />
      </LineChart>
    </div>
  );
};

export default SoybeanGraph;