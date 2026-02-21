import * as React from "react";
import { useConfiguration } from "../context/ConfigurationContext.js";
import { githubRepo } from "../state/queries/github.js";
import { GithubIcon } from "./Common/Icons/index.js";
import QueriesRenderer from "./QueriesRenderer.js";
import { Box, IconButton, Typography } from "./mui/index.js";

interface GithubButtonProps {
  user: string;
  repo: string;
  className?: string;
  showStarCount?: boolean;
}
const GithubButton: React.FC<GithubButtonProps> = ({
  user,
  repo,
  className,
  showStarCount = true,
}) => {
  const conf = useConfiguration();
  return (
    <Box display="inline">
      <QueriesRenderer
        queries={(_) => ({
          github: githubRepo(conf)({ user, repo }),
        })}
        render={({ github }) => {
          return (
            <IconButton
              color="inherit"
              className={className}
              onClick={() => {
                window.open(`https://github.com/${user}/${repo}`, "_blank");
              }}
              style={{
                color: "white",
              }}
              size="medium"
            >
              <GithubIcon
                style={{ color: "white", marginRight: showStarCount ? 10 : 0 }}
              />
              {showStarCount && (
                <Typography variant="subtitle1" display="inline">
                  {github.stargazers_count}
                </Typography>
              )}
            </IconButton>
          );
        }}
      />
    </Box>
  );
};
export default GithubButton;
