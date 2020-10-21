import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { Theme } from "baseui/theme"
import * as React from "react"
import { StyleObject } from "styletron-react"

interface MainContentProps {
  style?: StyleObject
}

export const MainContent: React.FC<MainContentProps> = ({ children, style = {} }) => {
  return (
    <FlexGrid flexDirection="column" flexGridColumnCount={4} alignItems="center" width="100%">
      <FlexGridItem />
      <FlexGridItem
        overrides={{
          Block: {
            style: ({ $theme }: { $theme: Theme }) => {
              return {
                ...style,
                width: `calc((300% - ${$theme.sizing.scale800}) / 4)`,
              }
            },
          },
        }}
      >
        {children}
      </FlexGridItem>
      <FlexGridItem display="none" />
      <FlexGridItem display="none" />
    </FlexGrid>
  )
}
