import { List, ListItemProps } from "@components/Common/List";
import { Project } from "@io/http";
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  CardMedia
} from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { AvatarScale } from "./ActorList";

export interface Project extends Project.Project {
  selected: boolean;
}

interface ProjectListProps {
  projects: Project[];
  onProjectClick: (item: Project) => void;
  avatarScale: AvatarScale;
}

export const ProjectListItem: React.FC<
  ListItemProps<Project> & { avatarScale: AvatarScale }
> = ({ item, avatarScale, onClick }) => {
  return (
    <Card
      style={{ display: "inline-block", margin: 5, cursor: "pointer" }}
      onClick={() => onClick?.(item)}
    >
      <CardHeader title={item.name} />
      <CardActionArea>
        {pipe(
          O.fromNullable(item.images[0]),
          O.chainNullableK((image) => (
            <CardMedia
              component="img"
              alt="Contemplative Reptile"
              height="140"
              image={image.location}
              title={image.description ?? undefined}
            />
          )),
          O.toNullable
        )}

        <CardContent></CardContent>
      </CardActionArea>
    </Card>
  );
};

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onProjectClick: onGroupClick,
  avatarScale,
}) => {
  return (
    <List
      data={projects}
      filter={(_) => true}
      onItemClick={onGroupClick}
      getKey={(g) => g.id}
      ListItem={(p) => <ProjectListItem avatarScale={avatarScale} {...p} />}
    />
  );
};

export default ProjectList;
