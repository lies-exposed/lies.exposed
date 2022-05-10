import * as io from "@liexp/shared/io/http";
import { Grid, Typography } from "@mui/material";
import * as React from "react";

export interface ProjectImage extends io.ProjectImage.ProjectImage {
  selected: boolean;
}

interface ProjectImageListProps {
  items: ProjectImage[];
  onItemClick: (actor: ProjectImage) => void;
}

export class ProjectImageList extends React.PureComponent<ProjectImageListProps> {
  render(): JSX.Element {
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
