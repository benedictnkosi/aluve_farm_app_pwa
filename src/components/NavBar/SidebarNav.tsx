import { Sidebar } from "flowbite-react";
import { BiBuoy } from "react-icons/bi";
import { HiArrowSmRight, HiChartPie, HiUser, HiCog, HiTrendingUp, HiBriefcase, HiClipboardCopy   } from "react-icons/hi";
import styles from "../Pages.module.scss";

export const SidebarNav = () => {

  const copyFarmIdToClipboard = () => {
    const farmUid = sessionStorage.getItem('farm_uid');
    if (farmUid) {
      navigator.clipboard.writeText(farmUid).then(() => {
      }).catch(err => {
        console.error('Failed to copy Farm ID: ', err);
      });
    }
  };

  return (
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
          
          <Sidebar.Item href="#" icon={BiBuoy}>
            Logout
          </Sidebar.Item>
        </Sidebar.ItemGroup>
      </Sidebar.Items>
    </Sidebar>
  );
};