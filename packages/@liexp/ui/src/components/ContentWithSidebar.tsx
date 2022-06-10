import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import * as React from "react";
import { Box, Grid } from "./mui";

interface ContentWithSidebarProps {
  sidebar: React.ReactElement;
  defaultOpen?: boolean;
}

export const ContentWithSidebar: React.FC<ContentWithSidebarProps> = ({
  sidebar,
  defaultOpen = false,
  children,
}) => {
  const [showSidebar, toggleSidebar] = React.useState(defaultOpen);

  return (
    <Grid
      container
      className="content-with-sidebar"
      alignContent="center"
      style={{
        flexDirection: 'row'
      }}
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
