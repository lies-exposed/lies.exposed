import {
  Container,
  Grid,
  Link,
  MenuItem,
  MenuList,
  Typography
} from "@material-ui/core";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import * as React from "react";
import { MattermostIcon } from "../icons/MattermostIcon/MattermostIcon";
import { ECOTheme } from "../theme/index";
import DonateButton from "./Common/Button/DonateButton";
import { GithubIcon } from "./Common/Icons";

const useStyles = makeStyles<ECOTheme>((theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      width: "100%",
      paddingTop: "20px",
      paddingBottom: "20px",
      backgroundColor: theme.palette.secondary.main,
    },
    title: {
      color: theme.palette.common.white,
      fontSize: 18,
      fontWeight: theme.typography.fontWeightBold as any,
    },
    link: {
      color: theme.palette.common.white,
      display: "flex",
      alignItems: "center",
    },
    linkText: {
      marginLeft: 10,
    },
    rightColumn: {
      textAlign: "left",
    },
  })
);

export const Footer: React.FC = () => {
  const {
    site: {
      siteMetadata: { title, github, mattermost },
    },
  } = {
    site: {
      siteMetadata: {
        title: "lies.exposed",
        github: { link: "https://github.com/ascariandrea/econnessione" },
        mattermost: { link: "https://community.econnessione.org" },
      },
    },
  };

  const classes = useStyles();

  return (
    <footer className={classes.root}>
      <Container>
        <Grid container>
          <Grid item sm={4}>
            <Typography className={classes.title} variant="h6">
              {title}
            </Typography>
            <DonateButton />
          </Grid>

          <Grid item sm={4}></Grid>
          <Grid className={classes.rightColumn} item sm={4}>
            <Typography
            component="div"
              variant="h6"
              style={{
                textTransform: "uppercase",
                color: "white",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Community
            </Typography>
            <MenuList title="Community" disablePadding={true}>
              <MenuItem disableGutters={true}>
                <Link className={classes.link} href={github.link}>
                  <GithubIcon style={{ color: "white" }} />{" "}
                  <Typography
                    className={classes.linkText}
                    variant="subtitle1"
                    display="inline"
                  >
                    Github
                  </Typography>
                </Link>
              </MenuItem>
              <MenuItem disableGutters={true}>
                <Link className={classes.link} href={mattermost.link}>
                  <MattermostIcon fontSize="small" variant="white" />{" "}
                  <Typography
                    className={classes.linkText}
                    variant="subtitle1"
                    display="inline"
                  >
                    Mattermost
                  </Typography>
                </Link>
              </MenuItem>
            </MenuList>
          </Grid>
        </Grid>
      </Container>
    </footer>
  );
};
