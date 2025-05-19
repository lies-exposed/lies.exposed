import { type Story } from "@liexp/shared/lib/io/http/Story.js";
import * as React from "react";
import { type GetListParams } from "react-admin";
import QueriesRenderer from "../components/QueriesRenderer.js";
import { StoryList } from "../components/stories/StoryList.js";
import { paginationToParams } from "../utils/params.utils.js";

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
}: ActorsBoxProps): React.ReactElement | null => {
  return (
    <QueriesRenderer
      queries={(Q) => ({
        stories: Q.Story.list.useQuery(
          undefined,
          {
            ...params.filter,
            ...paginationToParams(params.pagination),
          },
          false,
        ),
      })}
      render={({ stories: { data: stories } }) => {
        return (
          <StoryList
            {...props}
            style={style}
            itemStyle={{ ...itemStyle }}
            stories={stories}
            onClick={onItemClick}
          />
        );
      }}
    />
  );
};

export default StoriesBox;
