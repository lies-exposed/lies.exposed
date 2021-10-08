import { Area, Group, Topic } from "@econnessione/shared/io/http";
import { Grid } from "@material-ui/core";
import Feature from "ol/Feature";
import * as React from "react";
import { geoJSONFormat } from "../utils/map.utils";
import { calculateAreaInSQM } from "../utils/openLayers";
import EditButton from "./Common/Button/EditButton";
import { MarkdownRenderer } from "./Common/MarkdownRenderer";
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
  const features = [area].map(({ geometry, ...datum }) => {
    const geom = geoJSONFormat.readGeometry(geometry);
    const feature = new Feature(geom);
    feature.setProperties(datum);
    return feature;
  });
  const totalArea = calculateAreaInSQM([area]);

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
          id={`area-${area.id}`}
          width={600}
          height={300}
          features={features}
          center={[9.18951, 45.46427]}
          zoom={12}
          onMapClick={() => {}}
          controls={{
            zoom: false,
          }}
        />
        <span>
          {totalArea}m<sup>2</sup>
        </span>
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
