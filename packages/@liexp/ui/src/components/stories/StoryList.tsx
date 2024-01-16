import { type Story } from "@liexp/shared/lib/io/http/Story.js";
import * as React from "react";
import { Grid } from "../mui/index.js";
import { StoryCard } from "./StoryCard.js";

interface StoryListProps {
  stories: Story[];
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  onClick: (a: Story) => void;
}

export const StoryList: React.FC<StoryListProps> = ({
  stories,
  style,
  itemStyle,
  onClick,
}) => {
  return (
    <Grid container style={style} spacing={2}>
      {stories.map((a) => (
        <Grid key={a.id} item md={4} xs={6}>
          <StoryCard
            key={a.id}
            article={a}
            onClick={onClick}
            style={itemStyle}
          />
        </Grid>
      ))}
    </Grid>
  );
};
