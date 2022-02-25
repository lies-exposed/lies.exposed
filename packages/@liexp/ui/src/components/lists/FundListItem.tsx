import { Transaction } from "@liexp/shared/io/http";
import * as React from "react";
import { ListItem } from "../Common/ListItem";

interface FundListItemProps {
  fund: Transaction.TransactionFrontmatter;
}

export const FundListItem: React.FC<FundListItemProps> = ({ fund }) => {
  return <ListItem>{fund.amount}</ListItem>;
};
