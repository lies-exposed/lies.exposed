import * as React from "react";

export const TabPanel: React.FC<
  React.PropsWithChildren<{
    index: number;
    value: number;
    className?: string;
  }>
> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index ? children : null}
    </div>
  );
};

export function a11yProps(index: number): any {
  return {
    id: `tab-${index}`,
    "aria-controls": `tabpanel-${index}`,
  };
}
