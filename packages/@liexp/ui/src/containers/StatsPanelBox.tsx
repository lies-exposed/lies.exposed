import { type EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import { type StatsType } from "@liexp/shared/lib/io/http/Stats.js";
import {
  type Actor,
  type Group,
  type Keyword,
} from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { KeywordsBoxWrapper } from "../components/KeywordsBox.js";
import QueriesRenderer from "../components/QueriesRenderer.js";
import { ActorChipCount } from "../components/actors/ActorChipCount.js";
import { GroupChipCount } from "../components/groups/GroupChipCount.js";
import { KeywordChipCount } from "../components/keywords/KeywordChipCount.js";
import { Box, Typography } from "../components/mui/index.js";
import { useEndpointQueries } from "../hooks/useEndpointQueriesProvider.js";
import { styled } from "../theme/index.js";
import { ActorsBoxWrapper } from "./ActorsBox.js";
import { GroupsBoxWrapper } from "./GroupsBox.js";

const PREFIX = "EventsPanel";

const classes = {
  root: `${PREFIX}-root`,
  menuButton: `${PREFIX}-menuButton`,
  content: `${PREFIX}-content`,
  relationBox: `${PREFIX}-relation-box`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    height: "100%",
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },

  [`& .${classes.menuButton}`]: {
    marginRight: 36,
  },

  [`& .${classes.content}`]: {
    flexGrow: 1,
    height: "100%",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    flexWrap: "nowrap",
  },
  [`& .${classes.relationBox}`]: {
    width: "100%",
    display: "flex",
    alignItems: "flex-start",
    padding: theme.spacing(2),
    flexWrap: "wrap",
    [`> *`]: {
      marginRight: theme.spacing(1),
    },
  },
}));

export interface EventsQueryParams {
  actors: string[];
  groups: string[];
  groupsMembers: string[];
  keywords: string[];
  locations: string[];
  media: string[];
  tab: number;
  startDate?: string;
  endDate?: string;
  title?: string;
  type?: EventType[];
  _sort: any;
  _order: any;
}

interface StatsPanelProps {
  type: StatsType;
  id: string;
  onActorClick: (e: Actor.Actor) => void;
  onGroupClick: (g: Group.Group) => void;
  onKeywordClick: (g: Keyword.Keyword) => void;
}

export const StatsPanelBox: React.FC<StatsPanelProps> = ({
  type,
  id,
  onActorClick,
  onGroupClick,
  onKeywordClick,
}) => {
  const Queries = useEndpointQueries();
  return (
    <StyledBox
      id={`stats-panel-${type}-${id}`}
      className={classes.root}
      style={{
        height: "100%",
      }}
    >
      <Typography variant="h5">Interactions</Typography>
      <QueriesRenderer
        queries={{
          stats: Queries.Stats.list.useQuery({ filter: { id, type } }),
        }}
        render={({
          stats: {
            data: [stats],
          },
        }) => {
          const actors = Object.entries(stats.actors)
            .sort(([, n1], [, n2]) => n2 - n1)
            .slice(0, 5);

          const groups = Object.entries(stats.groups)
            .sort(([, n1], [, n2]) => n2 - n1)
            .slice(0, 5);

          const keywords = Object.entries(stats.keywords)
            .sort(([, n1], [, n2]) => n2 - n1)
            .slice(0, 5);

          return (
            <Box className={classes.content}>
              <ActorsBoxWrapper
                params={{
                  filter: { ids: actors.map(([id]) => id) },
                }}
              >
                {({ data }) => {
                  return (
                    <Box className={classes.relationBox}>
                      {actors.map(([id, count]) => {
                        const actor = data.find((a) => a.id === id);
                        return actor ? (
                          <ActorChipCount
                            key={id}
                            actor={actor}
                            count={count}
                            onClick={() => {
                              onActorClick(actor);
                            }}
                          />
                        ) : null;
                      })}
                    </Box>
                  );
                }}
              </ActorsBoxWrapper>

              <GroupsBoxWrapper
                params={{
                  filter: {
                    ids: groups.map(([id]) => id),
                  },
                }}
              >
                {({ data }) => {
                  return (
                    <Box className={classes.relationBox}>
                      {groups.map(([id, count]) => {
                        const group = data.find((a) => a.id === id);
                        return group ? (
                          <GroupChipCount
                            key={id}
                            count={count}
                            group={group}
                            onClick={() => {
                              onGroupClick(group);
                            }}
                          />
                        ) : null;
                      })}
                    </Box>
                  );
                }}
              </GroupsBoxWrapper>

              <KeywordsBoxWrapper
                params={{
                  filter: {
                    ids: keywords.map(([id]) => id),
                  },
                }}
              >
                {({ data }) => {
                  return (
                    <Box className={classes.relationBox}>
                      {keywords.map(([id, count]) => {
                        const keyword = data.find((a) => a.id === id);
                        return keyword ? (
                          <KeywordChipCount
                            key={id}
                            count={count}
                            keyword={keyword}
                            onClick={() => {
                              onKeywordClick(keyword);
                            }}
                          />
                        ) : null;
                      })}
                    </Box>
                  );
                }}
              </KeywordsBoxWrapper>
            </Box>
          );
        }}
      />
    </StyledBox>
  );
};
