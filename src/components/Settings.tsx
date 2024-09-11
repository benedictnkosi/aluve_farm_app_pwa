import { NavBar } from "./NavBar/NavBar";
import { SeedsList } from "./SeedsList";
import { CropsList } from "./CropsList";
import { CustomerList } from "./CustomerList";
import React from "react";

import styles from "./Pages.module.scss";
import {
  Alert,
  Button,
  Checkbox, // Import Checkbox component
  Dropdown,
  Label,
  Modal,
  Spinner,
  Tabs,
  TextInput,
  Toast,
} from "flowbite-react";

import { useEffect, useState } from "react";
import { HiCheck, HiInformationCircle, HiCog, HiExclamation } from "react-icons/hi";
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
  const [refreshCustomers, setRefreshCustomers] = useState<boolean>(false); // Add state for refresh
  const [isAgent, setIsAgent] = useState<boolean>(false); // Add state for refresh
  const [contactPerson, setContactPerson] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [openCustomerModal, setOpenCustomerModal] = useState<boolean>(false); // Add state for refresh
  const [customerName, setCustomerName] = useState("");


  const [isError, setIsError] = useState(false);

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
        farm_uid: localStorage.getItem("farm_uid"),
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

  const createCustomer = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/public/customer/create`, {
        name: customerName,
        contact_person: contactPerson,
        phone_number: contactNumber,
        is_agent: isAgent,
        farm_uid: localStorage.getItem("farm_uid"),
      });

      if (response.data.status === "OK") {
        setShowToast(true);
        setIsError(false);
        setMessage(response.data.message);
        setRefreshCustomers(!refreshCustomers);
        setOpenCustomerModal(false);
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


  const createCrop = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/public/crop/create`, {
        name: cropName,
        farm_uid: localStorage.getItem("farm_uid"),
      });

      if (response.data.status === "OK") {
        setShowToast(true);
        setIsError(false);
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
        farm_uid: localStorage.getItem("farm_uid"),
      });

      if (response.data.status === "OK") {
        setShowToast(true);
        setIsError(false);
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
    if (openModal || openPackagingModal) {
      setIsError(false);
      getCrops();
    }
  }, [openModal, openPackagingModal]);

  return (
    <>
      <NavBar />
      <div className="flex">
        <SidebarNav />
        <Tabs aria-label="Full width tabs">
          <Tabs.Item active title="Crops" icon={HiCog}>
            <div className="flex mt-5">
              <div className={styles["section-header"]}>Crops</div>
              <Button  gradientDuoTone="greenToBlue" outline
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
              <Button  gradientDuoTone="greenToBlue" outline
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
              <Button  gradientDuoTone="greenToBlue" outline
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
          <div className="flex mt-5">
              <div className={styles["section-header"]}>Customers</div>
              <Button  gradientDuoTone="greenToBlue" outline
                className="ml-auto"
                color="light"
                onClick={() => setOpenCustomerModal(true)}
              >
                Add New Customer
              </Button>
            </div>

            <CustomerList refreshCustomers={refreshCustomers} />
          </Tabs.Item>
          <Tabs.Item title="Joining ID" icon={HiCog}>
            <div>{localStorage.getItem("farm_uid")}</div>
          </Tabs.Item>
        </Tabs>

        <div>

          {/* Create new seed modal */}
          <Modal
            id="CreateCustomerModal"
            show={openCustomerModal}
            onClose={() => setOpenCustomerModal(false)}
          >
            <Modal.Header>Create New Customer</Modal.Header>
            <Modal.Body>
              <form className="flex max-w-md flex-col gap-4">
                {isError && (
                  <Alert color="failure" icon={HiInformationCircle}>
                    <span className="font-medium">Info alert!</span> {message}
                  </Alert>
                )}

                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="customerName" value="name" />
                  </div>
                  <TextInput
                    id="customerName"
                    type="text"
                    placeholder="Makro Springfield"
                    required
                    value={customerName}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      if (event && event.target) {
                        setCustomerName(event.target.value);
                      }
                    }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                  id="isAgent"
                  checked={isAgent}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setIsAgent(event.target.checked);
                  }}
                  />
                  <Label htmlFor="isAgent">Is this an agent</Label>
                </div>

                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="contactPerson" value="Contact Person" />
                  </div>
                  <TextInput
                    id="contactPerson"
                    type="text"
                    placeholder="Benedict"
                    required
                    value={contactPerson}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      if (event && event.target) {
                        setContactPerson(event.target.value);
                      }
                    }}
                  />
                </div>

                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="contactNumber" value="Contact Number" />
                  </div>
                  <TextInput
                    id="contactNumber"
                    type="text"
                    placeholder="082832034"
                    required
                    value={contactNumber}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      if (event && event.target) {
                        setContactNumber(event.target.value);
                      }
                    }}
                  />
                </div>

              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button gradientDuoTone="greenToBlue" outline onClick={() => createCustomer()}>
                {loading && (
                  <Spinner aria-label="Spinner button example" size="sm" />
                )}
                <span className="pl-3">Save</span>
              </Button>
              <Button gradientDuoTone="greenToBlue" outline color="gray" onClick={() => setOpenCustomerModal(false)}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>


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
                    <span className="font-medium">Info alert!</span> {message}
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
              <Button gradientDuoTone="greenToBlue" outline onClick={() => createSeed()}>
                {loading && (
                  <Spinner aria-label="Spinner button example" size="sm" />
                )}
                <span className="pl-3">Save</span>
              </Button>
              <Button gradientDuoTone="greenToBlue" outline color="gray" onClick={() => setOpenModal(false)}>
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
                    <span className="font-medium">Info alert!</span> {message}
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
              <Button gradientDuoTone="greenToBlue" outline onClick={() => createCrop()}>
                {loading && (
                  <Spinner aria-label="Spinner button example" size="sm" />
                )}
                <span className="pl-3">Save</span>
              </Button>
              <Button gradientDuoTone="greenToBlue" outline color="gray" onClick={() => setOpenCropsModal(false)}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>

        {/* Create new packaging modal */}
        <Modal
            id="CreatePackagingModal"
            show={openPackagingModal}
            onClose={() => setOpenPackagingModal(false)}
          >
            <Modal.Header>Create New Packaging</Modal.Header>
            <Modal.Body>
              <form className="flex max-w-md flex-col gap-4">
                {isError && (
                  <Alert color="failure" icon={HiInformationCircle}>
                    <span className="font-medium">Info alert!</span> {message}
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
                    <Label htmlFor="packagingName" value="Name" />
                  </div>
                  <TextInput
                    id="packagingName"
                    type="text"
                    placeholder="Spinach Bunch"
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
                    <Label htmlFor="weight" value="Weight" />
                  </div>
                  <TextInput
                    id="weight"
                    type="number"
                    placeholder="6"
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
              <Button gradientDuoTone="greenToBlue" outline onClick={() => createPackaging()}>
                {loading && (
                  <Spinner aria-label="Spinner button example" size="sm" />
                )}
                <span className="pl-3">Save</span>
              </Button>
              <Button gradientDuoTone="greenToBlue" outline color="gray" onClick={() => setOpenPackagingModal(false)}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>

          {showToast && (
        <Toast >
          {isError ? (
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-500 dark:bg-red-800 dark:text-red-200 ">
              <HiExclamation className="h-5 w-5" />
            </div>          ) : (
            <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
              <HiCheck className="h-5 w-5" />
            </div>
          )}
          <div className="ml-3 text-sm font-normal">{message}</div>
          <Toast.Toggle  onClick={() => setShowToast(false)} />
        </Toast>
      )}
        </div>
      </div>
    </>
  );
};
