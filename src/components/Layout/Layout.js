import React from "react";

import { Map } from "components";

import styles from "./Layout.module.css";

// general layout should go here
const Layout = () => {
  return (
    <div className={styles.root}>
      <Map />
    </div>
  );
};

export default Layout;
