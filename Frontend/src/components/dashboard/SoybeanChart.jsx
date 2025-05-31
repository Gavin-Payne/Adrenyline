import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SoybeanGraph = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.api-ninjas.com/v1/commodities', {
          headers: {
            'X-Api-Key': process.env.REACT_APP_SOYBEAN_API_KEY
          }
        });
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        const soybeanData = data.find(item => item.name === "Soybeans");
        if (soybeanData) {
          setData([
            { name: 'Current', price: soybeanData.price },
            { name: 'Last Close', price: soybeanData.last_close },
            { name: 'Open', price: soybeanData.open }
          ]);
        }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div>Loading soybean data...</div>;
  if (error) return <div>Error loading soybean data: {error}</div>;

  return (
    <div style={{
      backgroundColor: '#2c2c2c',
      padding: '20px',
      borderRadius: '8px',
      marginTop: '20px'
    }}>
      <h3>Soybean Futures</h3>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="price" stroke="#4caf50" />
      </LineChart>
    </div>
  );
};

export default SoybeanGraph;