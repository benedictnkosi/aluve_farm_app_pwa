import { Button, Dropdown, Modal, Table, Toast } from "flowbite-react"; // Import the HiInformationCircle icon from the react-icons/hi package
import { Fragment, useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import styles from "./Pages.module.scss";
import axios from "axios";
import { formatDate, formatShortDate } from "./Functions/common";
import {
  HiCheck,
  HiX,
  HiOutlineExclamationCircle,
  HiExclamation,
} from "react-icons/hi";
import React from "react";

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
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [message, setMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [seedlingId, setSeedlingId] = useState<string>("");
  const [selectedCrop, setSelectedCrop] = useState("Select Crop");
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedId, setSelectedId] = useState(0);

  const fetchSeedlings = async () => {
    setLoading(true); // Set loading to true before fetching data

    try {
      const farmUid = localStorage.getItem("farm_uid") ?? "";
      let response;
      if (selectedId) {
        response = await axios.get(
          `${apiUrl}/public/seedlings/get?farm_uid=${farmUid}&crop_id=${selectedId}`
        );
      } else {
        response = await axios.get(
          `${apiUrl}/public/seedlings/get?farm_uid=${farmUid}`
        );
      }

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

  const getCrops = async () => {
    try {
      setLoading(true);
      const farmUid = localStorage.getItem("farm_uid") ?? "";
      const crops = await axios.get(
        `${apiUrl}/public/crops/get?farm_uid=${farmUid}`
      );
      if (crops.data.status && crops.data.status === "NOK") {
        setMessage(crops.data.message);
        setCrops([]);
      } else {
        setCrops(crops.data);
      }
    } catch (error) {
      console.error("Error fetching crops names:", error);
      setMessage("Error fetching crops names.");
      setShowToast(true);
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeedlings();
  }, [refresh, selectedId]);

  useEffect(() => {
    getCrops();
  }, [refresh]);

  const resetValues = (): void => {
    setIsError(false);
    setShowToast(false);
    setMessage("");
  };

  const deleteItem = async () => {
    setOpenDeleteModal(false);
    setLoading(true);
    resetValues();

    try {
      const response = await axios.post(`${apiUrl}/public/item/delete`, {
        entity: "Seedling",
        id: Number(seedlingId),
        farm_uid: localStorage.getItem("farm_uid"),
      });

      setShowToast(true);
      setMessage(response.data.message);
      if (response.data.status === "OK") {
        fetchSeedlings();
      } else {
        setIsError(true);
      }
    } catch {
      setIsError(true);
      setMessage("Error removing sale");
    } finally {
      setLoading(false);
    }
  };

  let previousDate: string | null = null;

  return (
    <>
      {/* delete modal */}
      <Modal
        show={openDeleteModal}
        size="md"
        onClose={() => setOpenDeleteModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this seedling and all transplants
              linked?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={() => deleteItem()}>
                {"Yes, I'm sure"}
              </Button>
              <Button color="gray" onClick={() => setOpenDeleteModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {showToast && (
        <Toast>
          {isError ? (
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200 ">
              <HiExclamation className="h-5 w-5" />
            </div>
          ) : (
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
              <HiCheck className="h-5 w-5" />
            </div>
          )}
          <div className="ml-3 text-sm font-normal">{message}</div>
          <Toast.Toggle onClick={() => setShowToast(false)} />
        </Toast>
      )}

      {loading ? (
        <div className="text-center">
          <Spinner aria-label="Extra large spinner example" size="xl" />
        </div>
      ) : (
        <>
          <Dropdown label={selectedCrop} color="light">
            {crops.map((crop, index) => (
              <Dropdown.Item
                onClick={() => {
                  setSelectedCrop(crop.name);
                  setSelectedId(Number(crop.id));
                }}
                key={index}
              >
                {crop.name}
              </Dropdown.Item>
            ))}
          </Dropdown>
          <div className={styles["table-width-responsive"]}>
            <Table striped className="mt-5">
              <Table.Head className={styles["sticky-header"]}>
                <Table.HeadCell>Crop</Table.HeadCell>
                <Table.HeadCell>Seed</Table.HeadCell>
                <Table.HeadCell>Quantity</Table.HeadCell>
                <Table.HeadCell>Transplant</Table.HeadCell>
                <Table.HeadCell>Transplanted</Table.HeadCell>
                <Table.HeadCell>Delete</Table.HeadCell>
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
                          {seedling.transplanted && (
                            <HiCheck className="text-green-500" />
                          )}
                        </Table.Cell>

                        <Table.Cell>
                          <Button
                            outline
                            pill
                            color="light"
                            onClick={() => {
                              setSeedlingId(seedling.id);
                              setOpenDeleteModal(true);
                            }}
                          >
                            <HiX className="h-4 w-4 text-orange-500" />
                          </Button>
                        </Table.Cell>
                      </Table.Row>
                    </Fragment>
                  );
                })}
              </Table.Body>
            </Table>
          </div>
        </>
      )}
    </>
  );
};
