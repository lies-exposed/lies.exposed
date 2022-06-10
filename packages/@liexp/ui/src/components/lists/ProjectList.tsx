import { Project } from "@liexp/shared/io/http";
import { formatDate } from "@liexp/shared/utils/date";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { List, ListItemProps } from "../Common/List";
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  Grid,
} from "../mui";

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
      onClick={() => onClick?.(item)}
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
          O.toNullable
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
          <Grid item md={6}>
            <ProjectListItem {...p} />
          </Grid>
        )}
      />
    </Grid>
  );
};

export default ProjectList;
