/* eslint-disable react/prop-types */
import { Table } from "flowbite-react"; // Import the HiInformationCircle icon from the react-icons/hi package
import { Fragment, useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { Spinner } from "flowbite-react";
import styles from "./Pages.module.scss";
import axios from "axios";
import { formatDate } from "./Functions/common";
import React from "react";

const apiUrl = import.meta.env.VITE_API_URL;

interface Transplant {
  id: string;
  quantity: number;
  transplant_date: string;
  harvest_date: string;
  seedling: Seedling;
  // other fields...
}

interface Seedling {
  seed: Seed;
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

export const TransplantList: React.FC<SalesListProps> = ({ refresh }) => {
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [transplants, setTransplants] = useState<Transplant[]>([]);

  const fetchTransplants = async () => {
    setLoading(true); // Set loading to true before fetching data

    try {
      const farmUid = sessionStorage.getItem("farm_uid") ?? "";
      const response = await axios.get(
        `${apiUrl}/public/transplants/get?farm_uid=${farmUid}`
      );
      if (response.data.status && response.data.status === "NOK") {
        console.error(response.data.message);
        setTransplants([]);
      } else {
        setTransplants(response.data); // Pass response.data instead of salesData.data
      }
    } catch(error) {
      console.error("Error fetching sales data", error);
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  useEffect(() => {
    fetchTransplants();
  }, [refresh]);

  const formatShortDate = (timestamp: Timestamp | string): string => {
    const date =
      typeof timestamp === "string" ? new Date(timestamp) : timestamp.toDate();
    const formattedDate = date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
    });
    return formattedDate;
  };

  let previousDate: string | null = null;

  return (
    <React.Fragment>
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
              <Table.HeadCell>Harvest</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {transplants.map((transplant, index) => {
                const currentDate = formatDate(transplant.transplant_date);
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
                      <Table.Cell>
                        {transplant.seedling.seed.crop.name}
                      </Table.Cell>
                      <Table.Cell>{transplant.seedling.seed.name}</Table.Cell>
                      <Table.Cell>{transplant.quantity}</Table.Cell>
                      <Table.Cell>
                        {formatShortDate(transplant.harvest_date)}
                      </Table.Cell>
                    </Table.Row>
                  </Fragment>
                );
              })}
            </Table.Body>
          </Table>
        </div>
      )}
    </React.Fragment>
  );
};
