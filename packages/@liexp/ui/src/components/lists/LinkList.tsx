import * as React from "react";
import LinkCard, { type Link } from "../Cards/LinkCard.js";
import { Grid } from "../mui/index.js";

export interface LinksListProps {
  links: Link[];
  onItemClick: (l: Link) => void;
  column?: 1 | 2 | 3;
  style?: React.CSSProperties;
}

export const LinksList: React.FC<LinksListProps> = ({
  links,
  onItemClick,
  column = 3,
  style = {},
}) => {
  const md = 12 / column;
  const sm = 12 / column;

  return (
    <Grid
      container
      spacing={2}
      display={"flex"}
      style={{
        maxHeight: "100%",
        width: "100%",
        flexDirection: "row",
        ...style,
      }}
    >
      {links.map((l, i) => (
        <Grid key={l.id} size={{ md, sm, xs: 6 }}>
          <LinkCard link={l} onClick={onItemClick} />
        </Grid>
      ))}
    </Grid>
  );
};
