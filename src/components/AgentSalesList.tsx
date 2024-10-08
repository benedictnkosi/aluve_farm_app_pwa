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
  Dropdown,
} from "flowbite-react";
import {
  HiInformationCircle,
  HiCheck,
  HiOutlineCash,
  HiExclamation,
  HiX,
  HiOutlineExclamationCircle,
  HiOutlineChartBar 
} from "react-icons/hi"; // Import the HiInformationCircle and HiOutlineArrowRight icons from the react-icons/hi package
import { Fragment, useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import styles from "./Pages.module.scss";
import axios from "axios";
import React from "react";
import SalesStatCard from "./SalesStatCard";

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
  paid: boolean;
}

interface SalesListProps {
  refresh: boolean; // Add refresh prop
}

interface Item {
  id: string;
  name: string;
  [key: string]: unknown;
}

export const AgentSalesList: React.FC<SalesListProps> = ({ refresh }) => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [openDeleteDeliveryModal, setOpenDeleteDeliveryModal] =
    useState<boolean>(false);

  const [openSaleModal, setOpenSaleModal] = useState<boolean>(false);
  const [date, setDate] = useState(new Date());
  const [isError, setIsError] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("");
  const [quantity, setQuantity] = useState<Number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>("EFT");
  const [showToast, setShowToast] = useState(false);
  const [message, setMessage] = useState("");
  const [saleId, setSaleId] = useState("");
  const [deliveryId, setDeliveryId] = useState("");
  const [crop, setCrop] = useState("");
  const [deliveryQuantity, setDeliveryQuantity] = useState<Number>(0);
  const [selectedCustomer, setSelectedCustomer] = useState("Select Agent");
  const [customers, setCustomers] = useState<Item[]>([]);
  const [selectedId, setSelectedId] = useState(0);
  const [totalSalesAmount, setTotalSalesAmount] = useState<Number>(0);
  const [totalAmountPaid, setTotalAmountPaid] = useState<Number>(0);
  const [percentOwed, setPercentOwed] = useState<number>(0);
  const [selectedDays, setSelectedDays] = useState("30 days");
  const [remainingCabbages, setRemainingCabbages] = useState(0);
  const [remainingSpinach, setRemainingSpinach] = useState(0);
  const [agentsWithStock, setAgentsWithStock] = useState<{
    [key: string]: { [key: string]: number };
  }>({});
  const [openStockOnHandModal, setOpenStockOnHandModal] = useState(false);
  const [openAgentPerformanceModal, setOpenAgentPerformanceModal] = useState(false);
  const [averageSales, setAverageSales] = useState<{
    [key: string]: { [key: string]: number };
  }>({});

  const fetchSales = async () => {
    setLoading(true); // Set loading to true before fetching data
    resetValues();
    try {
      const farmUid = localStorage.getItem("farm_uid") ?? "";
      let response;
      if (selectedId > 0) {
        response = await axios.get(
          `${apiUrl}/public/agentsales/get?farm_uid=${farmUid}&agent_id=${selectedId}&days=${selectedDays.replace(
            " days",
            ""
          )}`
        );
      } else {
        response = await axios.get(
          `${apiUrl}/public/agentsales/get?farm_uid=${farmUid}&days=${selectedDays.replace(
            " days",
            ""
          )}`
        );
      }

      if (response.data.status && response.data.status === "NOK") {
        console.error(response.data.message);
        setDeliveries([]);
      } else {
        setDeliveries(response.data);
        const calculateTotalSalesAmount = (delivery: Delivery): number => {
          let totalAmount = 0;
          delivery.sales.forEach((sale) => {
            totalAmount += sale.quantity * Number(sale.price);
          });
          return totalAmount;
        };

        //calculate total amount paid
        const calculateTotalPaidAmount = (delivery: Delivery): number => {
          let totalAmount = 0;
          delivery.sales.forEach((sale) => {
            totalAmount += sale.total_paid;
          });
          return totalAmount;
        };

        // Calculate total delivered cabbages
        const totalDeliveredCabbages = response.data.reduce(
          (acc: number, delivery: Delivery) =>
            delivery.crop_name === "Cabbage" ? acc + delivery.quantity : acc,
          0
        );

        const totalDeliveredSpinach = response.data.reduce(
          (acc: number, delivery: Delivery) =>
            delivery.crop_name === "Spinach" ? acc + delivery.quantity : acc,
          0
        );

        // Calculate total sold cabbages
        const totalSoldCabbages = response.data.reduce(
          (acc: number, delivery: Delivery) =>
            delivery.crop_name === "Cabbage"
              ? acc +
                delivery.sales.reduce(
                  (saleAcc, sale) => saleAcc + sale.quantity,
                  0
                )
              : acc,
          0
        );

        const totalSoldSpinach = response.data.reduce(
          (acc: number, delivery: Delivery) =>
            delivery.crop_name === "Spinach"
              ? acc +
                delivery.sales.reduce(
                  (saleAcc, sale) => saleAcc + sale.quantity,
                  0
                )
              : acc,
          0
        );

        const agentsWithStock = response.data.reduce(
          (
            acc: { [key: string]: { [crop: string]: number } },
            delivery: Delivery
          ) => {
            const remainingStock =
              delivery.quantity -
              delivery.sales.reduce(
                (saleAcc, sale) => saleAcc + sale.quantity,
                0
              );
            const crop = delivery.crop_name;
            if (remainingStock > 0) {
              if (!acc[delivery.agent]) {
                acc[delivery.agent] = {};
              }
              if (!acc[delivery.agent][crop]) {
                acc[delivery.agent][crop] = 0;
              }
              acc[delivery.agent][crop] += remainingStock;
            }
            return acc;
          },
          {}
        );

        setAgentsWithStock(agentsWithStock);

        const averageSalesPerAgent = response.data.reduce(
          (
            acc: { [key: string]: { [crop: string]: { totalSales: number; count: number } } },
            delivery: Delivery
          ) => {
            const agent = delivery.agent;
            const crop = delivery.crop_name;
            if (!acc[agent]) {
              acc[agent] = {};
            }
            if (!acc[agent][crop]) {
              acc[agent][crop] = { totalSales: 0, count: 0 };
            }
            delivery.sales.forEach((sale) => {
              if(sale.quantity > 0 ){
                acc[agent][crop].totalSales += sale.price;
                acc[agent][crop].count += 1;
              }
              
            });
            return acc;
          },
          {}
        );


        const averageSales = Object.keys(averageSalesPerAgent).reduce(
          (
            acc: { [key: string]: { [crop: string]: number } },
            agent: string
          ) => {
            acc[agent] = {};
            Object.keys(averageSalesPerAgent[agent]).forEach((crop) => {
              acc[agent][crop] =
                averageSalesPerAgent[agent][crop].totalSales /
                averageSalesPerAgent[agent][crop].count;
            });
            return acc;
          },
          {}
        );

        setAverageSales(averageSales);

        console.log("Average Sales Per Agent:", averageSales);

        console.log("Agents with stock on hand:", agentsWithStock);

        console.log("Total Sold Cabbages:", totalSoldCabbages);

        console.log("Total Delivered Cabbages:", totalDeliveredCabbages);

        console.log("Total Sold Spinach:", totalSoldSpinach);

        console.log("Total Delivered Spinach:", totalDeliveredSpinach);

        // Calculate total sales amount for all deliveries
        const totalSalesAmountForAllDeliveries = response.data.reduce(
          (acc: number, delivery: Delivery) =>
            acc + calculateTotalSalesAmount(delivery),
          0
        );

        const totalPaidAmountForAllDeliveries = response.data.reduce(
          (acc: number, delivery: Delivery) =>
            acc + calculateTotalPaidAmount(delivery),
          0
        );

        setRemainingCabbages(totalDeliveredCabbages - totalSoldCabbages);
        setRemainingSpinach(totalDeliveredSpinach - totalSoldSpinach);

        setDeliveries(
          response.data.map((delivery: Delivery) => ({
            ...delivery,
            totalSalesAmount: calculateTotalSalesAmount(delivery),
          }))
        );

        console.log(
          "Total Sales Amount for All Deliveries:",
          totalSalesAmountForAllDeliveries
        );

        setTotalSalesAmount(totalSalesAmountForAllDeliveries);
        setTotalAmountPaid(totalPaidAmountForAllDeliveries);
        const percentOwed =
          (Number(totalPaidAmountForAllDeliveries) /
            Number(totalSalesAmountForAllDeliveries)) *
          100;
        setPercentOwed(percentOwed);
      }
    } catch {
      setShowToast(true);
      setMessage("Error fetching sales data");
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  const getCustomerNames = async () => {
    try {
      const farmUid = localStorage.getItem("farm_uid") ?? "";
      const response = await axios.get(
        `${apiUrl}/public/customers/get?farm_uid=${farmUid}&type=agent`
      );
      if (response.data.status === "NOK") {
        setMessage(response.data.message);
        setShowToast(true);
      } else {
        setCustomers(response.data);
      }
    } catch (error) {
      console.error("Error fetching customer names:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchSales();
  }, [refresh, selectedId, selectedDays]);

  useEffect(() => {
    getCustomerNames();
  }, []);

  const recordSale = async () => {
    resetValues();
    setLoading(true);

    try {
      if (quantity > deliveryQuantity) {
        setIsError(true);
        setMessage("Quantity sold cannot be more than quantity delivered.");
        return;
      }

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
    resetValues();
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

  const markAsPaid = async () => {
    resetValues();
    setLoading(true);
    try {
      if(amount !== 0){
        setIsError(true);
        setMessage("To mark the transaction as paid, the amount should be zero. Use save button to record payment.");
      }
      const response = await axios.post(`${apiUrl}/public/updatesale/paid`, {
        agent_sale_id: saleId,
        farm_uid: localStorage.getItem("farm_uid"),
      });

      if (response.data.status === "OK") {
        setShowToast(true);
        setMessage("Sale updated successfully.");
        setOpenModal(false);
        fetchSales();
      } else {
        setIsError(true);
        setMessage(response.data.message);
      }
    } catch {
      setIsError(true);
      setMessage("Error updating sale.");
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
        entity: "AgentSales",
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

  const deleteDelivery = async () => {
    setOpenDeleteDeliveryModal(false);
    setLoading(true);
    resetValues();

    try {
      const response = await axios.post(`${apiUrl}/public/item/delete`, {
        entity: "MarketDelivery",
        id: Number(deliveryId),
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
      setMessage("Error removing delivery");
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
              <legend className="mb-4">Payment Method</legend>
              <div className="flex items-center gap-2">
                <Radio
                  onClick={() => {
                    setPaymentMethod("Cash");
                  }}
                  id="cash"
                  name="method"
                  value="cash"
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
                  defaultChecked
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
            onClick={() => markAsPaid()}
          >
            {loading && (
              <Spinner aria-label="Spinner button example" size="sm" />
            )}
            <span className="pl-3">Mark Paid</span>
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
                value={quantity.toString()}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  if (event && event.target) {
                    setQuantity(Number(event.target.value));
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

      {/* delete delivery modal */}
      <Modal
        show={openDeleteDeliveryModal}
        size="md"
        onClose={() => setOpenDeleteDeliveryModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this delivery and all sales
              linked?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={() => deleteDelivery()}>
                {"Yes, I'm sure"}
              </Button>
              <Button
                color="gray"
                onClick={() => setOpenDeleteDeliveryModal(false)}
              >
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* stock on hand modal */}
      <Modal
        show={openStockOnHandModal}
        size="md"
        onClose={() => setOpenStockOnHandModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Stock On Hand
            </h3>
            <div>
              <Table>
                <Table.Head>
                  <Table.HeadCell>Agent</Table.HeadCell>
                  <Table.HeadCell>Crop</Table.HeadCell>
                  <Table.HeadCell>On Hand</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                {Object.keys(agentsWithStock).map((agent) => (
                  <Fragment key={agent}>
                    {Object.keys(agentsWithStock[agent]).map((crop: string, index: number) => (
                      <Table.Row key={index}>
                        <Table.Cell>{agent}</Table.Cell>
                        <Table.Cell>{crop}</Table.Cell>
                        <Table.Cell>{agentsWithStock[agent][crop]}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Fragment>
                ))}
                </Table.Body>
              </Table>
              <Button
                className="mt-5"
                gradientDuoTone="greenToBlue"
                outline
                color="gray"
                onClick={() => setOpenStockOnHandModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

{/* Agent performance modal */}
<Modal
        show={openAgentPerformanceModal}
        size="md"
        onClose={() => setOpenAgentPerformanceModal(false)}
        popup
      >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineChartBar  className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
            Agent performance
            </h3>
            <div>
              <Table>
                <Table.Head>
                  <Table.HeadCell>Agent</Table.HeadCell>
                  <Table.HeadCell>Crop</Table.HeadCell>
                  <Table.HeadCell>Avg Price</Table.HeadCell>
                </Table.Head>
                <Table.Body className="divide-y">
                {Object.keys(averageSales).map((agent) => (
                  <Fragment key={agent}>
                    {Object.keys(averageSales[agent]).map((crop: string, index: number) => (
                      <Table.Row key={index}>
                        <Table.Cell>{agent}</Table.Cell>
                        <Table.Cell>{crop}</Table.Cell>
                        <Table.Cell>{averageSales[agent][crop].toFixed(2)}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Fragment>
                ))}
                </Table.Body>
              </Table>
              <Button
                className="mt-5"
                gradientDuoTone="greenToBlue"
                outline
                color="gray"
                onClick={() => setOpenAgentPerformanceModal(false)}
              >
                Close
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
          <div className="flex items-center space-x-3">
            <SalesStatCard
              amount={totalSalesAmount.toFixed(2).toString()}
              description={"Sales"}
            />

            <SalesStatCard
              amount={totalAmountPaid.toFixed(2).toString()}
              description={"Total Paid"}
            />

            <SalesStatCard
              amount={
                isNaN(percentOwed)
                  ? "0%"
                  : percentOwed.toFixed(2).toString() + "%"
              }
              description={"Paid"}
            />
            <SalesStatCard
              amount={remainingCabbages.toString()}
              description={"Cabbages On hand"}
            />
            <SalesStatCard
              amount={remainingSpinach.toString()}
              description={"Spinach On hand"}
            />
          </div>

          <div className="flex items-center space-x-3">
            <Dropdown label={selectedCustomer} color="light">
              {customers.map((customer, index) => (
                <Dropdown.Item
                  onClick={() => {
                    setSelectedCustomer(customer.name);
                    setSelectedId(Number(customer.id));
                  }}
                  key={index}
                >
                  {customer.name}
                </Dropdown.Item>
              ))}
            </Dropdown>

            <Dropdown label={selectedDays} color="light">
              <Dropdown.Item onClick={() => setSelectedDays("30 days")}>
                30 days
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSelectedDays("60 days")}>
                60 days
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSelectedDays("90 days")}>
                90 days
              </Dropdown.Item>
            </Dropdown>
            <Button
              gradientDuoTone="cyanToBlue"
              onClick={() => setOpenStockOnHandModal(true)}
            >
              Stock On Hand
            </Button>

            <Button
              gradientDuoTone="greenToBlue"
              onClick={() => setOpenAgentPerformanceModal(true)}
            >
              Agent Performance
            </Button>

          </div>
          <div className={styles["table-width-responsive"]}>
            <Table striped className="mt-5">
              <Table.Head className={styles["sticky-header"]}>
                <Table.HeadCell>Date</Table.HeadCell>
                <Table.HeadCell>Quantity</Table.HeadCell>
                <Table.HeadCell>Price</Table.HeadCell>
                <Table.HeadCell>Total</Table.HeadCell>
                <Table.HeadCell>Paid</Table.HeadCell>
                <Table.HeadCell>Payment</Table.HeadCell>
                <Table.HeadCell>Delete</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {deliveries.map((delivery, index) => {
                  return (
                    <Fragment key={index}>
                      <Table.Row className="bg-gray-200 dark:bg-gray-700">
                        <Table.Cell colSpan={5} className="font-bold">
                          <div className="flex justify-between items-center">
                            <div>
                              {delivery.agent +
                                " - " +
                                delivery.crop_name +
                                " (" +
                                delivery.quantity +
                                " x " +
                                delivery.packaging +
                                ") - " +
                                delivery.delivery_date}
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell className="font-bold">
                          {delivery.sales.reduce(
                            (total, sale) => total + sale.quantity,
                            0
                          ) !== delivery.quantity && (
                            <Button
                              color="light"
                              outline
                              size="xs"
                              onClick={() => {
                                setOpenSaleModal(true);
                                setDeliveryId(delivery.id);
                                setCrop(delivery.crop_name);
                                setDeliveryQuantity(delivery.quantity);
                              }}
                            >
                              <span>Add Sale</span>
                            </Button>
                          )}
                        </Table.Cell>
                        <Table.Cell className="font-bold">
                          <Button
                            outline
                            gradientDuoTone="pinkToOrange"
                            onClick={() => {
                              setDeliveryId(delivery.id);
                              setOpenDeleteDeliveryModal(true);
                            }}
                          >
                            <HiX className="h-4 w-4 text-red-500" />
                          </Button>
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
                                {sale.total_paid >=
                                  sale.quantity * sale.price || sale.paid ? (
                                  <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
                                    <HiCheck className="h-5 w-5" />
                                  </div>
                                ) : (
                                  <Button
                                    outline
                                    gradientDuoTone="cyanToBlue"
                                    onClick={() => {
                                      setOpenModal(true);
                                      setSaleId(sale.id);
                                      setAmount(
                                        (sale.quantity * sale.price).toString()
                                      );
                                    }}
                                  >
                                    <HiOutlineCash className="h-4 w-4" />
                                  </Button>
                                )}
                              </Table.Cell>
                              <Table.Cell>
                                <Button
                                  outline
                                  color="light"
                                  onClick={() => {
                                    setSaleId(sale.id);
                                    setOpenDeleteModal(true);
                                  }}
                                >
                                  <HiX className="h-4 w-4 text-orange-500" />
                                </Button>
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
        </>
      )}
    </>
  );
};
