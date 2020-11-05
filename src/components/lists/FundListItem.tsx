import { ListItem } from "@components/Common/ListItem"
import { TransactionFrontmatter } from "@models/Transaction"
import * as React from "react"

interface FundListItemProps {
  fund: TransactionFrontmatter
}

export const FundListItem: React.FC<FundListItemProps> = ({ fund }) => {
  return <ListItem>{fund.amount}</ListItem>
}
