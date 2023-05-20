import {
  type Actor,
  type Group,
  type Keyword,
} from "@liexp/shared/lib/io/http";
import { type InlineRelations } from "@liexp/shared/lib/slate/utils";
import * as React from "react";
import ActorsBox from "../../../../../containers/ActorsBox";
import { GroupsBox } from "../../../../../containers/GroupsBox";
import { styled } from "../../../../../theme";
import { KeywordsBox } from "../../../../KeywordsBox";
import { Box } from "../../../../mui";

const PREFIX = `inline-relations-box`;

const classes = {
  root: `${PREFIX}-root`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    // position: 'sticky',
    padding: 20,
  },
}));

interface InlineRelationsPluginProps {
  relations: InlineRelations;
  onActorClick: (a: Actor.Actor) => void;
  onGroupClick: (g: Group.Group) => void;
  onKeywordClick: (g: Keyword.Keyword) => void;
}

export const InlineRelationsPlugin: React.FC<InlineRelationsPluginProps> = ({
  relations: { actors, groups, keywords },
  onActorClick,
  onGroupClick,
  onKeywordClick,
}) => {
  return (
    <StyledBox className={classes.root}>
      <ActorsBox
        style={{ display: "flex", flexDirection: "row" }}
        params={{ filter: { ids: actors } }}
        onItemClick={onActorClick}
      />
      <GroupsBox
        params={{ filter: { ids: groups } }}
        onItemClick={onGroupClick}
      />
      <KeywordsBox ids={keywords} onItemClick={onKeywordClick} />
    </StyledBox>
  );
};
