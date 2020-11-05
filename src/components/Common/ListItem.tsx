import { BlockProps } from "baseui/block"
import { DisplayMedium, DisplayXSmall } from "baseui/typography"
import * as React from "react"

export const ListItem: React.FC<BlockProps> = ({ children, ...props }) => {
  return (
    <li>
      {children}
    </li>
  )
}
