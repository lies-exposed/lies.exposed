import { Box } from "@material-ui/core";
import * as React from "react";

export const TabPanel: React.FC<any> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box display="flex" height="100%" width="100%" padding={0}>
          {children}
        </Box>
      )}
    </div>
  );
};

export function a11yProps(index: number): any {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
