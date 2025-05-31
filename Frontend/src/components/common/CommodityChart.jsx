import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaChartLine, FaSync } from 'react-icons/fa';

const CommodityChart = ({ 
  title, 
  commodity, 
  color = '#4CAF50',
  secondaryColor = '#2E7D32',
  icon = <FaChartLine />
}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const generateMockData = () => {
    const mockData = [];
    const basePrice = commodity === 'aluminum' ? 2350 : 410;
    const volatility = commodity === 'aluminum' ? 50 : 15;
    const now = new Date();
    for (let i = 12; i >= 0; i--) {
      const time = new Date(now);
      time.setHours(time.getHours() - i * 2);
      const trendFactor = Math.sin(i / 4) * 0.3 + 0.1;
      const randomVariation = (Math.random() - 0.5) * volatility;
      const price = basePrice + (trendFactor * basePrice * 0.1) + randomVariation;
      mockData.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: parseFloat(price.toFixed(2)),
        date: time.toLocaleDateString()
      });
    }
    return mockData;
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setData(generateMockData());
    setTimeout(() => setRefreshing(false), 800);
  };

  useEffect(() => {
    const mockData = generateMockData();
    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 800);
  }, [commodity]);

  const getMinMax = () => {
    if (!data.length) return [0, 100];
    const prices = data.map(d => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const buffer = (max - min) * 0.05;
    return [min - buffer, max + buffer];
  };

  const getPriceChange = () => {
    if (data.length < 2) return { change: 0, percentage: 0, isUp: true };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstTodayIdx = data.findIndex(d => {
      const dDate = new Date(d.date);
      dDate.setHours(0, 0, 0, 0);
      return dDate.getTime() === today.getTime();
    });
    const firstIdx = firstTodayIdx !== -1 ? firstTodayIdx : 0;
    const firstPrice = data[firstIdx].price;
    const lastPrice = data[data.length - 1].price;
    const change = lastPrice - firstPrice;
    return {
      change: Math.abs(change).toFixed(2),
      percentage: ((Math.abs(change) / firstPrice) * 100).toFixed(2),
      isUp: change >= 0
    };
  };

  const priceChange = getPriceChange();
  const [yMin, yMax] = getMinMax();

  return (
    <div style={{
      background: `linear-gradient(135deg, ${color}0D 0%, #23263a 100%)`,
      borderRadius: '16px',
      padding: '28px',
      marginBottom: '24px',
      boxShadow: `0 6px 24px ${color}22`,
      border: `1.5px solid ${color}33`,
      position: 'relative',
      overflow: 'visible',
      minHeight: 340
    }}>
      <div style={{
        position: 'absolute',
        top: '-40px',
        right: '-40px',
        width: '220px',
        height: '220px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
        zIndex: 0,
        opacity: 0.7
      }}></div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '18px',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: `${color}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '14px',
            boxShadow: `0 2px 12px ${color}33`
          }}>
            {React.cloneElement(icon, { color: color, size: 22 })}
          </div>
          <h3 style={{ 
            margin: 0,
            color: color,
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: 1.1
          }}>{title}</h3>
        </div>
        <button 
          onClick={handleRefresh}
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: color,
            transition: 'all 0.2s',
            boxShadow: refreshing ? `0 0 12px ${color}88` : 'none'
          }}
        >
          <FaSync 
            size={16} 
            style={{ 
              animation: refreshing ? 'spin 1s linear infinite' : 'none' 
            }} 
          />
        </button>
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'baseline',
        marginBottom: '18px',
        position: 'relative',
        zIndex: 1 
      }}>
        <span style={{ 
          fontSize: '2.1rem', 
          fontWeight: '700', 
          color: color,
          textShadow: `0 2px 8px ${color}33`
        }}>
          {data.length ? `$${data[data.length - 1].price}` : '—'}
        </span>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginLeft: '12px',
          padding: '5px 12px',
          borderRadius: '6px',
          backgroundColor: priceChange.isUp ? 'rgba(76, 175, 80, 0.13)' : 'rgba(244, 67, 54, 0.13)',
          color: priceChange.isUp ? '#4CAF50' : '#F44336',
          fontSize: '1rem',
          fontWeight: 600,
          boxShadow: priceChange.isUp ? '0 0 8px #4CAF5044' : '0 0 8px #F4433644'
        }}>
          {priceChange.isUp ? '▲' : '▼'} ${priceChange.change} ({priceChange.percentage}%)
        </div>
      </div>
      {loading ? (
        <div style={{
          height: '220px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#aaa',
          fontSize: '1.1rem',
          fontWeight: 600
        }}>
          Loading chart data...
        </div>
      ) : error ? (
        <div style={{
          height: '220px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#F44336',
          fontWeight: 600
        }}>
          Error loading data: {error}
        </div>
      ) : (
        <div style={{ height: '220px', position: 'relative', zIndex: 1 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <defs>
                <linearGradient id={`gradientLine-${commodity}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.9}/>
                  <stop offset="95%" stopColor={secondaryColor} stopOpacity={0.3}/>
                </linearGradient>
                <linearGradient id={`gradientArea-${commodity}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.18}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.13)" />
              <XAxis 
                dataKey="time" 
                axisLine={{ stroke: color, strokeWidth: 1.2 }} 
                tick={{ fill: color, fontSize: 12, fontWeight: 600 }}
              />
              <YAxis 
                domain={[yMin, yMax]} 
                axisLine={{ stroke: color, strokeWidth: 1.2 }} 
                tick={{ fill: color, fontSize: 12, fontWeight: 600 }}
                width={50}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#23263a', 
                  border: `1.5px solid ${color}`,
                  color: color,
                  borderRadius: '8px',
                  fontWeight: 600
                }}
                labelStyle={{ color: color, fontWeight: 600 }}
              />
              <Legend iconType="circle" wrapperStyle={{ color: color, fontWeight: 600 }} />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={`url(#gradientLine-${commodity})`}
                strokeWidth={3} 
                dot={{ r: 7, fill: '#fff', stroke: color, strokeWidth: 3, filter: `drop-shadow(0 0 8px ${color}88)` }}
                activeDot={{ r: 11, fill: color, stroke: '#fff', strokeWidth: 3, filter: `drop-shadow(0 0 16px ${color})` }}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: '12px',
        color: color,
        fontSize: '0.85rem',
        fontWeight: 600
      }}>
        Last updated: {!loading && data.length ? data[data.length - 1].time : '--:--'}
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CommodityChart;