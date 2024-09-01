/* eslint-disable react/react-in-jsx-scope */
import { Sidebar } from "flowbite-react";
import { BiBuoy } from "react-icons/bi";
import { HiArrowSmRight, HiChartPie, HiCog, HiTrendingUp} from "react-icons/hi";
import styles from "../Pages.module.scss";
import React from "react";

export const SidebarNav = () => {
  return (
    <React.Fragment>
    <Sidebar className={styles["desktop-only-sideNave"]} aria-label="Sidebar with content separator example">
      <Sidebar.Logo href="#" img="/images/logo.jpeg" imgAlt="Aluve Farm logo">
        Aluve Crop
      </Sidebar.Logo>
      <Sidebar.Items>
        <Sidebar.ItemGroup>
          <Sidebar.Item href="/dashboard" icon={HiChartPie}>
            Dashboard
          </Sidebar.Item>
          <Sidebar.Item href="/sales" icon={HiTrendingUp }>
            Sales
          </Sidebar.Item>
          <Sidebar.Item href="/seedlings" icon={HiArrowSmRight}>
            Seedlings
          </Sidebar.Item>
          <Sidebar.Item href="/transplant" icon={HiArrowSmRight}>
          Transplant
          </Sidebar.Item>
          
        </Sidebar.ItemGroup>
        <Sidebar.ItemGroup>
        
          <Sidebar.Item href="/settings" icon={HiCog}>
            Settings
          </Sidebar.Item>
          <Sidebar.Item href="/cash" icon={HiCog}>
            Cash Management
          </Sidebar.Item>
          
          <Sidebar.Item href="#" icon={BiBuoy}>
            Logout
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
    </React.Fragment>
  );
};