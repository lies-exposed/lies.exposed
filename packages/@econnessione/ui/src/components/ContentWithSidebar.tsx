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
      <Grid item lg={showSidebar ? 3 : false} md={showSidebar ? 3 : false}>
        {showSidebar ? (
          <Box>
            {sidebar}
            <ExpandMoreIcon onClick={() => toggleSidebar(!showSidebar)} />
          </Box>
        ) : (
          <div
            onClick={() => toggleSidebar(!showSidebar)}
            style={{ position: "absolute", backgroundColor: "red" }}
          >
            <ChevronRightIcon />
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
