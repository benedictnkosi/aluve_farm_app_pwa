import { Navbar } from "flowbite-react";
import styles from "../Pages.module.scss";
import React from "react";

export const NavBar = () => {
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = "/";
  };
  return (
    <React.Fragment>
    <div className={styles["mobile-only"]}>
    <Navbar fluid rounded className="place-content-evenly">
      <Navbar.Brand href="/">
        <img
          src="/images/logo.jpeg"
          className="mr-3 h-6 sm:h-9"
          alt="Flowbite React Logo"
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          Aluve Crop
        </span>
      </Navbar.Brand>

      <Navbar.Toggle />
      <Navbar.Collapse>
        <Navbar.Link href="/dashboard" active>
          Home
        </Navbar.Link>
        <Navbar.Link href="/sales">Sales</Navbar.Link>
        <Navbar.Link href="/agentsales">Agent Sales</Navbar.Link>
        <Navbar.Link href="/seedlings">Seedlings</Navbar.Link>
        <Navbar.Link href="/transplant">Transplant</Navbar.Link>
        <Navbar.Link href="/settings">Settings</Navbar.Link>
        <Navbar.Link href="/cash">Cash Management</Navbar.Link>
        <Navbar.Link onClick={handleLogout}>
          logout
        </Navbar.Link>
      </Navbar.Collapse>
    </Navbar>
    </div>
    </React.Fragment>
  );
};