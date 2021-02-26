import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import TreeItem from "@material-ui/lab/TreeItem";
import TreeView from "@material-ui/lab/TreeView";
import * as React from "react";
import { MainContent } from "./MainContent";

export interface NavigationItem {
  itemId: string;
  title: string;
  subNav: NavigationItem[];
}

interface ContentWithSideNavigationProps {
  items: any[];
}

const useStyles = makeStyles({
  root: {
    height: 240,
    flexGrow: 1,
    maxWidth: 400,
  },
});

export const ContentWithSideNavigation: React.FC<ContentWithSideNavigationProps> = ({
  items,
  children,
}) => {
  const classes = useStyles();

  return (
    <Grid container direction="column">
      <Grid item>
        <TreeView
          classes={classes}
          defaultCollapseIcon={<ExpandMoreIcon />}
          defaultExpandIcon={<ChevronRightIcon />}
        >
          {items.map((i) => {
            return <TreeItem key={i.itemId} nodeId={i.itemId}>{i.title}</TreeItem>;
          })}
        </TreeView>
      </Grid>
      <Grid item>
        <MainContent>{children}</MainContent>
      </Grid>
      <Grid item />
      <Grid item />
    </Grid>
  );
};
