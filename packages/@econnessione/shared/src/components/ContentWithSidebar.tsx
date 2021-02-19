import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
import { ChevronLeft, ChevronRight } from "baseui/icon";
import { Theme } from "baseui/theme";
import * as React from "react";

interface ContentWithSidebarProps {
  sidebar: React.ReactElement;
}

export const ContentWithSidebar: React.FC<ContentWithSidebarProps> = ({
  sidebar,
  children,
}) => {
  const [showSidebar, toggleSidebar] = React.useState(false);

  return (
    <FlexGrid
      className="content-with-sidebar"
      flexGridColumnCount={4}
      height="100%"
      width="100%"
      flexDirection="row"
    >
      {showSidebar ? (
        <FlexGridItem
          height="100%"
          overflow="auto"
          position="relative"
          flexDirection="column"
          flexGridItemCount={1}
        >
          {sidebar}

          <div onClick={() => toggleSidebar(!showSidebar)}>
            <ChevronLeft size={48} />
          </div>
        </FlexGridItem>
      ) : (
        <div
          onClick={() => toggleSidebar(!showSidebar)}
          style={{ position: "absolute" }}
        >
          <ChevronRight size={48} />
        </div>
      )}
      <FlexGridItem
        height="100%"
        overflow="auto"
        overrides={{
          Block: {
            style: ({ $theme }: { $theme: Theme }) => {
              const padding = 30;
              return {
                padding: `${padding}px`,
                width: `calc((300% - ${$theme.sizing.scale800}) / 4 - ${padding * 2}px )`,
              };
            },
          },
        }}
      >
        {children}
      </FlexGridItem>
      <FlexGridItem display="none" />
      <FlexGridItem display="none" />
    </FlexGrid>
  );
};
