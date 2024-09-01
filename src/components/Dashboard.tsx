import { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import styles from "./Pages.module.scss";
import { NavBar } from "./NavBar/NavBar";
import { auth } from "../../firebaseConfig";
import JoinCreateFarm from "./JoinCreateFarm/JoinCreateFarm";
import { useNavigate } from "react-router-dom";
import { SidebarNav } from "./NavBar/SidebarNav";

export const Dashboard = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isBelongsToFarm, setIsBelongsToFarm] = useState<boolean>(false);
  const navigate = useNavigate(); // Use the useNavigate hook
  const checkFarm = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user) {
        if (sessionStorage.getItem("farm_uid")) {
          setIsBelongsToFarm(true);
        } else {
          setIsBelongsToFarm(false);
        }
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Error checking farm:");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(false);
    checkFarm();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <div className="flex">
      <NavBar />
        <SidebarNav/>
        <div className="container mt-4">
          <div className={styles["market-list"]}>
            <div className={styles["container"]}>
              {isBelongsToFarm && <div>Hello, Farm Owner!</div>}
              {!isBelongsToFarm && (
                <JoinCreateFarm setIsBelongsToFarm={setIsBelongsToFarm} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
