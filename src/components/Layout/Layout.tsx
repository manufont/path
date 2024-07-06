import React from "react";
import styled from "@emotion/styled";

import { Map } from "components";

// general layout should go here
const Layout = () => {
  return (
    <Root>
      <Map />
    </Root>
  );
};

const Root = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

export default Layout;
