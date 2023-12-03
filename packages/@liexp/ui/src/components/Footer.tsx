import * as React from "react";
import { styled, useTheme } from "../theme";
import DonateButton from "./Common/Button/DonateButton";
import { GithubIcon, InstagramIcon, TelegramIcon } from "./Common/Icons";
import {
  Box,
  Container,
  Grid,
  Link,
  MenuItem,
  MenuList,
  Typography,
} from "./mui";

const PREFIX = "Footer";

const classes = {
  root: `${PREFIX}-root`,
  title: `${PREFIX}-title`,
  link: `${PREFIX}-link`,
  linkText: `${PREFIX}-linkText`,
  rightColumn: `${PREFIX}-rightColumn`,
};

const Root = styled("footer")(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    width: "100%",
    paddingTop: "20px",
    paddingBottom: "20px",
    // backgroundColor: theme.palette.secondary.main,
  },

  [`& .${classes.title}`]: {
    color: theme.palette.common.white,
    fontSize: 18,
    marginBottom: 0,
    // fontWeight: theme.typography.fontWeightBold?.valueOf(),
  },

  [`& .${classes.link}`]: {
    color: theme.palette.common.white,
    display: "flex",
    alignItems: "center",
  },

  [`& .${classes.linkText}`]: {
    marginLeft: 10,
    color: theme.palette.common.white,
  },

  [`& .${classes.rightColumn}`]: {
    textAlign: "left",
  },
}));

export const Footer: React.FC<{
  logoSrc?: string;
  style?: React.CSSProperties;
}> = ({ style, logoSrc }) => {
  const theme = useTheme();

  const {
    site: {
      siteMetadata: { title, github, telegram, instagram, storybook, docs },
    },
  } = {
    site: {
      siteMetadata: {
        title: "lies.exposed",
        github: { link: "https://github.com/lies.exposed/lies-exposed" },
        telegram: { link: "https://t.me/lies_exposed" },
        instagram: { link: "https://www.instagram.com/liexp.official/" },
        storybook: { link: "/storybook" },
        docs: { label: "Docs", link: "/docs" },
      },
    },
  };

  return (
    <Root
      className={classes.root}
      style={{
        width: "100%",
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        background: theme.palette.secondary.main,
        ...style,
      }}
    >
      <Container>
        <Grid container>
          <Grid item sm={4} md={4}>
            <Box
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {logoSrc ? (
                <img style={{ height: 64, padding: 10 }} src={logoSrc} />
              ) : null}
              <Typography className={classes.title} variant="h6">
                {title}
              </Typography>
            </Box>

            <Box
              style={{
                display: "flex",
                alignItems: "center",
                flexDirection: "row",
              }}
            >
              <DonateButton />
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

          <Grid item md={4} sm={0} />
          <Grid className={classes.rightColumn} item sm={4} md={2}>
            <Typography
              variant="h6"
              style={{
                textTransform: "uppercase",
                color: "white",
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Developers
            </Typography>
            <MenuList title="Developers" disablePadding={true}>
              <MenuItem disableGutters={true}>
                <Link
                  className={classes.link}
                  href={storybook.link}
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
                    Storybook
                  </Typography>
                </Link>
              </MenuItem>
            </MenuList>
          </Grid>
          <Grid className={classes.rightColumn} item sm={4} md={2}>
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
              <MenuItem disableGutters={true}>
                <Link
                  className={classes.link}
                  href={instagram.link}
                  target="_blank"
                >
                  <InstagramIcon size="1x" color={theme.palette.common.white} />{" "}
                  <Typography
                    className={classes.linkText}
                    variant="subtitle1"
                    display="inline"
                    style={{
                      color: theme.palette.common.white,
                    }}
                  >
                    Instagram
                  </Typography>
                </Link>
              </MenuItem>
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
                <Link className={classes.link} href={docs.link} target="_blank">
                  <TelegramIcon size="1x" color={theme.palette.common.white} />{" "}
                  <Typography
                    className={classes.linkText}
                    variant="subtitle1"
                    display="inline"
                    style={{
                      color: theme.palette.common.white,
                    }}
                  >
                    {docs.label}
                  </Typography>
                </Link>
              </MenuItem>
            </MenuList>
          </Grid>
        </Grid>
      </Container>
    </Root>
  );
};
