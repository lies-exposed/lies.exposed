import * as React from "react";
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
  return (
    <Box display="inline">
      <QueriesRenderer
        queries={(Q) => ({
          github: Q.GithubRepoStats.list.useQuery(
            undefined,
            { owner: user, repo },
            false,
          ),
        })}
        render={({ github }) => {
          const starCount = github.data[0]?.stargazers_count ?? 0;
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
                  {starCount}
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
