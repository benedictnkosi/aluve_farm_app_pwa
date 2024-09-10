import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const apiUrl = import.meta.env.VITE_API_URL;

interface Item {
  date: string;
  crop: string;
  count: number;
}

interface Props {
  width?: string;
  height?: number;
}

const WeeklySeedling = ({ width = "100%", height = 400 }: Props) => {
  const [data, setData] = useState<Item[]>([]);

  const fetchData = async () => {

    const farmUid = localStorage.getItem("farm_uid") ?? "";
    try {
      const response = await axios.get(
        `${apiUrl}/public/dashboard/weeklyseedlings?farm_uid=${farmUid}`
      );
      if (response.data.status && response.data.status === "NOK") {
        console.error(response.data.message);
        setData([]);
      } else {
        setData(response.data); // Pass response.data instead of salesData.data
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const groupedData: { [key: string]: unknown } = data.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = { date: item.date };
    }
    (acc[item.date] as { [key: string]: number })[item.crop] = item.count;
    return acc;
  }, {} as { [key: string]: unknown });

  // Convert grouped data to an array
    const formattedData = Object.values(groupedData);

    // Get unique crop names for dynamic Line creation
    const crops = [...new Set(data.map(item => item.crop))];
  
    // Define colors for each crop dynamically (you can expand this array as needed)
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28'];
  

  return (
    <React.Fragment>
    <ResponsiveContainer width={width} height={height}>
      <LineChart
        data={formattedData}
        margin={{
          top: 5, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        {crops.map((crop, index) => (
          <Line
            key={crop}
            type="monotone"
            dataKey={crop}
            stroke={colors[index % colors.length]}
            activeDot={{ r: 8 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
    </React.Fragment>
  );
};

export default WeeklySeedling;