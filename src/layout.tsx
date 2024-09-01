import React, { ReactNode } from "react";
import styles from "./layout.module.scss";
import { Analytics } from "@vercel/analytics/react"

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles["layout"]}>
      <Analytics />
      {/* <header></header> */}
      <main>{children}</main>
      <footer></footer>
    </div>
  );
};

export default Layout;
