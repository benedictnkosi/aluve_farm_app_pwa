import { NavBar } from "./NavBar/NavBar";
import { SeedsList } from "./SeedsList";
import { CropsList } from "./CropsList";
import React from "react";

import styles from "./Pages.module.scss";
import {
  Alert,
  Button,
  Dropdown,
  Label,
  Modal,
  Spinner,
  Tabs,
  TextInput,
  Toast,
} from "flowbite-react";

import { useEffect, useState } from "react";
import { HiCheck, HiInformationCircle, HiCog } from "react-icons/hi";
import axios from "axios";
import { SidebarNav } from "./NavBar/SidebarNav";
import { PackagingList } from "./PackagingList";

const apiUrl = import.meta.env.VITE_API_URL;

interface Item {
  id: string;
  name: string;
  [key: string]: unknown;
}

export const Settings = () => {
  const [openModal, setOpenModal] = useState(false);
  const [openCropsModal, setOpenCropsModal] = useState(false);
  const [openPackagingModal, setOpenPackagingModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [crops, setCrops] = useState<Item[]>([]);
  const [selectedCrop, setSelectedCrop] = useState("Select Crop");
  const [selectedCropId, setSelectedCropId] = useState("");
  const [cropName, setCropName] = useState("");
  const [packagingName, setPackagingName] = useState("");
  const [weight, setWeight] = useState("");
  const [seedName, setSeedName] = useState("");
  const [manufacture, setManufacture] = useState("");
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState<boolean>(false); // Add state for refresh
  const [refreshCrops, setRefreshCrops] = useState<boolean>(false); // Add state for refresh

  const [isError, setIsError] = useState(false);

  const getCrops = async () => {
    try {
      setLoading(true);
      const farmUid = sessionStorage.getItem("farm_uid") ?? "";
      const crops = await axios.get(
        `${apiUrl}/public/crops/get?farm_uid=${farmUid}`
      );
      if (crops.data.status && crops.data.status === "NOK") {
        setMessage(crops.data.message);
        setCrops([]);
      } else {
        setCrops(crops.data);
      }
    } catch(error) {
      console.error("Error fetching crops names:", error);
      setMessage("Error fetching crops names.");
      setShowToast(true);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createSeed = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/public/seeds/create`, {
        name: seedName,
        manufacture: manufacture,
        crop_id: selectedCropId,
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
      setMessage("Error creating seed.");
    } finally {
      setLoading(false);
    }
  };

  const createCrop = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/public/crop/create`, {
        name: cropName,
        farm_uid: sessionStorage.getItem("farm_uid"),
      });

      if (response.data.status === "OK") {
        setShowToast(true);
        setMessage(response.data.message);
        setRefreshCrops(!refreshCrops);
        setOpenCropsModal(false);
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

  const createPackaging = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/public/packaging/create`, {
        name: packagingName,
        weight: weight,
        crop_id: selectedCropId,
        farm_uid: sessionStorage.getItem("farm_uid"),
      });

      if (response.data.status === "OK") {
        setShowToast(true);
        setMessage(response.data.message);
        setRefresh(!refresh);
        setOpenPackagingModal(false);
      } else {
        setIsError(true);
        setMessage(response.data.message);
      }
    } catch {
      setIsError(true);
      setMessage("Error creating packaging.");
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (openModal) {
      setIsError(false);
      getCrops();
    }
  }, [openModal]);

  return (
    <>
      <NavBar />
      <div className="flex">
        <SidebarNav />
        <Tabs aria-label="Full width tabs">
          <Tabs.Item active title="Crops" icon={HiCog}>
            <div className="flex mt-5">
              <div className={styles["section-header"]}>Crops</div>
              <Button
                className="ml-auto"
                color="light"
                onClick={() => setOpenCropsModal(true)}
              >
                Add New Crop
              </Button>
            </div>

            <CropsList refreshCrops={refreshCrops} />
          </Tabs.Item>
          <Tabs.Item title="Seeds" icon={HiCog}>
            <div className="flex mt-5">
              <div className={styles["section-header"]}>Seeds</div>
              <Button
                className="ml-auto"
                color="light"
                onClick={() => setOpenModal(true)}
              >
                Add New Seed
              </Button>
            </div>
            <SeedsList refresh={refresh} />
          </Tabs.Item>
          <Tabs.Item title="Packaging" icon={HiCog}>
            <div className="flex mt-5">
              <div className={styles["section-header"]}>Packaging</div>
              <Button
                className="ml-auto"
                color="light"
                onClick={() => setOpenPackagingModal(true)}
              >
                Add New Packaging
              </Button>
            </div>
            <PackagingList refresh={refresh} />
          </Tabs.Item>
          <Tabs.Item title="Fertilisers" icon={HiCog}>
            <div>Fertilisers</div>
          </Tabs.Item>
          <Tabs.Item title="Pesticide" icon={HiCog}>
            <div>Pesticide</div>
          </Tabs.Item>
          
          <Tabs.Item title="Customers" icon={HiCog}>
            <div>Customers</div>
          </Tabs.Item>
          <Tabs.Item title="Joining ID" icon={HiCog}>
            <div>Joining ID</div>
          </Tabs.Item>
        </Tabs>

        <div>
          {/* Create new seed modal */}
          <Modal
            id="CreateModal"
            show={openModal}
            onClose={() => setOpenModal(false)}
          >
            <Modal.Header>Create New Seed</Modal.Header>
            <Modal.Body>
              <form className="flex max-w-md flex-col gap-4">
                {isError && (
                  <Alert color="failure" icon={HiInformationCircle}>
                    <span className="font-medium">Info alert!</span> Faield to
                    create seed.
                  </Alert>
                )}

                <div>
                  <Dropdown label={selectedCrop} color="light">
                    {crops.map((crop, index) => (
                      <Dropdown.Item
                        onClick={() => {
                          setSelectedCrop(crop.name);
                          setSelectedCropId(crop.id);
                        }}
                        key={index}
                      >
                        {crop.name}
                      </Dropdown.Item>
                    ))}
                  </Dropdown>
                </div>

                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="seedName" value="name" />
                  </div>
                  <TextInput
                    id="seedName"
                    type="text"
                    placeholder="Conquistador F1 Hybrid Cabbage"
                    required
                    value={seedName}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      if (event && event.target) {
                        setSeedName(event.target.value);
                      }
                    }}
                  />
                </div>

                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="manufacture" value="manufacture" />
                  </div>
                  <TextInput
                    id="manufacture"
                    type="text"
                    placeholder="Sakata"
                    required
                    value={manufacture}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      if (event && event.target) {
                        setManufacture(event.target.value);
                      }
                    }}
                  />
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => createSeed()}>
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

        {/* Create new crop modal */}
          <Modal
            id="CreateCropModal"
            show={openCropsModal}
            onClose={() => setOpenCropsModal(false)}
          >
            <Modal.Header>Create New Crop</Modal.Header>
            <Modal.Body>
              <form className="flex max-w-md flex-col gap-4">
                {isError && (
                  <Alert color="failure" icon={HiInformationCircle}>
                    <span className="font-medium">Info alert!</span> Faield to
                    create crop.
                  </Alert>
                )}

                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="cropName" value="name" />
                  </div>
                  <TextInput
                    id="cropName"
                    type="text"
                    placeholder="Cabbage"
                    required
                    value={cropName}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      if (event && event.target) {
                        setCropName(event.target.value);
                      }
                    }}
                  />
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => createCrop()}>
                {loading && (
                  <Spinner aria-label="Spinner button example" size="sm" />
                )}
                <span className="pl-3">Save</span>
              </Button>
              <Button color="gray" onClick={() => setOpenCropsModal(false)}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>

        {/* Create new packaging modal */}
        <Modal
            id="CreateModal"
            show={openPackagingModal}
            onClose={() => setOpenPackagingModal(false)}
          >
            <Modal.Header>Create New Packaging</Modal.Header>
            <Modal.Body>
              <form className="flex max-w-md flex-col gap-4">
                {isError && (
                  <Alert color="failure" icon={HiInformationCircle}>
                    <span className="font-medium">Info alert!</span> Faield to
                    create packaging.
                  </Alert>
                )}

                <div>
                  <Dropdown label={selectedCrop} color="light">
                    {crops.map((crop, index) => (
                      <Dropdown.Item
                        onClick={() => {
                          setSelectedCrop(crop.name);
                          setSelectedCropId(crop.id);
                        }}
                        key={index}
                      >
                        {crop.name}
                      </Dropdown.Item>
                    ))}
                  </Dropdown>
                </div>

                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="packagingName" value="name" />
                  </div>
                  <TextInput
                    id="packagingName"
                    type="text"
                    placeholder="Conquistador F1 Hybrid Cabbage"
                    required
                    value={packagingName}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      if (event && event.target) {
                        setPackagingName(event.target.value);
                      }
                    }}
                  />
                </div>

                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="weight" value="weight" />
                  </div>
                  <TextInput
                    id="weight"
                    type="text"
                    placeholder="Sakata"
                    required
                    value={weight}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      if (event && event.target) {
                        setWeight(event.target.value);
                      }
                    }}
                  />
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => createPackaging()}>
                {loading && (
                  <Spinner aria-label="Spinner button example" size="sm" />
                )}
                <span className="pl-3">Save</span>
              </Button>
              <Button color="gray" onClick={() => setOpenPackagingModal(false)}>
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
