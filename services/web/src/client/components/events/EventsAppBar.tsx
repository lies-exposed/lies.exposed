import {
  AppBar,
  Grid,
  IconButton,
  makeStyles,
  useTheme,
} from "@material-ui/core";
import Box from "@material-ui/core/Box";
import Slide from "@material-ui/core/Slide";
import ChevronUpIcon from "@material-ui/icons/ArrowUpward";
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
  filterValue: {
    marginRight: theme.spacing(1),
  },
  offset: {
    height: 200,
    minHeight: 200,
  },
}));

interface EventsToolbarProps {
  summary: React.ReactNode;
  expanded: React.ReactNode;
}

const EventsAppBar: React.FC<EventsToolbarProps> = ({ summary, expanded }) => {
  const theme = useTheme();
  const classes = useStylesInHideScroll();

  const [isExpanded, setIsExpanded] = React.useState(false);

  const toggleBox = (
    <Box style={{ display: "flex", padding: 10 }}>
      <IconButton onClick={() => setIsExpanded(!isExpanded)}>
        <ChevronUpIcon />
      </IconButton>
    </Box>
  );

  return (
    <Box>
      <Box width="100%">
        <Slide
          mountOnEnter={true}
          appear={true}
          in={!isExpanded}
          direction="down"
        >
          <AppBar
            position="fixed"
            color="transparent"
            style={{
              background: theme.palette.common.white,
            }}
          >
            <Grid
              container
              style={{
                minHeight: 60,
                marginTop: 60,
                alignItems: "center",
                justifyItems: "center",
                flexDirection: "row",
              }}
            >
              <Grid item xs={11}>
                {summary}
              </Grid>

              <Grid item xs={1}>
                {toggleBox}
              </Grid>
            </Grid>
          </AppBar>
        </Slide>
        {isExpanded ? (
          <Slide
            mountOnEnter={true}
            appear={false}
            in={isExpanded}
            direction="down"
          >
            <Box width="100%" style={{ margin: 0 }}>
              {expanded}
              {toggleBox}
            </Box>
          </Slide>
        ) : null}
      </Box>
    </Box>
  );
};
export default EventsAppBar;
