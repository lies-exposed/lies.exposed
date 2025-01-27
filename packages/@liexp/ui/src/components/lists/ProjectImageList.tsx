import type * as io from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { Grid, Typography } from "../mui/index.js";

export interface ProjectImage extends io.ProjectImage.ProjectImage {
  selected: boolean;
}

interface ProjectImageListProps {
  items: ProjectImage[];
  onItemClick: (actor: ProjectImage) => void;
}

export class ProjectImageList extends React.PureComponent<ProjectImageListProps> {
  render(): React.ReactElement {
    const items = [{ id: "", location: "", description: "" }];
    return (
      <div>
        <Grid container>
          {items.map((tile) => (
            <Typography key={tile.id} variant="h5">
              <img src={tile.location} alt={tile.description} />
            </Typography>
          ))}
        </Grid>
      </div>
    );
  }
}
