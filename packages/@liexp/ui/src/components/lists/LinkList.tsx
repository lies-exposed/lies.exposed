import * as React from "react";
import LinkCard, { Link } from "../Cards/LinkCard";
import { Grid } from "../mui";

export interface LinksListProps {
  links: Link[];
  onItemClick: (l: Link) => void;
  column?: 1 | 2 | 3;
}

export const LinksList: React.FC<LinksListProps> = ({
  links,
  onItemClick,
  column = 3,
}) => {
  const md = 12 / column;
  const sm = 12 / column;

  return (
    <Grid
      container
      spacing={2}
      style={{
        maxHeight: "100%",
        display: "flex",
        alignItems: "center",
      }}
    >
      {links.map((l, i) => (
        <Grid
          key={l.id}
          item
          md={md}
          sm={sm}
          xs={6}
          style={{
            display: "flex",
          }}
        >
          <LinkCard link={l} onClick={onItemClick} />
        </Grid>
      ))}
    </Grid>
  );
};
