import * as io from "@liexp/shared/io/http";
import { GridList, GridListTile } from "@material-ui/core";
import * as React from "react";

export interface ProjectImage extends io.ProjectImage.ProjectImage {
  selected: boolean;
}

interface ProjectImageListProps {
  items: ProjectImage[];
  onItemClick: (actor: ProjectImage) => void;
}

// const useStyles = makeStyles((theme: any) =>
//   createStyles({
//     root: {
//       display: "flex",
//       flexWrap: "wrap",
//       justifyContent: "space-around",
//       overflow: "hidden",
//       backgroundColor: theme.palette.background.paper,
//     },
//     gridList: {
//       width: 500,
//       height: 450,
//     },
//   })
// );

export class ProjectImageList extends React.PureComponent<ProjectImageListProps> {
  render(): JSX.Element {
    const items = [{ id: "", location: "", description: "" }];
    return (
      <div>
        <GridList cellHeight={160} cols={3}>
          {items.map((tile) => (
            <GridListTile key={tile.id} cols={1}>
              <img src={tile.location} alt={tile.description} />
            </GridListTile>
          ))}
        </GridList>
      </div>
    );
  }
}
