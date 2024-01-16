import type * as Events from "@liexp/shared/lib/io/http/Events/index.js";
import * as React from "react";

export const TransactionTitle: React.FC<{
  record: Events.Transaction.Transaction;
}> = ({ record }) => {
  return <span>Transaction: {record?.payload?.total}</span>;
};
