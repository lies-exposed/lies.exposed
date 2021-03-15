import { MarkdownRenderer } from "@components/Common/MarkdownRenderer";
import { Area, Group, Topic } from "@io/http";
import { Grid } from "@material-ui/core";
import { calculateArea } from "@utils/openLayers";
import * as React from "react";
import EditButton from "./buttons/EditButton";
import Map from "./Map";

export interface AreaPageContentProps extends Area.Area {
  onGroupClick: (g: Group.Group) => void;
  onTopicClick: (t: Topic.TopicFrontmatter) => void;
}

export const AreaPageContent: React.FC<AreaPageContentProps> = ({
  onGroupClick,
  onTopicClick,
  ...area
}) => {
  const data = [area];
  const totalArea = calculateArea(data);
  const totalAreaInKm = Math.round((totalArea / 1000000) * 100) / 100;

  return (
    <Grid container>
      <Grid item>
        <div style={{ textAlign: "right", margin: 10 }}>
          <div style={{ textAlign: "right", padding: 10 }}>
            <EditButton resourceName="areas" resource={area} />
          </div>
        </div>
        <h1>{area.label}</h1>
        <Map
          width={600}
          height={300}
          data={data}
          center={[9.18951, 45.46427]}
          zoom={12}
          onMapClick={() => {}}
          controls={{
            zoom: false,
          }}
        />
        <span>{totalAreaInKm}</span>
        {/* {pipe(
          frontmatter.groups,
          O.fromPredicate((g) => Array.isArray(g) && g.length > 0),
          O.fold(
            () => null,
            (groups) => (
              <Block>
                <HeadingXSmall>Groups</HeadingXSmall>
                <GroupList
                  groups={groups.map((g) => ({ ...g, selected: false }))}
                  avatarScale="scale1000"
                  onGroupClick={onGroupClick}
                />
              </Block>
            )
          )
        )} */}
        {/* {pipe(
          frontmatter.topics,
          O.fromPredicate((g) => Array.isArray(g) && g.length > 0),
          O.fold(
            () => null,
            (topics) => (
              <Block>
                <HeadingXSmall>Topics</HeadingXSmall>
                <TopicList
                  topics={topics.map((g) => ({ ...g, selected: true }))}
                  onTopicClick={onTopicClick}
                />
              </Block>
            )
          )
        )} */}
        <MarkdownRenderer>{area.body}</MarkdownRenderer>
      </Grid>
    </Grid>
  );
};
