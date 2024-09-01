import { NavBar } from "./NavBar/NavBar";
import { SeedlingsList } from "./SeedlingsList";
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

const apiUrl = import.meta.env.VITE_API_URL;

interface Item {
  id: string;
  name: string;
  [key: string]: unknown;
}

export const Seedlings = () => {
  const [openModal, setOpenModal] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [seedlingDate, setSeedlingDate] = useState(new Date());
  const [transplantDate, setTransplantDate] = useState(new Date());

  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [seeds, setSeeds] = useState<Item[]>([]);
  const [selectedSeed, setSelectedSeed] = useState("Select Seed");
  const [selectedSeedId, setSelectedSeedId] = useState("");
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState<boolean>(false); // Add state for refresh
  const [isError, setIsError] = useState(false);

  const getSeeds = async () => {
    try {
      setLoading(true);
      const farmUid = sessionStorage.getItem("farm_uid") ?? "";
      const seeds = await axios.get(
        `${apiUrl}/public/seeds/get?farm_uid=${farmUid}`
      );
      if (seeds.data.status && seeds.data.status === "NOK") {
        setMessage(seeds.data.message);
        setSeeds([]);
      } else {
        setSeeds(seeds.data);
      }
    } catch (error) {
      console.error("Error fetching seeds names:", error);
      setMessage("Error fetching seeds names.");
      setShowToast(true);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createSeedling = async () => {
    setLoading(true);
    
    try {
      const response = await axios.post(`${apiUrl}/public/seedling/create`, {
        seed_id: selectedSeedId,
        quantity: 1000,
        seedling_date: seedlingDate,
        transplant_date: transplantDate,
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
    } catch (error) {
      setIsError(true);
      setMessage("Error recording sale.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (openModal) {
      setIsError(false);
      getSeeds();
    }
  }, [openModal]);

  return (
    <>
      <NavBar />
      <div className="flex">
        <SidebarNav />
        <div>
          <div className="flex mt-5">
            <div className={styles["section-header"]}>Seedlings</div>
            <Button
              className="ml-auto"
              color="light"
              onClick={() => setOpenModal(true)}
            >
              Create New Seedlings
            </Button>
          </div>

          <SeedlingsList refresh={refresh} />

          <Modal
            id="CreateModal"
            show={openModal}
            onClose={() => setOpenModal(false)}
          >
            <Modal.Header>Create New Seedlings Batch</Modal.Header>
            <Modal.Body>
              <form className="flex max-w-md flex-col gap-4">
                {isError && (
                  <Alert color="failure" icon={HiInformationCircle}>
                    <span className="font-medium">Info alert!</span> Faield to
                    create seedlings.
                  </Alert>
                )}

                <div>
                  <Dropdown label={selectedSeed} color="light">
                    {seeds.map((seed, index) => (
                      <Dropdown.Item
                        onClick={() => {
                          setSelectedSeed(seed.name);
                          setSelectedSeedId(seed.id);
                        }}
                        key={index}
                      >
                        {seed.name}
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
                  <legend className="mb-4">Seedling Date?</legend>

                  <Datepicker
                  maxDate={new Date()}
                    onSelectedDateChanged={(newDate) => setSeedlingDate(new Date(newDate.getTime() + 24 * 60 * 60 * 1000))}
                  />
                </div>

                <div>
                  <legend className="mb-4">Planned Transplant Date?</legend>
                  <Datepicker
                  minDate={new Date()}
                    onSelectedDateChanged={(newDate) => setTransplantDate(new Date(newDate.getTime() + 24 * 60 * 60 * 1000))}
                  />
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={() => createSeedling()}>
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
