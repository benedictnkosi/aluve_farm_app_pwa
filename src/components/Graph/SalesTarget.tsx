// Import the HiInformationCircle icon from the react-icons/hi package
import { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import axios from "axios";
import React from "react";
import { Progress } from "flowbite-react";

const apiUrl = import.meta.env.VITE_API_URL;

export const SalesTarget: React.FC = () => {
  const [targetPercent, setTargetPercent] = useState<number>(0);
  const [progressBarText, setProgressBarText] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(true); // Add loading state

  const fetchData = async () => {
    setLoading(true); // Set loading to true before fetching data

    const farmUid = localStorage.getItem("farm_uid") ?? "";
    try {
      const response = await axios.get(
        `${apiUrl}/public/dashboard/salesStats?farm_uid=${farmUid}`
      );
      if (response.data.status && response.data.status === "NOK") {
        console.error(response.data.message);
      } else {
        const totalSales = response.data.totalSalesThisMonth + response.data.totalAgentSalesThisMonth;
        const farmTarget = localStorage.getItem("farm_target");
        const targetPercent = totalSales / (farmTarget ? parseInt(farmTarget) : 1) * 100;
        setProgressBarText(`${totalSales}/${farmTarget}`);
        setTargetPercent(Math.floor(targetPercent));
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

  return (
    <>
      {loading ? (
        <div className="text-center">
          <Spinner aria-label="Extra large spinner example" size="xl" />
        </div>
      ) : (
        <div className={"container mt-4"}>
          <Progress progress={targetPercent} textLabel={progressBarText} size="lg" labelProgress labelText />
        </div>
      )}
    </>
  );
};
