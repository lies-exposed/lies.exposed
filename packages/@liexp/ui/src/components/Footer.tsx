import {
  Box,
  Container,
  Grid,
  Link,
  makeStyles,
  MenuItem,
  MenuList,
  Typography,
  useTheme,
} from "@material-ui/core";
import * as React from "react";
import { ECOTheme } from "../theme/index";
import DonateButton from "./Common/Button/DonateButton";
import { GithubIcon, TelegramIcon } from "./Common/Icons";

const useStyles = makeStyles<ECOTheme>((theme) => ({
  root: {
    display: "flex",
    width: "100%",
    paddingTop: "20px",
    paddingBottom: "20px",
    // backgroundColor: theme.palette.secondary.main,
  },
  title: {
    color: theme.palette.common.white,
    fontSize: 18,
    // fontWeight: theme.typography.fontWeightBold?.valueOf(),
  },
  link: {
    color: theme.palette.common.white,
    display: "flex",
    alignItems: "center",
  },
  linkText: {
    marginLeft: 10,
    color: theme.palette.common.white,
  },
  rightColumn: {
    textAlign: "left",
  },
}));

export const Footer: React.FC<{ style?: React.CSSProperties }> = (props) => {
  const theme = useTheme();
  const classes = useStyles();

  const {
    site: {
      siteMetadata: { title, github, telegram },
    },
  } = {
    site: {
      siteMetadata: {
        title: "lies.exposed",
        github: { link: "https://github.com/lies.exposed/lies-exposed" },
        telegram: { link: "https://t.me/lies_exposed" },
      },
    },
  };

  return (
    <footer
      className={classes.root}
      style={{
        width: "100%",
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        background: theme.palette.secondary.main,
        ...props.style,
      }}
    >
      <Container>
        <Grid container>
          <Grid item sm={4}>
            <Typography className={classes.title} variant="h6">
              {title}
            </Typography>
            <Box style={{ display: 'flex', alignItems: 'center', flexDirection: "row" }}>
              <DonateButton  />
              <Typography
                display="inline"
                variant="subtitle2"
                style={{
                  color: "white",
                  fontWeight: 600,
                }}
              >
                Donate
              </Typography>
            </Box>
          </Grid>

          <Grid item sm={4}></Grid>
          <Grid className={classes.rightColumn} item sm={4}>
            <Typography
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
                <Link
                  className={classes.link}
                  href={github.link}
                  target="_blank"
                >
                  <GithubIcon style={{ color: "white" }} />{" "}
                  <Typography
                    className={classes.linkText}
                    variant="subtitle1"
                    display="inline"
                    style={{
                      color: theme.palette.common.white,
                    }}
                  >
                    Github
                  </Typography>
                </Link>
              </MenuItem>
              <MenuItem disableGutters={true}>
                <Link
                  className={classes.link}
                  href={telegram.link}
                  target="_blank"
                >
                  <TelegramIcon size="1x" color={theme.palette.common.white} />{" "}
                  <Typography
                    className={classes.linkText}
                    variant="subtitle1"
                    display="inline"
                    style={{
                      color: theme.palette.common.white,
                    }}
                  >
                    Telegram
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
