import { type Story } from "@liexp/shared/lib/io/http/Story";
import * as React from "react";
import { type GetListParams } from "react-admin";
import QueriesRenderer from "../components/QueriesRenderer";
import { StoryList } from "../components/stories/StoryList";
import { useStoriesQuery } from "../state/queries/article.queries";

interface ActorsBoxProps {
  params: GetListParams;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  onItemClick: (item: Story) => void;
}

const StoriesBox = ({
  params,
  style,
  itemStyle,
  onItemClick,
  ...props
}: ActorsBoxProps): JSX.Element | null => {
  return (
    <QueriesRenderer
      queries={{ stories: useStoriesQuery(params, false) }}
      render={({ stories: { data: stories } }) => {
        return (
          <StoryList
            {...props}
            style={style}
            itemStyle={{...itemStyle }}
            stories={stories}
            onClick={onItemClick}
          />
        );
      }}
    />
  );
};

export default StoriesBox;
