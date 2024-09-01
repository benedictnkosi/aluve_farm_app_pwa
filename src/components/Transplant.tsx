import { NavBar } from "./NavBar/NavBar";
import { TransplantList } from "./TransplantList";
import styles from "./Pages.module.scss";
import {
  Alert,
  Button,
  Datepicker,
  Dropdown,
  Label,
  Modal,
  Spinner,
  TextInput,
  Toast,
} from "flowbite-react";
import { useEffect, useState } from "react";
import { HiCheck, HiInformationCircle } from "react-icons/hi";
import axios from "axios";
import { SidebarNav } from "./NavBar/SidebarNav";
import { formatDate } from "./Functions/common";
import React from "react";

const apiUrl = import.meta.env.VITE_API_URL;

interface Seedling {
  id: string;
  seedling_date: string;
  seed: Seed;
  [key: string]: unknown;
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

export const Transplant = () => {
  const [openModal, setOpenModal] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [transplantDate, setTransplantDate] = useState(new Date());
  const [harvestDate, setHarvestDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [seedlings, setSeedlings] = useState<Seedling[]>([]);
  const [selectedSeedling, setSelectedSeedling] = useState("Select Seedling Batch");
  const [selectedSeedlingId, setSelectedSeedlingId] = useState("");
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState<boolean>(false); // Add state for refresh
  const [isError, setIsError] = useState(false);

  const getSeedlings = async () => {
    try {
      setLoading(true);
      const farmUid = sessionStorage.getItem("farm_uid") ?? "";
      const seedlings = await axios.get(
        `${apiUrl}/public/seedlings/get?farm_uid=${farmUid}`
      );
      if (seedlings.data.status && seedlings.data.status === "NOK") {
        setMessage(seedlings.data.message);
        setSeedlings([]);
      } else {
        setSeedlings(seedlings.data);
      }
    } catch(error) {
      console.error("Error fetching seedlings names:", error);
      setMessage("Error fetching seedlings names.");
      setShowToast(true);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createTransplant = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/public/transplant/create`, {
        seedling_id: selectedSeedlingId,
        quantity: quantity,
        transplant_date: transplantDate,
        harvest_date: harvestDate,
        farm_uid: sessionStorage.getItem("farm_uid"),
      });

      if (response.data.status === "OK") {
        setShowToast(true);
        setMessage(response.data.message);
        setRefresh(!refresh);
        setOpenModal(false);
      } else {
        setIsError(true);
        setMessage(response.data.message);
      }
    } catch {
      setIsError(true);
      setMessage("Error recording sale.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (openModal) {
      getSeedlings();
    }
  }, [openModal]);

  return (
    <>
      <NavBar />
      <div className="flex">
        <SidebarNav />
        <div>
          <div className="flex mt-5">
            <div className={styles["section-header"]}>Transplant History</div>
            <Button
              className="ml-auto"
              color="light"
              onClick={() => setOpenModal(true)}
            >
              Transplant Seedlings
            </Button>
          </div>

          <TransplantList refresh={refresh} />

          <Modal
            id="CreateModal"
            show={openModal}
            onClose={() => setOpenModal(false)}
          >
            <Modal.Header>Transplant Seedlings</Modal.Header>
            <Modal.Body>
              <form className="flex max-w-md flex-col gap-4">
                {isError && (
                  <Alert color="failure" icon={HiInformationCircle}>
                    <span className="font-medium">Info alert!</span> Faield to
                    transplant seedlings.
                  </Alert>
                )}

                <div>
                  <Dropdown label={selectedSeedling} color="light">
                    {seedlings.map((seedling, index) => (
                      <Dropdown.Item
                        onClick={() => {
                          setSelectedSeedling(
                            formatDate(seedling.seedling_date) +
                              " - " +
                              seedling.seed.name
                          );
                          setSelectedSeedlingId(seedling.id);
                        }}
                        key={index}
                      >
                        {formatDate(seedling.seedling_date) +
                          " - " +
                          seedling.seed.name}
                      </Dropdown.Item>
                    ))}
                  </Dropdown>
                </div>

                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="quantity" value="Quantity" />
                  </div>
                  <TextInput
                    id="quantity"
                    type="number"
                    placeholder="How many units?"
                    required
                    value={quantity}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      if (event && event.target) {
                        setQuantity(event.target.value);
                      }
                    }}
                  />
                </div>

                <div>
                  <legend className="mb-4">Transplant Date?</legend>

                  <Datepicker
                  maxDate={new Date()}
                    onSelectedDateChanged={(newDate) =>
                      setTransplantDate(
                        new Date(newDate.getTime() + 24 * 60 * 60 * 1000)
                      )
                    }
                  />
                </div>


                <div>
                  <legend className="mb-4">Planned Harvest Date?</legend>

                  <Datepicker
                  minDate={new Date()}
                    onSelectedDateChanged={(newDate) =>
                      setHarvestDate(
                        new Date(newDate.getTime() + 24 * 60 * 60 * 1000)
                      )
                    }
                  />
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => createTransplant()}>
                {loading && (
                  <Spinner aria-label="Spinner button example" size="sm" />
                )}
                <span className="pl-3">Save</span>
              </Button>
              <Button color="gray" onClick={() => setOpenModal(false)}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>

          {showToast && (
            <Toast>
              <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                <HiCheck className="h-5 w-5" />
              </div>
              <div className="ml-3 text-sm font-normal">{message}</div>
              <Toast.Toggle />
            </Toast>
          )}
        </div>
      </div>
    </>
  );
};
