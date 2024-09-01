import { Table } from "flowbite-react"; // Import the HiInformationCircle icon from the react-icons/hi package
import { Fragment, useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import styles from "./Pages.module.scss";
import axios from "axios";
import { formatDate, formatShortDate } from "./Functions/common";
import {  HiCheck } from "react-icons/hi";

const apiUrl = import.meta.env.VITE_API_URL;

interface Seedling {
  id: string;
  quantity: number;
  seedling_date: string;
  transplant_date: string;
  seed: Seed;
  transplanted: boolean;
  // other fields...
}

interface Seed {
  id: string;
  name: string;
  crop: Crop;
  // other fields...
}

interface Crop {
  id: string;
  name: string;
  // other fields...
}

interface SalesListProps {
  refresh: boolean; // Add refresh prop
}

export const SeedlingsList: React.FC<SalesListProps> = ({ refresh }) => {
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [seedlings, setSeedlings] = useState<Seedling[]>([]);

  const fetchSales = async () => {
    setLoading(true); // Set loading to true before fetching data

    try {
      const farmUid = sessionStorage.getItem("farm_uid") ?? "";
      const response = await axios.get(
        `${apiUrl}/public/seedlings/get?farm_uid=${farmUid}`
      );
      if (response.data.status && response.data.status === "NOK") {
        console.error(response.data.message);
        setSeedlings([]);
      } else {
        setSeedlings(response.data); // Pass response.data instead of salesData.data
      }
    } catch (error) {
      console.error("Error fetching sales data", error);
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  useEffect(() => {
    fetchSales();
  }, [refresh]);

  let previousDate: string | null = null;

  return (
    <>
      {loading ? (
        <div className="text-center">
          <Spinner aria-label="Extra large spinner example" size="xl" />
        </div>
      ) : (
        <div className={styles["table-width-responsive"]}>
          <Table striped className="mt-5">
            <Table.Head className={styles["sticky-header"]}>
              <Table.HeadCell>Crop</Table.HeadCell>
              <Table.HeadCell>Seed</Table.HeadCell>
              <Table.HeadCell>Quantity</Table.HeadCell>
              <Table.HeadCell>Transplant</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {seedlings.map((seedling, index) => {
                const currentDate = formatDate(seedling.seedling_date);
                const showDateRow = previousDate !== currentDate;
                previousDate = currentDate;
                return (
                  <Fragment key={index}>
                    {showDateRow && (
                      <Table.Row className="bg-gray-200 dark:bg-gray-700">
                        <Table.Cell colSpan={8} className="font-bold">
                          {currentDate}
                        </Table.Cell>
                      </Table.Row>
                    )}
                    <Table.Row
                      key={index}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell>{seedling.seed.crop.name}</Table.Cell>
                      <Table.Cell>{seedling.seed.name}</Table.Cell>
                      <Table.Cell>{seedling.quantity}</Table.Cell>
                      <Table.Cell>
                        {formatShortDate(seedling.transplant_date)}
                        
                      </Table.Cell>
                      <Table.Cell>
                       
                        {seedling.transplanted && <HiCheck className="text-green-500" />}
                      </Table.Cell>
                    </Table.Row>
                  </Fragment>
                );
              })}
            </Table.Body>
          </Table>
        </div>
      )}
    </>
  );
};
