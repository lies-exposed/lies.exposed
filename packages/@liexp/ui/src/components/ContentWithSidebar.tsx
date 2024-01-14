import * as React from "react";
import { Box, Grid, Icons } from "./mui/index.js";

interface ContentWithSidebarProps {
  sidebar: React.ReactElement;
  defaultOpen?: boolean;
}

export const ContentWithSidebar: React.FC<
  React.PropsWithChildren<ContentWithSidebarProps>
> = ({ sidebar, defaultOpen = false, children }) => {
  const [showSidebar, toggleSidebar] = React.useState(defaultOpen);

  return (
    <Grid
      container
      className="content-with-sidebar"
      alignContent="center"
      style={{
        flexDirection: "row",
      }}
    >
      <Grid item lg={showSidebar ? 3 : false} md={showSidebar ? 3 : false}>
        {showSidebar ? (
          <Box>
            {sidebar}
            <Icons.ExpandMore
              onClick={() => {
                toggleSidebar(!showSidebar);
              }}
            />
          </Box>
        ) : (
          <div
            onClick={() => {
              toggleSidebar(!showSidebar);
            }}
            style={{ position: "absolute" }}
          >
            <Icons.ChevronRight />
          </div>
        )}
      </Grid>

      <Grid
        item
        lg={showSidebar ? 9 : 12}
        md={showSidebar ? 9 : 12}
        style={{ flexGrow: 1 }}
        alignItems="flex-start"
      >
        {children}
      </Grid>
    </Grid>
  );
};
