import {
  Button,
  Modal,
  Alert,
  Label,
  TextInput,
  Toast,
  Radio,
  Datepicker,
  Table,
} from "flowbite-react";
import { HiInformationCircle, HiCheck, HiOutlineCash } from "react-icons/hi"; // Import the HiInformationCircle and HiOutlineArrowRight icons from the react-icons/hi package
import { Fragment, useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import styles from "./Pages.module.scss";
import axios from "axios";
import React from "react";

const apiUrl = import.meta.env.VITE_API_URL;

interface Delivery {
  id: string;
  delivery_date: string;
  crop_name: string;
  agent: string;
  packaging: string;
  quantity: number;
  sales: Sales[];

  // other fields...
}

interface Sales {
  id: string;
  sale_date: string;
  price: number;
  quantity: number;
  total_paid: number;
}

interface SalesListProps {
  refresh: boolean; // Add refresh prop
}

export const AgentSalesList: React.FC<SalesListProps> = ({ refresh }) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openSaleModal, setOpenSaleModal] = useState<boolean>(false);
  const [date, setDate] = useState(new Date());
  const [isError, setIsError] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("");
  const [quantity, setQuantity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Cash");
  const [showToast, setShowToast] = useState(false);
  const [message, setMessage] = useState("");
  const [saleId, setSaleId] = useState("");
  const [deliveryId, setDeliveryId] = useState("");
  const [crop, setCrop] = useState("");

  const fetchSales = async () => {
    setLoading(true); // Set loading to true before fetching data

    try {
      const farmUid = localStorage.getItem("farm_uid") ?? "";
      const response = await axios.get(
        `${apiUrl}/public/agentsales/get?farm_uid=${farmUid}`
      );
      if (response.data.status && response.data.status === "NOK") {
        console.error(response.data.message);
        setDeliveries([]);
      } else {
        setDeliveries(response.data); // Pass response.data instead of salesData.data
      }
    } catch {
      setShowToast(true);
      setMessage("Error fetching sales data");
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  useEffect(() => {
    fetchSales();
  }, [refresh]);

  const recordSale = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/public/agentsales/record`, {
        delivery_id: deliveryId,
        date: date,
        price: amount,
        quantity: quantity,
        farm_uid: localStorage.getItem("farm_uid"),
      });

      if (response.data.status === "OK") {
        setShowToast(true);
        setMessage("Sale recorded successfully.");
        setOpenSaleModal(false);
        fetchSales();
      } else {
        setIsError(true);
        setMessage(response.data.message);
      }
    } catch {
      setIsError(true);
      setMessage("Error recording payment.");
    } finally {
      setLoading(false);
    }
  };

  const addPayment = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/public/payment/add`, {
        agent_sale_id: saleId,
        date: new Date(),
        amount: amount,
        paymentMethod: paymentMethod,
        farm_uid: localStorage.getItem("farm_uid"),
      });

      if (response.data.status === "OK") {
        setShowToast(true);
        setMessage("Payment recorded successfully.");
        setOpenModal(false);
        fetchSales();
      } else {
        setIsError(true);
        setMessage(response.data.message);
      }
    } catch {
      setIsError(true);
      setMessage("Error recording payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* add delivery  modal */}
      <Modal
        id="CreateModal"
        show={openModal}
        onClose={() => setOpenModal(false)}
      >
        <Modal.Header>Add Payment</Modal.Header>
        <Modal.Body>
          <form className="flex max-w-md flex-col gap-4">
            {isError && (
              <Alert color="failure" icon={HiInformationCircle}>
                <span className="font-medium">Info alert!</span> {message}
              </Alert>
            )}

            <div>
              <div className="mb-2 block">
                <Label htmlFor="amount" value="amount" />
              </div>
              <TextInput
                id="amount"
                type="number"
                placeholder="How much?"
                required
                value={amount}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  if (event && event.target) {
                    setAmount(event.target.value);
                  }
                }}
              />
            </div>

            <fieldset className="flex max-w-md flex-col gap-4">
              <legend className="mb-4">Choose your favorite country</legend>
              <div className="flex items-center gap-2">
                <Radio
                  onClick={() => {
                    setPaymentMethod("Cash");
                  }}
                  id="cash"
                  name="method"
                  value="cash"
                  defaultChecked
                />
                <Label htmlFor="cash">Cash</Label>
              </div>
              <div className="flex items-center gap-2">
                <Radio
                  id="EFT"
                  name="method"
                  value="EFT"
                  onClick={() => {
                    setPaymentMethod("EFT");
                  }}
                />
                <Label htmlFor="germany">EFT</Label>
              </div>
            </fieldset>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            gradientDuoTone="greenToBlue"
            outline
            onClick={() => addPayment()}
          >
            {loading && (
              <Spinner aria-label="Spinner button example" size="sm" />
            )}
            <span className="pl-3">Save</span>
          </Button>
          <Button
            gradientDuoTone="greenToBlue"
            outline
            color="gray"
            onClick={() => setOpenModal(false)}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {/* modal for recording a sale */}
      <Modal
        id="recordSaleModal"
        show={openSaleModal}
        onClose={() => setOpenSaleModal(false)}
      >
        <Modal.Header>Record Sale - {crop}</Modal.Header>
        <Modal.Body>
          <form className="flex max-w-md flex-col gap-4">
            {isError && (
              <Alert color="failure" icon={HiInformationCircle}>
                <span className="font-medium">Info alert!</span> {message}
              </Alert>
            )}

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
                <Label htmlFor="amount" value="Unit Price" />
              </div>
              <TextInput
                id="amount"
                type="number"
                placeholder="How much per unit?"
                required
                value={amount}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  if (event && event.target) {
                    setAmount(event.target.value);
                  }
                }}
              />
            </div>

            <legend className="mb-4">Delivery Date</legend>

            <Datepicker
              maxDate={new Date()}
              onSelectedDateChanged={(newDate) =>
                setDate(new Date(newDate.getTime() + 24 * 60 * 60 * 1000))
              }
            />
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            gradientDuoTone="greenToBlue"
            outline
            onClick={() => recordSale()}
          >
            {loading && (
              <Spinner aria-label="Spinner button example" size="sm" />
            )}
            <span className="pl-3">Save</span>
          </Button>
          <Button
            gradientDuoTone="greenToBlue"
            outline
            color="gray"
            onClick={() => setOpenSaleModal(false)}
          >
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

      {loading ? (
        <div className="text-center">
          <Spinner aria-label="Extra large spinner example" size="xl" />
        </div>
      ) : (
        <div className={styles["table-width-responsive"]}>
          <Table striped className="mt-5">
            <Table.Head className={styles["sticky-header"]}>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>Quantity</Table.HeadCell>
              <Table.HeadCell>Price</Table.HeadCell>
              <Table.HeadCell>Total</Table.HeadCell>
              <Table.HeadCell>Paid</Table.HeadCell>
              <Table.HeadCell>Payment</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {deliveries.map((delivery, index) => {
                return (
                  <Fragment key={index}>
                    <Table.Row className="bg-gray-200 dark:bg-gray-700">
                      <Table.Cell colSpan={8} className="font-bold">
                        <div className="flex justify-between items-center">
                          <div>
                            {delivery.agent + " - " + delivery.crop_name + " (" + delivery.quantity + " x " +  delivery.packaging + ") - " + delivery.delivery_date}
                          </div>
                          <Button
                            color="light"
                            outline
                            size="xs"
                            onClick={() => {
                              setOpenSaleModal(true);
                              setDeliveryId(delivery.id);
                              setCrop(delivery.crop_name);
                            }}
                          >
                            <span>Add Sale</span>
                          </Button>
                        </div>
                      </Table.Cell>
                    </Table.Row>

                    {delivery.sales.map(
                      (sale, index) =>
                        sale.quantity !== 0 && (
                          <Table.Row
                            key={index}
                            className="bg-white dark:border-gray-700 dark:bg-gray-800"
                          >
                            <Table.Cell>{sale.sale_date}</Table.Cell>
                            <Table.Cell>{sale.quantity}</Table.Cell>
                            <Table.Cell>{sale.price}</Table.Cell>
                            <Table.Cell>
                              R{(sale.quantity * sale.price).toFixed(2)}
                            </Table.Cell>
                            <Table.Cell>
                              R{sale.total_paid.toFixed(2)}
                            </Table.Cell>
                            <Table.Cell>
                              {sale.total_paid >= sale.quantity * sale.price ? (
                                <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                                  <HiCheck className="h-5 w-5" />
                                </div>
                              ) : (
                                <Button
                                  outline
                                  color="light"
                                  onClick={() => {
                                    setOpenModal(true);
                                    setSaleId(sale.id);
                                    setAmount((sale.quantity * sale.price).toString());
                                  }}
                                >
                                  <HiOutlineCash className="h-4 w-4" />
                                </Button>
                              )}
                            </Table.Cell>
                          </Table.Row>
                        )
                    )}
                  </Fragment>
                );
              })}
            </Table.Body>
          </Table>
        </div>
      )}
    </>
  );
};
