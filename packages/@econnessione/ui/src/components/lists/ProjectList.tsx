import { Project } from "@econnessione/shared/io/http";
import { formatDate } from "@econnessione/shared/utils/date";
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia,
  Grid,
} from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { List, ListItemProps } from "@components/Common/List";

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
          O.fromNullable(item.images[0]),
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
