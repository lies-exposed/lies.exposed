import { ActorsBox } from "@econnessione/ui/components/ActorsBox";
import { GroupsBox } from "@econnessione/ui/components/GroupsBox";
import { KeywordsBox } from "@econnessione/ui/components/KeywordsBox";
import { AppBar, makeStyles, Typography } from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Slide from "@material-ui/core/Slide";
import Toolbar from "@material-ui/core/Toolbar";
import * as React from "react";

const useStylesInHideScroll = makeStyles((theme) => ({
  filterBox: {
    display: "flex",
    alignItems: "center",
  },
  filterLabel: {
    marginBottom: 0,
    marginRight: theme.spacing(1),
  },
}));

interface HideOnScrollProps {
  actors: string[];
  groups: string[];
  keywords: string[];
}

const HideOnScroll: React.FC<
  HideOnScrollProps & { children: React.ReactElement }
> = (props) => {
  const classes = useStylesInHideScroll();
  const { children, actors, groups, keywords } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const [y, setY] = React.useState(window.scrollY);

  const handleNavigation = React.useCallback(
    (e) => {
      const window = e.currentTarget;
      if (y > window.scrollY) {
        console.log("scrolling up");
      } else if (y < window.scrollY) {
        console.log("scrolling down");
      }
      setY(window.scrollY);
    },
    [y]
  );

  React.useEffect(() => {
    setY(window.scrollY);
    window.addEventListener("scroll", handleNavigation);

    return () => {
      window.removeEventListener("scroll", handleNavigation);
    };
  }, [handleNavigation]);

  return (
    <Box>
      <Slide appear={true} in={y > 100} direction="down">
        <Box
          display="flex"
          width="100%"
          style={{
            background: "white",
            padding: 20,
            maxHeight: 100,
            alignItems: "center",
            justifyItems: "center",
          }}
        >
          <Box className={classes.filterBox}>
            <Typography
              variant="h6"
              display="inline"
              className={classes.filterLabel}
              gutterBottom={false}
            >
              Keywords:
            </Typography>
            <KeywordsBox ids={keywords} />
          </Box>
          <Box className={classes.filterBox}>
            <Typography
              variant="h6"
              display="inline"
              className={classes.filterLabel}
              gutterBottom={false}
            >
              Actors:
            </Typography>
            <ActorsBox ids={actors} onItemClick={() => {}} />
          </Box>
          <Box className={classes.filterBox}>
            <Typography
              variant="h6"
              display="inline"
              className={classes.filterLabel}
              gutterBottom={false}
            >
              Groups:
            </Typography>
            <GroupsBox ids={groups} onItemClick={() => {}} />
          </Box>
        </Box>
      </Slide>
      <Slide appear={true} in={y < 100} direction="down">
        <Box
          width="100%"
          style={{ margin: 0, marginTop: 60, background: "white" }}
        >
          {children}
        </Box>
      </Slide>
    </Box>
  );
};

interface EventsToolbarProps {
  actors: string[];
  groups: string[];
  keywords: string[];
}

const useStylesInAppBar = makeStyles((theme) => ({
  offset: {
    height: 200,
    minHeight: 200,
  },
}));

const EventsToolbar: React.FC<EventsToolbarProps> = ({
  children,
  ...props
}) => {
  const classes = useStylesInAppBar();

  return (
    <Box width="100%">
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        style={{ margin: 0 }}
      >
        <Toolbar disableGutters={true}>
          <HideOnScroll {...(props as any)}>{children}</HideOnScroll>
        </Toolbar>
      </AppBar>
      <div className={classes.offset} />
    </Box>
  );
};
export default EventsToolbar;
