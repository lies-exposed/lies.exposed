import * as React from "react";
import { useTheme } from "../../theme/index.js";
import { Breadcrumbs, Link, Typography } from "../mui/index.js";

interface BreadCrumbProps {
  view: {
    view: string;
    [key: string]: any;
  };
  segments: Record<string, string[]>;
}

export const BreadCrumb: React.FC<BreadCrumbProps> = ({ view, segments }) => {
  const paths = React.useMemo(() => segments[view.view] ?? [], [view]);
  const theme = useTheme();
  return (
    <Breadcrumbs aria-label="breadcrumb">
      {
        paths.reduce<{ children: JSX.Element[]; currentPath: string }>(
          (acc, p, i) => {
            const currentSegment = p.startsWith(":")
              ? view[p.replace(":", "")]
              : p;
            const currentPath = acc.currentPath
              .concat("%2F")
              .concat(currentSegment);
            if (i === paths.length - 1) {
              return {
                currentPath,
                children: [
                  ...acc.children,
                  <Typography
                    key={currentPath}
                    color="textPrimary"
                    variant="subtitle1"
                  >
                    {currentSegment}
                  </Typography>,
                ],
              };
            }

            return {
              currentPath,
              children: [
                ...acc.children,
                <Link
                  key={currentPath}
                  underline="hover"
                  color="secondary"
                  variant="subtitle1"
                  href={currentPath.concat("%2F")}
                  style={{
                    textTransform: "uppercase",
                    fontWeight: theme.typography.fontWeightBold,
                  }}
                >
                  {p}
                </Link>,
              ],
            };
          },
          { children: [], currentPath: "index.html?path=" },
        ).children
      }
    </Breadcrumbs>
  );
};
