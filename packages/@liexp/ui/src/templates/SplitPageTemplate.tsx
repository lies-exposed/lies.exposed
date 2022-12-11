import { ResourcesNames } from "@liexp/shared/io/http";
import * as React from "react";
import EditButton from "../components/Common/Button/EditButton";
import { a11yProps, TabPanel } from "../components/Common/TabPanel";
import {
  Box,
  Grid,
  Tab,
  Tabs,
  useMediaQuery as useMuiMediaQuery,
} from "../components/mui";
import { styled, useTheme } from "../theme";

const classes = {
  root: "split-page-template",
  left: "split-page-template-left",
  sidebar: "split-page-template-sidebar",
  main: "split-page-template-main",
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`.${classes.root}`]: {
    flexDirection: "row",
    [`&.${theme.breakpoints.down("md")}`]: {
      flexDirection: "row",
    },
  },
  [`.${classes.sidebar}`]: {
    flexDirection: "column",
    [`&.${theme.breakpoints.down("md")}`]: {
      flexDirection: "row",
    },
  },
  [`.${classes.left}`]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    // [`&.${theme.breakpoints.down("md")}`]: {
    //   width: "100%",
    // },
  },
  [`.${classes.main}`]: {
    [`&.${theme.breakpoints.down("md")}`]: {
      width: "100%",
    },
  },
}));

export interface SplitPageTemplateProps {
  tab: number;
  onTabChange: (t: number) => void;
  sidebar: () => React.ReactNode;
  tabs: Array<{
    label: string;
  }>;
  resource: {
    name: ResourcesNames;
    item: any;
  };
  children: React.ReactNode[];
}

export const SplitPageTemplate: React.FC<SplitPageTemplateProps> = ({
  tab,
  onTabChange,
  sidebar,
  tabs: _tabs,
  resource,
  children,
}) => {
  const theme = useTheme();

  const isSM = useMuiMediaQuery(theme.breakpoints.down("md"));
  const sidebarNode = React.useMemo(() => sidebar(), []);
  const { tabs, tabsContent } = React.useMemo(() => {
    return _tabs.reduce(
      (acc, t, i) => {
        return {
          tabs: acc.tabs.concat(
            <Tab key={t.label} label={t.label} {...a11yProps(i)} />
          ),
          tabsContent: acc.tabsContent.concat(
            <TabPanel index={i} value={tab}>
              {children[i]}
            </TabPanel>
          ),
        };
      },
      { tabs: [] as React.ReactNode[], tabsContent: [] as React.ReactNode[] }
    );
  }, [_tabs, tab]);
  return (
    <StyledGrid
      className={classes.root}
      container
      spacing={2}
      style={{ height: "100%" }}
    >
      <Grid item lg={3} md={3} sm={12} xs={12} className={classes.left}>
        <Box className={classes.sidebar}>{sidebarNode}</Box>
        <Tabs
          value={tab}
          onChange={(e, v) => {
            onTabChange(v);
          }}
          orientation={isSM ? "horizontal" : "vertical"}
        >
          {tabs}
        </Tabs>
        <div style={{ textAlign: "right", padding: 10 }}>
          <EditButton
            admin={true}
            resourceName={resource.name}
            resource={resource.item}
          />
        </div>
      </Grid>
      <Grid item lg={7} md={9} sm={12} xs={12} className={classes.main}>
        {tabsContent}
      </Grid>
    </StyledGrid>
  );
};
