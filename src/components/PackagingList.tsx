import { Table } from "flowbite-react"; // Import the HiInformationCircle icon from the react-icons/hi package
import { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import styles from "./Pages.module.scss";
import axios from "axios";
import React from "react";

const apiUrl = import.meta.env.VITE_API_URL;

interface Packaging {
  id: string;
  name: string;
  weight: number;
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

export const PackagingList: React.FC<SalesListProps> = ({ refresh }) => {
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [packages, setPackages] = useState<Packaging[]>([]);

  const fetchpackages = async () => {
    setLoading(true); // Set loading to true before fetching data

    try {
      const farmUid = localStorage.getItem("farm_uid") ?? "";
      const response = await axios.get(
        `${apiUrl}/public/packaging/get?farm_uid=${farmUid}`
      );
      if (response.data.status && response.data.status === "NOK") {
        console.error(response.data.message);
        setPackages([]);
      } else {
        setPackages(response.data); // Pass response.data instead of salesData.data
      }
    } catch(error) {
      console.error("Error fetching sales data", error);
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  useEffect(() => {
    fetchpackages();
  }, [refresh]);

  return (
    <>
      {loading ? (
        <div className="text-center">
          <Spinner aria-label="Extra large spinner example" size="xl" />
        </div>
      ) : (
        <Table striped className="mt-5">
          <Table.Head className={styles["sticky-header"]}>
            <Table.HeadCell>Crop</Table.HeadCell>
            <Table.HeadCell>Name</Table.HeadCell>
            <Table.HeadCell>weight</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {packages.map((cropPackage, index) => {
              return (
                <Table.Row
                  key={index}
                  className="bg-white dark:border-gray-700 dark:bg-gray-800"
                >
                  <Table.Cell>{cropPackage.crop.name}</Table.Cell>
                  <Table.Cell>{cropPackage.name}</Table.Cell>
                  <Table.Cell>{cropPackage.weight}</Table.Cell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      )}
    </>
  );
};
