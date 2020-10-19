import { ListItem } from "@components/Common/ListItem"
import { FundFrontmatter } from "@models/Events/Fund"
import * as React from "react"

interface FundListItemProps {
  fund: FundFrontmatter
}

export const FundListItem: React.FC<FundListItemProps> = ({ fund }) => {
  return <ListItem>{fund.amount}</ListItem>
}
