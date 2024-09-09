import { NavBar } from "./NavBar/NavBar";
import { SalesList } from "./SalesList/SalesList";
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
import React from "react";

const apiUrl = import.meta.env.VITE_API_URL;

interface Item {
  id: string;
  name: string;
  [key: string]: unknown;
}

export const Sales = () => {
  const [openModal, setOpenModal] = useState(false);
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [date, setDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [crops, setCrops] = useState<Item[]>([]);
  const [customers, setCustomers] = useState<Item[]>([]);
  const [selectedCrop, setSelectedCrop] = useState("Select Crop");
  const [selectedCustomer, setSelectedCustomer] = useState("Select Customer");
  const [selectedId, setSelectedId] = useState("");
  const [selectedCropId, setSelectedCropId] = useState("");
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState<boolean>(false); // Add state for refresh
  const [isError, setIsError] = useState(false);
  const [packages, setPackages] = useState<Item[]>([]);
  const [selectedPackage, setSelectedPackage] = useState("Select Package");
  const [selectedPackageId, setSelectedPackageId] = useState("");

  const getCropNames = async () => {
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
        setCrops(crops.data); // Pass crops.data instead of crops
      }
    } catch(error) {
      console.error("Error fetching crop names:", error);
      setShowToast(true);

      return [];
    } finally {
      setLoading(false);
    }
  };

  const getCustomerNames = async () => {
    try {
      const farmUid = sessionStorage.getItem("farm_uid") ?? "";
      const response = await axios.get(
        `${apiUrl}/public/customers/get?farm_uid=${farmUid}&type=customer`
      );
      if (response.data.status === "NOK") {
        setMessage(response.data.message);
        setShowToast(true);
      } else {
        setCustomers(response.data);
      }
    } catch(error) {
      console.error("Error fetching customer names:", error);
      return [];
    }
  };

  const fetchpackages = async () => {
    setLoading(true); // Set loading to true before fetching data
    setSelectedPackage("Select Package");
    setSelectedPackageId("");

    try {
      const farmUid = sessionStorage.getItem("farm_uid") ?? "";
      const response = await axios.get(
        `${apiUrl}/public/packaging/get?farm_uid=${farmUid}&crop_id=${selectedCropId}`
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

  const saveSale = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/public/sale/record`, {
        customer_id: selectedId,
        price: price,
        date: date,
        crop_id: selectedCropId,
        packaging_id: selectedPackageId,
        quantity: quantity,
        farm_uid: sessionStorage.getItem("farm_uid"),
      });

      if (response.data.status === "OK") {
        setShowToast(true);
        setMessage("Sale recorded successfully.");
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
      getCropNames();
      getCustomerNames();
    }
  }, [openModal]);

  useEffect(() => {
    fetchpackages();
  }, [selectedCropId]);

  return (
    <>
      <NavBar />
      <div className="flex">
        <SidebarNav />
        <div>
          <div className="flex mt-5">
            <div className={styles["section-header"]}>Sales History</div>
            <Button  gradientDuoTone="greenToBlue" outline
              className="ml-auto"
              color="light"
              onClick={() => setOpenModal(true)}
            >
              Add Sale
            </Button>
          </div>

          <SalesList refresh={refresh} />

          <Modal
            id="CreateModal"
            show={openModal}
            onClose={() => setOpenModal(false)}
          >
            <Modal.Header>Record Sale</Modal.Header>
            <Modal.Body>
            {loading ? (
               <div className="text-center">
               <Spinner aria-label="Extra large spinner example" size="xl" />
             </div>
              
            ): (
              <form className="flex max-w-md flex-col gap-4">
              {isError && (
                <Alert color="failure" icon={HiInformationCircle}>
                  <span className="font-medium">Info alert!</span> Change a
                  few things up and try submitting again.
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
                <Dropdown label={selectedCustomer} color="light">
                  {customers.map((customer, index) => (
                    <Dropdown.Item
                      onClick={() => {
                        setSelectedCustomer(customer.name);
                        setSelectedId(customer.id);
                      }}
                      key={index}
                    >
                      {customer.name}
                    </Dropdown.Item>
                  ))}
                </Dropdown>
              </div>

              <div>
                <Dropdown label={selectedPackage} color="light">
                  {packages.map((cropPackage, index) => (
                    <Dropdown.Item
                      onClick={() => {
                        setSelectedPackage(cropPackage.name);
                        setSelectedPackageId(cropPackage.id);
                      }}
                      key={index}
                    >
                      {cropPackage.name}
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
                <div className="mb-2 block">
                  <Label htmlFor="price" value="Price Per Unit" />
                </div>
                <TextInput
                  id="price"
                  type="number"
                  placeholder="How much per unit?"
                  required
                  value={price}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    if (event && event.target) {
                      setPrice(event.target.value);
                    }
                  }}
                />
              </div>

              <legend className="mb-4">Sale Date</legend>

              <Datepicker
              maxDate={new Date()}
                onSelectedDateChanged={(newDate) => setDate(new Date(newDate.getTime() + 24 * 60 * 60 * 1000))}
              />
            </form>
            )}
            </Modal.Body>
            <Modal.Footer>
              <Button gradientDuoTone="greenToBlue" outline onClick={() => saveSale()}>
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
