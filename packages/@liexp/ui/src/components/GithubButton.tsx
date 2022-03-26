import { Box, IconButton, Typography } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { githubRepo } from "../state/queries/github";
import { ErrorBox } from "./Common/ErrorBox";
import { LazyFullSizeLoader } from "./Common/FullSizeLoader";
import { GithubIcon } from "./Common/Icons";

interface GithubButtonProps {
  user: string;
  repo: string;
  className?: string;
}
const GithubButton: React.FC<GithubButtonProps> = ({
  user,
  repo,
  className,
}) => {
  return (
    <Box display="inline">
      <WithQueries
        queries={{
          github: githubRepo,
        }}
        params={{
          github: { user, repo },
        }}
        render={QR.fold(LazyFullSizeLoader, ErrorBox, ({ github }) => {
          return (
            <IconButton
              className={className}
              onClick={() => {
                window.open(`https://github.com/${user}/${repo}`, "_blank");
              }}
              style={{
                color: "white",
              }}
            >
              <GithubIcon style={{ color: "white", marginRight: 10 }} />
              <Typography variant="subtitle1" display="inline">
                {(github as any).stargazers_count}
              </Typography>
            </IconButton>
          );
        })}
      />
    </Box>
  );
};
export default GithubButton;
