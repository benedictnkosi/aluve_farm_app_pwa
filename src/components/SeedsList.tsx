import { Table } from "flowbite-react"; // Import the HiInformationCircle icon from the react-icons/hi package
import { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import styles from "./Pages.module.scss";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

interface Seed {
  id: string;
  name: number;
  manufacture: string;
  crop: Crop;
  // other fields...
}

interface Crop {
  id: string;
  name: string;
  // other fields...
}

interface ListProps {
  refresh: boolean; // Add refresh prop
}

export const SeedsList: React.FC<ListProps> = ({ refresh }) => {
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [seeds, setSeeds] = useState<Seed[]>([]);

  const fetchSeeds = async () => {
    setLoading(true); // Set loading to true before fetching data

    try {
      const farmUid = sessionStorage.getItem("farm_uid") ?? "";
      const response = await axios.get(
        `${apiUrl}/public/seeds/get?farm_uid=${farmUid}`
      );
      if (response.data.status && response.data.status === "NOK") {
        console.error(response.data.message);
        setSeeds([]);
      } else {
        setSeeds(response.data); // Pass response.data instead of salesData.data
      }
    } catch (error) {
      console.error("Error fetching sales data", error);
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  useEffect(() => {
    fetchSeeds();
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
            <Table.HeadCell>Manufacture</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {seeds.map((seed, index) => {
              
              return (
               
                  
                  <Table.Row
                    key={index}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell>{seed.crop.name}</Table.Cell>
                    <Table.Cell>{seed.name}</Table.Cell>
                    <Table.Cell>{seed.manufacture}</Table.Cell>
                  </Table.Row>
              
              );
            })}
          </Table.Body>
        </Table>
      )}
    </>
  );
};
