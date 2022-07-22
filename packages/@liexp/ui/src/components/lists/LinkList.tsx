import * as React from "react";
import LinkCard, { Link } from "../Cards/LinkCard";
import {
  Grid
} from "../mui";

export interface LinksListProps {
  links: Link[];
  onItemClick: (l: Link) => void
}

export const LinksList: React.FC<LinksListProps> = ({ links, onItemClick }) => {
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
          md={4}
          sm={6}
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