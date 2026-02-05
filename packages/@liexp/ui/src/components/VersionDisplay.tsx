import * as React from "react";
import {
  useConfiguration,
  type VersionInfo,
} from "../context/ConfigurationContext.js";
import { styled } from "../theme/index.js";
import { Box, Link, Typography } from "./mui/index.js";

const PREFIX = "VersionDisplay";

const classes = {
  root: `${PREFIX}-root`,
  version: `${PREFIX}-version`,
  commit: `${PREFIX}-commit`,
};

const Root = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing(1),
  },
  [`& .${classes.version}`]: {
    fontSize: 12,
    color: "inherit",
    opacity: 0.8,
  },
  [`& .${classes.commit}`]: {
    fontSize: 10,
    color: "inherit",
    opacity: 0.6,
    fontFamily: "monospace",
  },
}));

export interface VersionDisplayProps {
  versionInfo?: VersionInfo;
  showCommit?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

export const VersionDisplay: React.FC<VersionDisplayProps> = ({
  versionInfo,
  showCommit = true,
  style,
  className,
}) => {
  const config = useConfiguration();
  const { version, commitHash, githubUrl } = versionInfo ?? config.version;

  const shortCommit = commitHash.slice(0, 7);
  const commitUrl = `${githubUrl}/commit/${commitHash}`;

  return (
    <Root className={`${classes.root} ${className ?? ""}`} style={style}>
      <Typography className={classes.version} variant="caption">
        v{version}
      </Typography>
      {showCommit && commitHash !== "unknown" ? (
        <Link
          href={commitUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={classes.commit}
        >
          ({shortCommit})
        </Link>
      ) : null}
    </Root>
  );
};
