import { type Project } from "@liexp/shared/lib/io/http/index.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { List, type ListItemProps } from "../Common/List.js";
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  Grid,
} from "../mui/index.js";

export interface Project extends Project.Project {
  selected: boolean;
}

interface ProjectListProps {
  projects: Project[];
  onProjectClick: (item: Project) => void;
}

export const ProjectListItem: React.FC<ListItemProps<Project>> = ({
  item,
  onClick,
}) => {
  return (
    <Card
      style={{
        display: "inline-block",
        margin: 5,
        cursor: "pointer",
        width: "100%",
        minHeight: 300,
      }}
      onClick={(e) => onClick?.(item, e)}
    >
      <CardHeader
        title={item.name}
        subheader={`${formatDate(item.startDate)} ${
          item.endDate ? formatDate(item.endDate) : ""
        }`}
      />
      <CardActionArea>
        {pipe(
          O.fromNullable(item.media[0]),
          O.chainNullableK((image) => (
            <CardMedia
              component="img"
              alt={image.description}
              height="140"
              image={image.location}
              title={image.description}
            />
          )),
          O.toNullable,
        )}

        <CardContent>{item.body}</CardContent>
      </CardActionArea>
    </Card>
  );
};

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onProjectClick: onGroupClick,
}) => {
  return (
    <Grid container>
      <List
        data={projects}
        filter={(_) => true}
        onItemClick={onGroupClick}
        getKey={(g) => g.id}
        ListItem={(p) => (
          <Grid size={{ md: 6 }}>
            <ProjectListItem {...p} />
          </Grid>
        )}
      />
    </Grid>
  );
};

export default ProjectList;
