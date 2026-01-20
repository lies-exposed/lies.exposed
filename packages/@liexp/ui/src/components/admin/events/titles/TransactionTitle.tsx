import type * as Events from "@liexp/io/lib/http/Events/index.js";
import * as React from "react";

export const TransactionTitle: React.FC<{
  record: Events.Transaction.Transaction;
}> = ({ record }) => {
  return <span>Transaction: {record?.payload?.total}</span>;
};
