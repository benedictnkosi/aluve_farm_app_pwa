import styles from "../Pages.module.scss";
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
import { Spinner } from "flowbite-react";

const apiUrl = import.meta.env.VITE_API_URL;

interface Item {
  week: number;
  crop: string;
  count: number;
}

export const WeeklyTransplant: React.FC = () => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Add loading state

  const fetchData = async () => {
    setLoading(true); // Set loading to true before fetching data

    const farmUid = localStorage.getItem("farm_uid") ?? "";
    try {
      const response = await axios.get(
        `${apiUrl}/public/dashboard/weeklytransplant?farm_uid=${farmUid}`
      );
      if (response.data.status && response.data.status === "NOK") {
        console.error(response.data.message);
        setData([]);
      } else {
        setData(response.data); // Pass response.data instead of salesData.data
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Transform the data to group by week and crop
  const transformedData = data.reduce((acc, item) => {
    const existingWeek = acc.find((week) => week.week === item.week);
    if (existingWeek) {
      existingWeek[item.crop] = item.count;
    } else {
      acc.push({ week: item.week, [item.crop]: item.count });
    }
    return acc;
  }, [] as Array<{ week: number; [key: string]: number }>);

  // Extract unique crop names
  const cropNames = Array.from(new Set(data.map((item) => item.crop)));

  // Define an array of colors
  const colors = [
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
    "#387908",
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ff00ff",
    "#00ffff",
  ];

  return (
    <>
      {loading ? (
        <div className="text-center">
          <Spinner aria-label="Extra large spinner example" size="xl" />
        </div>
      ) : (
        <div className={"container mt-4"}>
          <div className={styles["market-list"]}>
            <div className={styles["section-header"]}>Weekly Transplant</div>
            <div
              className={`${styles["card-container"]} ${styles["negative-margin-left"]}`}
            >
              <ResponsiveContainer width="90%" height={400}>
                <LineChart width={500} height={300} data={transformedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {cropNames.map((crop, index) => (
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
            </div>
          </div>
        </div>
      )}
    </>
  );
};