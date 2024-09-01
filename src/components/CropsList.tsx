import { Table } from "flowbite-react"; // Import the HiInformationCircle icon from the react-icons/hi package
import { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import styles from "./Pages.module.scss";
import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;


interface Crop {
  id: string;
  name: string;
  // other fields...
}

interface ListProps {
  refreshCrops: boolean; // Add refresh prop
}

export const CropsList: React.FC<ListProps> = ({ refreshCrops }) => {
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [crops, setCrops] = useState<Crop[]>([]);

  const fetchCrops = async () => {
    setLoading(true); // Set loading to true before fetching data

    try {
      const farmUid = sessionStorage.getItem("farm_uid") ?? "";
      const response = await axios.get(
        `${apiUrl}/public/crops/get?farm_uid=${farmUid}`
      );
      if (response.data.status && response.data.status === "NOK") {
        console.error(response.data.message);
        setCrops([]);
      } else {
        setCrops(response.data); // Pass response.data instead of salesData.data
      }
    } catch (error) {
      console.error("Error fetching crops data", error);
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  useEffect(() => {
    fetchCrops();
  }, [refreshCrops]);


  return (
    <>
      {loading ? (
        <div className="text-center">
          <Spinner aria-label="Extra large spinner example" size="xl" />
        </div>
      ) : (
        <Table striped className="mt-5">
          <Table.Head className={styles["sticky-header"]}>
            <Table.HeadCell>Name</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {crops.map((crop, index) => {
              return (
                  <Table.Row
                    key={index}
                    className="bg-white dark:border-gray-700 dark:bg-gray-800"
                  >
                    <Table.Cell>{crop.name}</Table.Cell>
                  </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      )}
    </>
  );
};
