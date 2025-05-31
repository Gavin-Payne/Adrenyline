import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [sportsData, setSportsData] = useState({});

  useEffect(() => {
    const fetchSportsData = async () => {
      try {
        const response = await axios.get('https://www.thesportsdb.com/api/v1/json/YOUR_API_KEY/upcomingevents.php');
        setSportsData(response.data);
      } catch (error) {
        console.error('Error fetching sports data:', error);
      }
    };

    fetchSportsData();
  }, []);

  return (
    <div>
      <h2>Upcoming Sports Events</h2>
      <div>
        {sportsData.events ? (
          sportsData.events.map(event => (
            <div key={event.idEvent}>
              <h3>{event.strEvent}</h3>
              <p>{event.strVenue}</p>
              <p>{event.dateEvent}</p>
            </div>
          ))
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
