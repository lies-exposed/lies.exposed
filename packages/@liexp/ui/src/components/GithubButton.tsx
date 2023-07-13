import * as React from "react";
import { githubRepo } from "../state/queries/github";
import { GithubIcon } from "./Common/Icons";
import QueriesRenderer from "./QueriesRenderer";
import { Box, IconButton, Typography } from "./mui";

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
      <QueriesRenderer
        queries={{
          github: githubRepo({ user, repo }),
        }}
        render={({ github }) => {
          return (
            <IconButton
              className={className}
              onClick={() => {
                window.open(`https://github.com/${user}/${repo}`, "_blank");
              }}
              style={{
                color: "white",
              }}
              size="large"
            >
              <GithubIcon style={{ color: "white", marginRight: 10 }} />
              <Typography variant="subtitle1" display="inline">
                {github.stargazers_count}
              </Typography>
            </IconButton>
          );
        }}
      />
    </Box>
  );
};
export default GithubButton;
