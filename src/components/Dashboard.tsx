import { useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import styles from "./Pages.module.scss";
import { NavBar } from "./NavBar/NavBar";
import { auth } from "../../firebaseConfig";
import JoinCreateFarm from "./JoinCreateFarm/JoinCreateFarm";
import { DailySales } from "./Graph/DailySales";
import { useNavigate } from "react-router-dom";
import { SidebarNav } from "./NavBar/SidebarNav";
import React from "react";
import  WeeklySeedling  from "./Graph/WeeklySeedling";
import WeeklyTransplant from "./Graph/WeeklyTransplant";

export const Dashboard = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isBelongsToFarm, setIsBelongsToFarm] = useState<boolean>(false);
  const navigate = useNavigate(); // Use the useNavigate hook
  const checkFarm = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (user && sessionStorage.getItem("google_uid")) {
        if (localStorage.getItem("farm_uid")) {
          setIsBelongsToFarm(true);
        } else {
          setIsBelongsToFarm(false);
        }
      } else {
        navigate("/");
      }
    } catch {
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
    <React.Fragment>
      <div className="flex">
      {isBelongsToFarm &&(<NavBar />)}
      {isBelongsToFarm &&(<SidebarNav />)}
        <div className="container mt-4">
          <div className={styles["market-list"]}>
            <div className={styles["container"]}>
              {isBelongsToFarm && <div>
                <DailySales></DailySales>
                    <div className="flex">
                    <WeeklySeedling></WeeklySeedling>
                    <WeeklyTransplant></WeeklyTransplant>
                    </div>
                </div>}
              {!isBelongsToFarm && (
                <JoinCreateFarm setIsBelongsToFarm={setIsBelongsToFarm} />
              )}
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};
