// Import the HiInformationCircle icon from the react-icons/hi package
import { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import axios from "axios";
import React from "react";
import { Progress } from "flowbite-react";
import SalesStatCard from "../SalesStatCard";
import { Card } from "flowbite-react";
import { HiArrowNarrowUp , HiArrowNarrowDown   } from "react-icons/hi";


const apiUrl = import.meta.env.VITE_API_URL;

export const SalesTarget: React.FC = () => {
  const [targetPercent, setTargetPercent] = useState<number>(0);
  const [progressBarText, setProgressBarText] = useState<string>("");
  const [salesThisMonth, setSalesThisMonth] = useState<number>(0);
  const [salesLastMonth, setSalesLastThisMonth] = useState<number>(0);
  const [agentSalesThisMonth, setagentSalesThisMonth] = useState<number>(0);
  const [agentSalesLastMonth, setagentSalesLastThisMonth] = useState<number>(0);
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
        const totalSales =
          response.data.totalSalesThisMonth +
          response.data.totalAgentSalesThisMonth;
        const farmTarget = localStorage.getItem("farm_target");
        const targetPercent =
          (totalSales / (farmTarget ? parseInt(farmTarget) : 1)) * 100;
        setSalesThisMonth(response.data.totalSalesThisMonth);
        setSalesLastThisMonth(response.data.totalSalesLastMonth);
        setagentSalesThisMonth(response.data.totalAgentSalesThisMonth);
        setagentSalesLastThisMonth(response.data.totalAgentSalesLastMonth);
        if (isNaN(targetPercent) || !isFinite(targetPercent)) {
          setProgressBarText(`0/0`);
          setTargetPercent(0);
        } else {
          setProgressBarText(`${Math.floor(totalSales)}/${farmTarget}`);
          setTargetPercent(Math.floor(targetPercent));
        }
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

  const nameOfCurrentMonth = (monthNumber: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthNumber];
  };

  return (
    <>
      {loading ? (
        <div className="text-center">
          <Spinner aria-label="Extra large spinner example" size="xl" />
        </div>
      ) : targetPercent > 0 ? (
        <div>
          <div className={"container mt-4 flex space-x-3"}>
            <Card href="#" className="max-w-sm">
              <p className=" tracking-tight text-gray-900 dark:text-white">
                {`${nameOfCurrentMonth(new Date().getMonth())}`}
                <div className={"container mt-4 flex space-x-4"}>
                  {`Total - ${(salesThisMonth + agentSalesThisMonth).toFixed(2)}`}
                    {salesThisMonth + agentSalesThisMonth > salesLastMonth + agentSalesLastMonth ? (
                    <HiArrowNarrowUp className="text-green-500 ml-1" />
                    ) : (
                    <HiArrowNarrowDown className="text-red-500 ml-1" />
                    )}
                    <span className="ml-2">
                      {(
                      ((salesThisMonth + agentSalesThisMonth - (salesLastMonth + agentSalesLastMonth)) /
                        (salesLastMonth + agentSalesLastMonth)) *
                      100
                      ).toFixed(2)}
                      %
                    </span>
                </div>
              </p>
              <div className={"container mt-4 flex space-x-3"}>
                <SalesStatCard
                  amount={salesThisMonth.toFixed(2).toString()}
                  description="Other"
                />

                <SalesStatCard
                  amount={agentSalesThisMonth.toFixed(2).toString()}
                  description="Agents"
                />
              </div>
            </Card>

            <Card href="#" className="max-w-sm">
              <h5 className="tracking-tight text-gray-900 dark:text-white">
              {`${nameOfCurrentMonth(new Date().getMonth() - 1)}`}
                <p>{`Total - ${(salesLastMonth + agentSalesLastMonth).toFixed(2)}`}</p>
              </h5>

              <div className={"container mt-4 flex space-x-3"}>
                <SalesStatCard
                  amount={salesLastMonth.toFixed(2).toString()}
                  description="Other"
                />

                <SalesStatCard
                  amount={agentSalesLastMonth.toFixed(2).toString()}
                  description="Agents"
                />
              </div>
            </Card>
          </div>
          <div className={"container mt-4"}>
            <p>Target for this month</p>
            <Progress
              progress={targetPercent}
              textLabel={progressBarText}
              size="lg"
              labelProgress
              labelText
            />
          </div>
        </div>
      ) : null}
    </>
  );
};
