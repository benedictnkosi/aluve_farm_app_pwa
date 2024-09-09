import styles from "../Pages.module.scss";
import { useState } from "react"; // Add this line
import {
  Button,
  Modal,
  TextInput,
  Alert,
  Spinner,
  Toast,
  Label
} from "flowbite-react";
import { auth } from "../../../firebaseConfig";
import { HiCheck } from "react-icons/hi";
import axios from "axios";
import React from "react";

const apiUrl = import.meta.env.VITE_API_URL;

interface Props {
  setIsBelongsToFarm: (value: boolean) => void;
}

const JoinCreateFarm: React.FC<Props> = ({ setIsBelongsToFarm }) => {
  const [openModal, setOpenModal] = useState(false);
  const [openCreateModal, setOpenCreateModal] = useState(false);

  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [farmName, setFarmName] = useState("");
  const [farmUid, setFarmUid] = useState("");

  const joinFarm = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        setIsError(false);
        setLoading(true);

        const response = await axios.post(`${apiUrl}/public/farm/join`, {
          farm_uid: farmUid,
          google_uid: sessionStorage.getItem("google_uid"),
        });

        if (response.data.status === "OK") {
          localStorage.setItem("farm_uid", farmUid);
          setOpenModal(false);
          setShowToast(true);
          setMessage(response.data.message);
          setIsBelongsToFarm(true);
        } else {
          setIsError(true);
          setMessage(response.data.message);
        }
      } catch {
        setIsError(true);
        setMessage("Error joining the farm");
      } finally {
        setLoading(false);
      }
    } else {
      setIsError(true);
      setMessage("Please login to join the farm");
      console.error("Please login to join the farm");
    }
  };

  const createFarm = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        setIsError(false);
        setLoading(true);

        //create farm
        const response = await axios.post(`${apiUrl}/public/farm/create`, {
          name: farmName,
          google_uid: sessionStorage.getItem("google_uid")
        });

        if (response.data.status === "OK") {
          localStorage.setItem("farm_uid", response.data.farm_uid);
          setOpenModal(false);
          setShowToast(true);
          setMessage(response.data.message);
          setIsBelongsToFarm(true);
        } else {
          setIsError(true);
          setMessage(response.data.message);
        }
      } catch {
        setIsError(true);
        setMessage("Error creating the farm");
      } finally {
        setLoading(false);
      }
    } else {
      setIsError(true);
      setMessage("Please login to create the farm");
      console.error("Please login to create the farm");
    }
  };

  return (
    <>
      <div className="container mt-4">
        <div className={styles["market-list"]}>
          <div className={styles["button-container"]}>
            <Button gradientDuoTone="greenToBlue" outline onClick={() => setOpenModal(true)}>Join Farm</Button>
            <Button gradientDuoTone="greenToBlue" outline color="gray" onClick={() => setOpenCreateModal(true)}>
              Create Farm
            </Button>
          </div>
        </div>
      </div>

      <Modal show={openModal} onClose={() => setOpenModal(false)}>
        <Modal.Header>Join Farm</Modal.Header>
        <Modal.Body>
          <div className="space-y-6 p-6">
            {isError && <Alert color="failure">{message}</Alert>}
            <p className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
              Please enter the farm ID to join the farm
            </p>
            <TextInput
              value={farmUid}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                if (event && event.target) {
                  setFarmUid(event.target.value);
                }
              }}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button gradientDuoTone="greenToBlue" outline onClick={() => joinFarm()}>
            {loading && (
              <Spinner aria-label="Spinner button example" size="sm" />
            )}
            <span className="pl-3">Join Now</span>
          </Button>
          <Button gradientDuoTone="greenToBlue" outline color="gray" onClick={() => setOpenModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        id="CreateModal"
        show={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
      >
        <Modal.Header>Create Farm</Modal.Header>
        <Modal.Body>
          <form className="flex max-w-md flex-col gap-4">
            <div>
              <div className="mb-2 block">
                <Label htmlFor="farmName" value="Farm Name" />
              </div>
              <TextInput
                id="farmName"
                type="text"
                placeholder="Aluve Farm"
                required
                value={farmName}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  if (event && event.target) {
                    setFarmName(event.target.value);
                  }
                }}
              />
            </div>

            
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button gradientDuoTone="greenToBlue" outline onClick={() => createFarm()}>
            {loading && (
              <Spinner aria-label="Spinner button example" size="sm" />
            )}
            <span className="pl-3">Create Now</span>
          </Button>
          <Button gradientDuoTone="greenToBlue" outline color="gray" onClick={() => setOpenCreateModal(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {showToast && (
        <Toast>
          <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200">
            <HiCheck className="h-5 w-5" />
          </div>
          <div className="ml-3 text-sm font-normal">
            Successfully joined farm.
          </div>
          <Toast.Toggle />
        </Toast>
      )}
    </>
  );
};

export default JoinCreateFarm;
