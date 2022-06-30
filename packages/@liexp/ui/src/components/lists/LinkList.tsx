import { http } from "@liexp/shared/io";
// import { formatDate } from "@liexp/shared/utils/date";
import * as React from "react";
import LinkCard from "../Cards/LinkCard";
import {
    Grid
} from "../mui";


interface LinksListProps {
  links: http.Link.Link[];
}

export const LinksList: React.FC<LinksListProps> = ({ links }) => {
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
          <LinkCard link={l} />
        </Grid>
      ))}
    </Grid>
  );
};