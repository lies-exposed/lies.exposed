import { MarkdownRenderer } from "@components/Common/MarkdownRenderer";
import { Area, Group, Topic } from "@io/http";
import { Block } from "baseui/block";
import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
import { HeadingXLarge } from "baseui/typography";
import * as React from "react";
import Map from "./Map";
import EditButton from "./buttons/EditButton";

export interface AreaPageContentProps extends Area.Area {
  onGroupClick: (g: Group.Group) => void;
  onTopicClick: (t: Topic.TopicFrontmatter) => void;
}

export const AreaPageContent: React.FC<AreaPageContentProps> = ({
  body,
  onGroupClick,
  onTopicClick,
  ...frontmatter
}) => {
  const features = [frontmatter.geometry];

  return (
    <FlexGrid width="100%">
      <FlexGridItem width="100%">
        <Block
          overrides={{ Block: { style: { textAlign: "right", margin: 10 } } }}
        >
          <div style={{ textAlign: "right", padding: 10 }}>
            <EditButton resourceName="areas" resource={frontmatter} />
          </div>
        </Block>
        <HeadingXLarge>{frontmatter.label}</HeadingXLarge>
        <Map
          width={600}
          height={300}
          features={features}
          center={[0, 0]}
          zoom={6}
          onMapClick={() => {}}
          controls={{
            zoom: false,
          }}
        />
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
        <MarkdownRenderer>{body}</MarkdownRenderer>
      </FlexGridItem>
    </FlexGrid>
  );
};
