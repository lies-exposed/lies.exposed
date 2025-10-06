import { DataGrid as BTable } from "@mui/x-data-grid";
import * as React from "react";
// import { htmlTabletToBaseWebTablet } from "./htmlTableToBaseWebTable"

export const Table: React.FC = (_props) => {
  // const { columns, data } = htmlTabletToBaseWebTablet(props.children)
  const { columns, data } = { columns: [], data: [] };
  return <BTable columns={columns} rows={data} />;
};
