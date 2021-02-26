import { faGithub, faSlack } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Container, Grid, Link, Typography } from "@material-ui/core";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import * as React from "react";
import { PaypalDonateButton } from "./buttons/PaypalDonateButton";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      width: "100%",
      paddingTop: "20px",
      paddingBottom: "20px",
      backgroundColor: theme.palette.primary.main,
    },
    title: {
      color: theme.palette.common.white,
      fontSize: 18,
      fontWeight: theme.typography.fontWeightBold,
    },
    link: {
      color: theme.palette.common.white,
    },
    rightColumn: {
      textAlign: "right",
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
        title: "ECOnnessione",
        github: { link: "https://github.com/ascariandrea/econnessione" },
        mattermost: { link: "https://mattermost.econnessione.org" },
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
            <PaypalDonateButton />
          </Grid>

          <Grid item sm={4}></Grid>
          <Grid className={classes.rightColumn} item sm={4}>
            <ul style={{ listStyle: "none" }}>
              <li>
                <Link className={classes.link} href={github.link}>
                  <FontAwesomeIcon icon={faGithub} /> Github
                </Link>
              </li>
              <li>
                <Link className={classes.link} href={mattermost.link}>
                  <FontAwesomeIcon icon={faSlack} /> Slack
                </Link>
              </li>
            </ul>
          </Grid>
        </Grid>
      </Container>
    </footer>
  );
};
