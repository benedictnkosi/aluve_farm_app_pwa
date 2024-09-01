import { Table } from "flowbite-react"; // Import the HiInformationCircle icon from the react-icons/hi package
import { Fragment, useEffect, useState } from "react";
import { Spinner } from "flowbite-react";
import styles from "./Pages.module.scss";
import axios from "axios";
import {  formatShortDate } from "./Functions/common";
import React from "react";

const apiUrl = import.meta.env.VITE_API_URL;

interface Report {
  date: string;
  amount: number;
  comment: string;
  running_balance: string;
  // other fields...
}


interface SalesListProps {
  refresh: boolean; // Add refresh prop
}

export const CashManagementList: React.FC<SalesListProps> = ({ refresh }) => {
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const [report, setReport] = useState<Report[]>([]);

  const fetchReport = async () => {
    setLoading(true); // Set loading to true before fetching data

    try {
      const farmUid = sessionStorage.getItem("farm_uid") ?? "";
      const response = await axios.get(
        `${apiUrl}/public/cash/report?farm_uid=${farmUid}`
      );
      if (response.data.status && response.data.status === "NOK") {
        console.error(response.data.message);
        setReport([]);
      } else {
        setReport(response.data); // Pass response.data instead of salesData.data
      }
    } catch(error) {
      console.error("Error fetching sales data", error);
    } finally {
      setLoading(false); // Set loading to false after fetching data
    }
  };

  useEffect(() => {
    fetchReport();
  }, [refresh]);

  
  return (
    <>
      {loading ? (
        <div className="text-center">
          <Spinner aria-label="Extra large spinner example" size="xl" />
        </div>
      ) : (
        <div className={styles["table-width-responsive"]}>
          <Table striped className="mt-5">
            <Table.Head className={styles["sticky-header"]}>
              <Table.HeadCell>Date</Table.HeadCell>
              <Table.HeadCell>Amount</Table.HeadCell>
              <Table.HeadCell>Comment</Table.HeadCell>
              <Table.HeadCell>Balance</Table.HeadCell>
              <Table.HeadCell></Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {report.map((reportRecord, index) => {

                return (
                  <Fragment key={index}>
                    
                    <Table.Row
                      key={index}
                      className="bg-white dark:border-gray-700 dark:bg-gray-800"
                    >
                      <Table.Cell>{formatShortDate(reportRecord.date)}</Table.Cell>
                      <Table.Cell>{reportRecord.comment}</Table.Cell>s
                      <Table.Cell>R{reportRecord.amount}</Table.Cell>
                      <Table.Cell>R{reportRecord.running_balance}</Table.Cell>
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
