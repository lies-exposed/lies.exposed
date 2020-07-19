import { BlockProps } from "baseui/block"
import { DisplayMedium } from "baseui/typography"
import * as React from 'react'


export const ListItem: React.FC<BlockProps> = ({children, ...props}) => {
  return <DisplayMedium {...props} as='li'>{children}</DisplayMedium>
}