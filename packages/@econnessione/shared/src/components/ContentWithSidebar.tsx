import { Box, Grid } from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
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
    <Grid
      container
      className="content-with-sidebar"
      direction="row"
      alignContent="center"
    >
      <Grid item lg={showSidebar ? 3 : 1}>
        {showSidebar ? (
          <Box
            onClick={() => toggleSidebar(!showSidebar)}
          >
            {sidebar}
            <ExpandMoreIcon />
          </Box>
        ) : (
          <div
            onClick={() => toggleSidebar(!showSidebar)}
            style={{ position: "absolute" }}
          >
            <ChevronRightIcon />
          </div>
        )}
      </Grid>

      <Grid
        item
        lg={showSidebar ? 9 : 11}
        style={{ flexGrow: 1 }}
        alignItems="flex-start"
      >
        {children}
      </Grid>
    </Grid>
  );
};
