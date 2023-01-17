import { fp } from "@liexp/core/fp";
import { ResourcesNames } from "@liexp/shared/io/http";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { Avatar } from "../components/Common/Avatar";
import EditButton from "../components/Common/Button/EditButton";
import { a11yProps, TabPanel } from "../components/Common/TabPanel";
import {
  Box,
  Grid,
  Tab,
  Tabs,
  Typography,
  useMediaQuery as useMuiMediaQuery
} from "../components/mui";
import { styled, useTheme } from "../theme";

const PREFIX = `split-page-template`;
const classes = {
  root: `${PREFIX}-root`,
  left: `${PREFIX}-left`,
  sidebar: `${PREFIX}-sidebar`,
  avatar: `${PREFIX}-avatar`,
  name: `${PREFIX}-name`,
  editButtonBox: `${PREFIX}-edit-button-box`,
  tabs: `${PREFIX}-tabs`,
  main: `${PREFIX}-main`,
  tabPanel: `${PREFIX}-tab-panel`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`&.${classes.root}`]: {
    flexDirection: "row",
    height: "100%",
    [theme.breakpoints.down("md")]: {
      flexDirection: "row",
    },
  },

  [`.${classes.left}`]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    [theme.breakpoints.down("md")]: {
      alignItems: "flex-start",
    },
  },
  [`.${classes.sidebar}`]: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    [theme.breakpoints.down("md")]: {
      flexDirection: "row",
      alignItems: "center",
    },
  },
  [`.${classes.avatar}`]: {
    width: "100px",
    marginTop: 20,
    marginBottom: 60,
    [theme.breakpoints.down("md")]: {
      marginTop: 0,
      marginBottom: 0,
      marginRight: 20,
    },
  },
  [`.${classes.name}`]: {
    textAlign: "right",
    display: "flex",
    [theme.breakpoints.down("md")]: {
      textAlign: "left",
      marginBottom: 0,
      flexGrow: 1,
    },
  },
  [`.${classes.editButtonBox}`]: {
    display: "flex",
    textAlign: "right",
    padding: 10,
    [theme.breakpoints.down("md")]: {
      padding: 20,
      alignSelf: "center",
    },
  },
  [`.${classes.tabs}`]: {
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
  },

  [`.${classes.main}`]: {
    height: "100%",
    [theme.breakpoints.down("md")]: {
      width: "100%",
    },
  },
  [`.${classes.tabPanel}`]: {
    height: "100%",
  },
}));

export interface SplitPageTemplateProps {
  tab: number;
  onTabChange: (t: number) => void;
  name: string;
  avatar?: string;
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
  name,
  avatar,
  tabs: _tabs,
  resource,
  children,
}) => {
  const theme = useTheme();

  const isSM = useMuiMediaQuery(theme.breakpoints.down("md"));

  const { tabs, tabsContent } = React.useMemo(() => {
    return _tabs.reduce(
      (acc, t, i) => {
        return {
          tabs: acc.tabs.concat(
            <Tab key={t.label} label={t.label} {...a11yProps(i)} />
          ),
          tabsContent: acc.tabsContent.concat(
            <TabPanel
              className={classes.tabPanel}
              key={t.label}
              index={i}
              value={tab}
            >
              {children[i]}
            </TabPanel>
          ),
        };
      },
      { tabs: [] as React.ReactNode[], tabsContent: [] as React.ReactNode[] }
    );
  }, [_tabs, tab]);
  return (
    <StyledGrid className={classes.root} container spacing={2}>
      <Grid item lg={3} md={3} sm={12} xs={12} className={classes.left}>
        <Box width="100%">
          <Box className={classes.sidebar}>
            {pipe(
              fp.O.fromNullable(avatar),
              fp.O.fold(
                () => <div />,
                (src) => (
                  <Avatar
                    className={classes.avatar}
                    size="xlarge"
                    src={src}
                    fit="cover"
                  />
                )
              )
            )}
            <Box className={classes.name}>
              <Typography component="h1" variant="h4">
                {name}
              </Typography>
            </Box>

            <Box className={classes.editButtonBox}>
              <EditButton
                resourceName={resource.name}
                resource={resource.item}
              />
            </Box>
          </Box>
        </Box>

        <Tabs
          className={classes.tabs}
          value={tab}
          onChange={(e, v) => {
            onTabChange(v);
          }}
          orientation={isSM ? "horizontal" : "vertical"}
          variant={isSM ? "fullWidth" : "standard"}
        >
          {tabs}
        </Tabs>
      </Grid>
      <Grid item lg={9} md={9} sm={12} xs={12} className={classes.main}>
        {tabsContent}
      </Grid>
    </StyledGrid>
  );
};
