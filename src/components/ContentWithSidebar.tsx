import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import {ChevronLeft, ChevronRight} from "baseui/icon"
import { Theme } from "baseui/theme"
import * as React from "react"

interface ContentWithSidebarProps {
  sidebar: React.ReactElement
}

export const ContentWithSidebar: React.FC<ContentWithSidebarProps> = ({
  sidebar,
  children,
}) => {
  const [showSidebar, toggleSidebar] = React.useState(true)

  return (
    <FlexGrid flexGridColumnCount={4} height="100%">
      {showSidebar ? (
        <FlexGridItem
          height="100%"
          overflow="auto"
          position="relative"
          flexDirection="column"
        >
          {sidebar}

          <div onClick={() => toggleSidebar(!showSidebar)}>
            <ChevronLeft size={48} />
          </div>
        </FlexGridItem>
      ) : (
        <div onClick={() => toggleSidebar(!showSidebar)} style={{ position: 'absolute'}}>
          <ChevronRight size={48} />
        </div>
      )}
      <FlexGridItem
        height="100%"
        overflow="auto"
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
