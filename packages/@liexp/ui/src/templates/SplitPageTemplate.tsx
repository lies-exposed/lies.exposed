import { fp } from "@liexp/core/lib/fp/index.js";
import {
  type Media,
  type ResourcesNames,
} from "@liexp/shared/lib/io/http/index.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { Avatar } from "../components/Common/Avatar.js";
import EditButton from "../components/Common/Button/EditButton.js";
import { ShareButtons } from "../components/Common/Button/ShareButtons.js";
import { a11yProps, TabPanel } from "../components/Common/TabPanel.js";
import {
  Box,
  Grid2,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMuiMediaQuery,
} from "../components/mui/index.js";
import { styled, useTheme } from "../theme/index.js";

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

const StyledGrid = styled(Grid2)(({ theme }) => ({
  [`&.${classes.root}`]: {
    flexDirection: "row",
    height: "100%",
    width: "100%",
    [theme.breakpoints.down("md")]: {
      flexDirection: "row",
    },
  },

  [`.${classes.left}`]: {
    display: "flex",
    flexDirection: "row",
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
      flexDirection: "column",
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
    maxHeight: "100%",
  },
}));

interface AsideSubject {
  id: string;
  name: string;
  avatar?: Media.Media;
}

const isAsideSubject = (a: unknown): a is AsideSubject => {
  return (
    typeof a === "object" &&
    !!a &&
    "id" in a &&
    a.id !== undefined &&
    "name" in a &&
    a.name !== undefined
  );
};

export interface SplitPageTemplateProps {
  tab: number;
  onTabChange: (t: number) => void;
  aside: React.ReactNode | AsideSubject;
  asideBottom?: React.ReactNode;
  tabs: {
    label: string;
  }[];
  share?: {
    title: string;
    message: string;
  };
  resource: {
    name: ResourcesNames;
    item: any;
  };
  children: React.ReactNode[];
}

export const SplitPageTemplate: React.FC<SplitPageTemplateProps> = ({
  tab,
  onTabChange,
  share,
  aside,
  asideBottom,
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
            <Tab key={t.label} label={t.label} {...a11yProps(i)} />,
          ),
          tabsContent: acc.tabsContent.concat(
            <TabPanel
              className={classes.tabPanel}
              key={t.label}
              index={i}
              value={tab}
            >
              {children[i]}
            </TabPanel>,
          ),
        };
      },
      { tabs: [] as React.ReactNode[], tabsContent: [] as React.ReactNode[] },
    );
  }, [_tabs, tab]);

  const asideNode = React.useMemo((): React.ReactNode => {
    if (isAsideSubject(aside)) {
      return (
        <Stack alignItems={"flex-end"} justifyContent={"start"}>
          {pipe(
            fp.O.fromNullable(aside.avatar?.thumbnail),
            fp.O.fold(
              () => <div key="aside-avatar" />,
              (src) => (
                <Avatar
                  key="aside-avatar"
                  className={classes.avatar}
                  size="xlarge"
                  src={src}
                  fit="cover"
                  style={{ marginBottom: 50 }}
                />
              ),
            ),
          )}
          <Box key="aside-name" className={classes.name}>
            <Typography component="h1" variant="h4">
              {aside.name}
            </Typography>
          </Box>
        </Stack>
      );
    }

    return aside;
  }, [aside]);

  return (
    <StyledGrid className={classes.root} container spacing={2}>
      <Grid2 size={{ lg: 3, md: 4, sm: 12, xs: 12 }} className={classes.left}>
        <Stack
          width={"100%"}
          height={"100%"}
          direction="column"
          alignContent={"end"}
          justifyContent={"start"}
        >
          <Box className={classes.sidebar}>
            {asideNode}
            <Box className={classes.editButtonBox}>
              {share ? (
                <ShareButtons
                  urlPath={`/${resource.name}/${resource.item.id}`}
                  title={share.title}
                  message={share.message}
                  keywords={[]}
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    marginBottom: theme.spacing(2),
                  }}
                />
              ) : null}

              <EditButton
                resourceName={resource.name}
                resource={resource.item}
              />
            </Box>
          </Box>

          <Box style={{ display: "flex", alignSelf: "flex-end" }}>
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
          </Box>

          {asideBottom ?? null}
        </Stack>
      </Grid2>
      <Grid2 size={{ lg: 9, md: 9, sm: 12, xs: 12 }} className={classes.main}>
        {tabsContent}
      </Grid2>
    </StyledGrid>
  );
};
