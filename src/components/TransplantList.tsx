/* eslint-disable react/prop-types */
import { Button, Modal, Table, Toast, Dropdown } from "flowbite-react"; // Import the HiInformationCircle icon from the react-icons/hi package
import { Fragment, useEffect, useState } from "react";
import { Timestamp } from "firebase/firestore";
import { Spinner } from "flowbite-react";
import styles from "./Pages.module.scss";
import axios from "axios";
import { formatDate } from "./Functions/common";
import React from "react";
import { HiCheck, HiX, HiOutlineExclamationCircle, HiExclamation } from "react-icons/hi";

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
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [message, setMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState<string>("");
  const [selectedCrop, setSelectedCrop] = useState("Select Crop");
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedId, setSelectedId] = useState(0);

  const fetchTransplants = async () => {
    setLoading(true); // Set loading to true before fetching data

    try {
      const farmUid = localStorage.getItem("farm_uid") ?? "";
      let response;
      if (selectedId) {
        response = await axios.get(
          `${apiUrl}/public/transplants/get?farm_uid=${farmUid}&crop_id=${selectedId}`
        );
      } else {
        response = await axios.get(
          `${apiUrl}/public/transplants/get?farm_uid=${farmUid}`
        );
      }
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
    fetchTransplants();
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
        entity: "Transplant",
        id: Number(deleteItemId),
        farm_uid: localStorage.getItem("farm_uid"),
      });

      setShowToast(true);
      setMessage(response.data.message);
      if (response.data.status === "OK") {
        fetchTransplants();
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
              Are you sure you want to delete this transplant?
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
              <Table.HeadCell>Harvest</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
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
                      <Table.Cell>
                        <Button
                          outline
                          pill
                          color="light"
                          onClick={() => {
                            setDeleteItemId(transplant.id);
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
    </React.Fragment>
  );
};
