import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import axios from 'axios';
import { FaHistory, FaChartLine, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../utils/constants';
import { colors } from '../../styles/theme';

const CommodityChart = ({ title, commodity, color, secondaryColor, icon }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestPrice, setLatestPrice] = useState(null);
  const [previousPrice, setPreviousPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const response = await axios.get(`${API_ENDPOINTS.BASE_URL}/graphics/${commodity}`);
        
        if (!response.data || !response.data.history) {
          throw new Error('Invalid response format from server');
        }
        const historyData = response.data.history.map(item => ({
          timestamp: new Date(item.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          }),
          price: item.price,
          date: new Date(item.timestamp).toLocaleDateString([], {
            month: 'short',
            day: 'numeric'
          })
        }));
        historyData.reverse();

        if (historyData.length > 0) {
          const latest = historyData[historyData.length - 1].price;
          const previous = historyData.length > 1 ? historyData[historyData.length - 2].price : latest;
          
          setLatestPrice(latest);
          setPreviousPrice(previous);

          const change = latest - previous;
          const changePercent = previous !== 0 ? (change / previous) * 100 : 0;
          
          setPriceChange({
            value: change,
            percent: changePercent,
            isPositive: change >= 0
          });
        }
        
        setData(historyData);
        setLoading(false);
      } catch (err) {
        console.error(`Error fetching ${commodity} data:`, err);
        setError(err.message || 'Failed to load data');
        setLoading(false);
      }
    };
    
    fetchData();

    const interval = setInterval(fetchData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [commodity]);
  
  const formatYAxis = (value) => {
    return value.toFixed(2);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'rgba(20, 20, 20, 0.9)',
          border: `1px solid ${color}`,
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)'
        }}>
          <p style={{ marginBottom: '4px', color: '#FFF' }}><strong>{label}</strong></p>
          <p style={{ color: color }}>{`Price: $${payload[0].value.toFixed(2)}`}</p>
          {payload[0].payload.date && (
            <p style={{ color: '#AAA', fontSize: '0.8rem', margin: 0 }}>{payload[0].payload.date}</p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div style={{
        backgroundColor: colors.background.elevated,
        padding: '20px',
        borderRadius: '8px',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <div style={{ marginBottom: '16px' }}>
          {icon}
        </div>
        <h3>{title}</h3>
        <div style={{
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          borderTop: `3px solid ${color}`,
          animation: 'spin 1s linear infinite'
        }}></div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: colors.background.elevated,
        padding: '20px',
        borderRadius: '8px',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,0,0,0.2)'
      }}>
        <h3 style={{ color: '#f44336' }}>{title} - Error</h3>
        <p style={{ color: '#f44336' }}>{error}</p>
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <div style={{
        backgroundColor: colors.background.elevated,
        padding: '20px',
        borderRadius: '8px',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid rgba(255,255,255,0.05)'
      }}>
        <h3>{title}</h3>
        <p>No data available</p>
      </div>
    );
  }
  
  const prices = data.map(item => item.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const buffer = (max - min) * 0.1;
  
  return (
    <div style={{
      backgroundColor: colors.background.elevated,
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      border: '1px solid rgba(255,255,255,0.05)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: color
          }}>
            {icon}
          </div>
          <h3 style={{ margin: 0 }}>{title}</h3>
        </div>
        
        {latestPrice && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
              ${latestPrice.toFixed(2)}
            </div>
            
            {priceChange && (
              <div style={{
                fontSize: '0.9rem',
                color: priceChange.isPositive ? '#4caf50' : '#f44336',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: '4px'
              }}>
                {priceChange.isPositive ? <FaArrowUp size={12} /> : <FaArrowDown size={12} />}
                ${Math.abs(priceChange.value).toFixed(2)} ({Math.abs(priceChange.percent).toFixed(2)}%)
              </div>
            )}
          </div>
        )}
      </div>
      
      <div style={{ flex: 1, minHeight: '180px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#aaa"
              tick={{ fill: '#aaa', fontSize: '0.75rem' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[min - buffer, max + buffer]} 
              tickFormatter={formatYAxis}
              stroke="#aaa"
              tick={{ fill: '#aaa', fontSize: '0.75rem' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke={color}
              strokeWidth={2}
              dot={false}
              animationDuration={500}
              activeDot={{ 
                r: 6, 
                stroke: color,
                strokeWidth: 2,
                fill: secondaryColor
              }}
            />
            {previousPrice && (
              <ReferenceLine 
                y={previousPrice} 
                stroke="rgba(255,255,255,0.3)" 
                strokeDasharray="3 3"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '12px',
        fontSize: '0.8rem',
        color: '#aaa'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FaHistory size={12} />
          Last updated: {data.length > 0 ? new Date().toLocaleTimeString() : 'N/A'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <FaChartLine size={12} />
          {data.length} data points
        </div>
      </div>
    </div>
  );
};

export default CommodityChart;