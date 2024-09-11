import {
  Button,
  Modal,
  Table,
  Alert,
  Label,
  TextInput,
  Toast,
  Radio,
} from "flowbite-react";
import { HiInformationCircle, HiCheck,HiOutlineCash, HiExclamation, HiX, HiOutlineExclamationCircle } from "react-icons/hi"; // Import the HiInformationCircle icon from the react-icons/hi package
import { Fragment, useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import styles from "../Pages.module.scss";
import axios from "axios";
import { formatDate } from "../Functions/common";
import React from "react";

const apiUrl = import.meta.env.VITE_API_URL;

interface SaleWithDetails {
  id: string;
  customer_name: string;
  crop_name: string;
  date: string;
  price: number;
  quantity: number;
  payment: string;
  total_payments: string;
  sale_id: string;
  // other fields...
}

interface SalesListProps {
  refresh: boolean; // Add refresh prop
}

export const SalesList: React.FC<SalesListProps> = ({ refresh }) => {
  const [sales, setSales] = useState<SaleWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [message, setMessage] = useState("");
  const [saleId, setSaleId] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);


  const fetchSales = async () => {
    setLoading(true); // Set loading to true before fetching data

    try {
      const farmUid = localStorage.getItem("farm_uid") ?? "";
      const response = await axios.get(
        `${apiUrl}/public/sales/get?farm_uid=${farmUid}`
      );
      if (response.data.status && response.data.status === "NOK") {
        console.error(response.data.message);
        setSales([]);
      } else {
        setSales(response.data); // Pass response.data instead of salesData.data
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

  const addPayment = async () => {
    setLoading(true);

    try {
      const response = await axios.post(`${apiUrl}/public/payment/add`, {
        sale_id: saleId,
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

  const resetValues = (): void => {
    setIsError(false);
    setShowToast(false);
    setMessage("");
  };

  const deleteSale = async () => {
    setOpenDeleteModal(false);
    setLoading(true);
    resetValues();

    try {
      const response = await axios.post(`${apiUrl}/public/item/delete`, {
        entity: "Sales",
        id: Number(saleId),
        farm_uid: localStorage.getItem("farm_uid"),
      });

      setShowToast(true);
      setMessage(response.data.message);
      if (response.data.status === "OK") {
        fetchSales();
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

  const handleAddPaymentClick = (id: string) => {
    setIsError(false);
    setSaleId(id);
    setOpenModal(true);
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
              Are you sure you want to delete this Sale and all payments linked?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={() => deleteSale()}>
                {"Yes, I'm sure"}
              </Button>
              <Button color="gray" onClick={() => setOpenDeleteModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* add payment moday */}
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
              <legend className="mb-4">Payment method</legend>
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

      {loading ? (
        <div className="text-center">
          <Spinner aria-label="Extra large spinner example" size="xl" />
        </div>
      ) : (
        <div className={styles["table-width-responsive"]}>
          <Table striped className="mt-5">
            <Table.Head className={styles["sticky-header"]}>
              <Table.HeadCell>Sales Details</Table.HeadCell>
              <Table.HeadCell>Crop</Table.HeadCell>
              <Table.HeadCell>Customer</Table.HeadCell>
              <Table.HeadCell>Units</Table.HeadCell>
              <Table.HeadCell>Price</Table.HeadCell>
              <Table.HeadCell>Total</Table.HeadCell>
              <Table.HeadCell>Paid</Table.HeadCell>
              <Table.HeadCell>Payment</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {sales.map((sale, index) => {
                const currentDate = formatDate(sale.date);
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
                        <p>{sale.crop_name}</p>
                        <p>{sale.customer_name}</p>
                      </Table.Cell>
                      <Table.Cell>{sale.crop_name}</Table.Cell>
                      <Table.Cell>{sale.customer_name}</Table.Cell>
                      <Table.Cell>{sale.quantity}</Table.Cell>
                      <Table.Cell>R{sale.price}</Table.Cell>
                      <Table.Cell>
                        R{(sale.quantity * sale.price).toFixed(2)}
                      </Table.Cell>
                      <Table.Cell>R{sale.total_payments}</Table.Cell>
                      <Table.Cell>
                        {Number(sale.total_payments) >= (sale.quantity * sale.price) ? (
                          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                            <HiCheck className="h-5 w-5" />
                          </div>
                        ) : (
                          <Button
                            outline
                            gradientMonochrome="failure"
                            onClick={() => {
                              setAmount((sale.quantity * sale.price).toString());
                              handleAddPaymentClick(sale.sale_id);
                            }}
                          >
                            <HiOutlineCash className="h-4 w-4" />
                          </Button>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                              <Button
                                outline
                                pill
                                color="light"
                                onClick={() => {
                                  setSaleId(sale.sale_id);
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
      )}
    </>
  );
};
