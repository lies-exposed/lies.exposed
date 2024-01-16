import * as React from "react";
import { styled } from "../theme/index.js";
import { MainContent } from "./MainContent.js";
import {
  Grid,
  TreeItem,
  TreeView,
  Icons
} from "./mui/index.js";

const PREFIX = "ContentWithSideNavigation";

const classes = {
  root: `${PREFIX}-root`,
};

const StyledGrid = styled(Grid)({
  [`& .${classes.root}`]: {
    height: 240,
    flexGrow: 1,
    maxWidth: 400,
  },
});

export interface NavigationItem {
  itemId: string;
  title: string;
  subNav: NavigationItem[];
}

interface ContentWithSideNavigationProps {
  items: any[];
}

export const ContentWithSideNavigation: React.FC<
  React.PropsWithChildren<ContentWithSideNavigationProps>
> = ({ items, children }) => {
  return (
    <StyledGrid container direction="column">
      <Grid item>
        <TreeView
          classes={classes}
          defaultCollapseIcon={<Icons.ExpandMore />}
          defaultExpandIcon={<Icons.ChevronRight />}
        >
          {items.map((i) => {
            return (
              <TreeItem key={i.itemId} nodeId={i.itemId}>
                {i.title}
              </TreeItem>
            );
          })}
        </TreeView>
      </Grid>
      <Grid item>
        <MainContent>{children}</MainContent>
      </Grid>
      <Grid item />
      <Grid item />
    </StyledGrid>
  );
};
