import { NavBar } from "./NavBar/NavBar";
import styles from "./Pages.module.scss";
import {
  Alert,
  Button,
  Datepicker,
  Label,
  Modal,
  Spinner,
  TextInput,
  Toast,
} from "flowbite-react";
import {  useState } from "react";
import { HiCheck, HiInformationCircle } from "react-icons/hi";
import axios from "axios";
import { SidebarNav } from "./NavBar/SidebarNav";
import React from "react";
import { CashManagementList } from "./CashManagementList";

const apiUrl = import.meta.env.VITE_API_URL;

export const CashManagement = () => {
  const [openModal, setOpenModal] = useState(false);
  const [amount, setAmount] = useState("");
  const [withdrawDate, setWithdralDate] = useState(new Date());
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState<boolean>(false); // Add state for refresh
  const [isError, setIsError] = useState(false);

  
  const withdrawCash = async () => {
    setLoading(true);
    
    try {
      const response = await axios.post(`${apiUrl}/public/cash/withdraw`, {
        amount: amount,
        comment: comment,
        date: withdrawDate,
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
      setMessage("Error withdrawing cash.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavBar />
      <div className="flex">
        <SidebarNav />
        <div>
          <div className="flex mt-5">
            <div className={styles["section-header"]}>Cash Management</div>
            <Button  outline gradientDuoTone="greenToBlue"
              className="ml-auto"
              color="light"
              onClick={() => setOpenModal(true)}
            >
              Withdraw Cash
            </Button>
          </div>

          <CashManagementList refresh={refresh} />

          <Modal
            id="CreateModal"
            show={openModal}
            onClose={() => setOpenModal(false)}
          >
            <Modal.Header>Withdraw Cash</Modal.Header>
            <Modal.Body>
              <form className="flex max-w-md flex-col gap-4">
                {isError && (
                  <Alert color="failure" icon={HiInformationCircle}>
                    <span className="font-medium">Info alert!</span> Faield to
                    withdraw cash.
                  </Alert>
                )}

                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="amount" value="How much?" />
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
                
                <div>
                  <div className="mb-2 block">
                    <Label htmlFor="comment" value="Comment" />
                  </div>
                  <TextInput
                    id="comment"
                    type="text"
                    placeholder="Comment"
                    required
                    value={comment}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                      if (event && event.target) {
                        setComment(event.target.value);
                      }
                    }}
                  />
                </div>

                <div>
                  <legend className="mb-4">Withdrawal Date?</legend>
                  <Datepicker
                  maxDate={new Date()}
                    onSelectedDateChanged={(newDate) => setWithdralDate(new Date(newDate.getTime() + 24 * 60 * 60 * 1000))}
                  />
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button gradientDuoTone="greenToBlue" outline onClick={() => withdrawCash()}>
                {loading && (
                  <Spinner aria-label="Spinner button example" size="sm" />
                )}
                <span className="pl-3">Save</span>
              </Button>
              <Button outline  gradientDuoTone="greenToBlue" color="gray" onClick={() => setOpenModal(false)}>
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
