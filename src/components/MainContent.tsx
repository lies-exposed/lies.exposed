import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { Theme } from "baseui/theme"
import * as React from "react"

export const MainContent: React.FC = ({ children }) => {
  return (
    <FlexGrid flexDirection="column" flexGridColumnCount={4} alignItems="center" width="100%">
      <FlexGridItem />
      <FlexGridItem
        overrides={{
          Block: {
            style: ({ $theme }: { $theme: Theme }) => {
              return {
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
