import { FundFrontmatter } from "@models/events/Fund"
import * as React from "react"

interface FundListItemProps {
  fund: FundFrontmatter
}

export const FundListItem: React.FC<FundListItemProps> = ({ fund }) => {
  return <>{fund.amount}</>
}
