// Import the HiInformationCircle icon from the react-icons/hi package
import { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import styles from "../Pages.module.scss";
import axios from "axios";
import React from "react";
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
  date: Date;
  totalSales: number;
  // other fields...
}

export const DailySales: React.FC = () => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Add loading state

  const fetchData = async () => {
    setLoading(true); // Set loading to true before fetching data

    const farmUid = localStorage.getItem("farm_uid") ?? "";
    try {
      const response = await axios.get(
        `${apiUrl}/public/dashboard/dailysales?farm_uid=${farmUid}`
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

  const formatData = (data: Item[]) => {
    return data.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    }));
  };

  const formattedData = formatData(data);
  return (
    <>
      {loading ? (
        <div className="text-center">
          <Spinner aria-label="Extra large spinner example" size="xl" />
        </div>
      ) : (
        <div className={"container mt-4"}>
          <div className={styles["market-list"]}>
            <div className={styles["section-header"]}>Daily Sales</div>
            <div
              className={`${styles["card-container"]} ${styles["negative-margin-left"]}`}
            >
              <ResponsiveContainer width="100%" height={400}>
                <LineChart width={500} height={300} data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalSales"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
