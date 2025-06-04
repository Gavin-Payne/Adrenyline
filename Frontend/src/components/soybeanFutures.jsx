import React, { useEffect, useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
} from "recharts";

const SoybeanFuturesGraph = () => {
    const [data, setData] = useState([]);

    useEffect(() => {
        const savedData = localStorage.getItem("soybeanFuturesData");
        if (savedData) {
            setData(JSON.parse(savedData));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("soybeanFuturesData", JSON.stringify(data));
    }, [data]);

    useEffect(() => {
        const apiKey = process.env.REACT_APP_SOYBEAN_API_KEY;
        if (!apiKey) {
            console.error("No API key provided. Check your .env file.");
            return;
        }

        const fetchData = async () => {
            try {
                const response = await fetch("process.env.REACT_APP_API_URL/graphics/soybean_data");

                if (!response.ok) {
                    throw new Error(`API request failed: ${response.status}`);
                }

                const result = await response.json();
                if (!result.updated || !result.price) {
                    console.error("Invalid API response:", result);
                    return;
                }

                const newEntry = {
                    price: result.price,
                    updated: new Date(result.updated * 1000).toLocaleTimeString(),
                };

                setData((prevData) => [...prevData.slice(-9), newEntry]);
            } catch (error) {
                console.error("Error fetching soybean futures data:", error);
            }
        };

        fetchData(); // Fetch initially
        const interval = setInterval(fetchData, 3600000); // Fetch every hour

        return () => {
            clearInterval(interval);
        };
    }, []);

    return (
        <div>
            {data.length === 0 ? (
                <div>Loading soybean futures data...</div>
            ) : (
                <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="updated" />
                        <YAxis domain={["auto", "auto"]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="price" stroke="#8884d8" dot={false} />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
};

export default SoybeanFuturesGraph;
