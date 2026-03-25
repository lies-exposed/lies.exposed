import { type EventType } from "@liexp/io/lib/http/Events/index.js";
import { type FlowGraphOutput } from "@liexp/io/lib/http/graphs/FlowGraph.js";
import { type StatsType } from "@liexp/io/lib/http/Stats.js";
import {
  type Actor,
  type Group,
  type Keyword,
} from "@liexp/io/lib/http/index.js";
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
  flowGraphData?: FlowGraphOutput;
  onActorClick: (e: Actor.Actor) => void;
  onGroupClick: (g: Group.Group) => void;
  onKeywordClick: (g: Keyword.Keyword) => void;
}

function deriveStatsFromFlowGraph(graph: FlowGraphOutput): {
  actors: [string, number][];
  groups: [string, number][];
  keywords: [string, number][];
} {
  const actorCounts = new Map<string, number>();
  const groupCounts = new Map<string, number>();
  const keywordCounts = new Map<string, number>();

  for (const link of graph.actorLinks ?? []) {
    actorCounts.set(link.source, (actorCounts.get(link.source) ?? 0) + 1);
  }

  for (const link of graph.groupLinks ?? []) {
    groupCounts.set(link.source, (groupCounts.get(link.source) ?? 0) + 1);
  }

  for (const link of graph.keywordLinks ?? []) {
    keywordCounts.set(link.source, (keywordCounts.get(link.source) ?? 0) + 1);
  }

  const actorStats = Array.from(actorCounts.entries())
    .sort(([, n1], [, n2]) => n2 - n1)
    .slice(0, 5);

  const groupStats = Array.from(groupCounts.entries())
    .sort(([, n1], [, n2]) => n2 - n1)
    .slice(0, 5);

  const keywordStats = Array.from(keywordCounts.entries())
    .sort(([, n1], [, n2]) => n2 - n1)
    .slice(0, 5);

  return { actors: actorStats, groups: groupStats, keywords: keywordStats };
}

export const StatsPanelBox: React.FC<StatsPanelProps> = ({
  type,
  id,
  flowGraphData,
  onActorClick,
  onGroupClick,
  onKeywordClick,
}) => {
  const Queries = useEndpointQueries();

  const statsFromGraph = React.useMemo(() => {
    if (!flowGraphData) return undefined;
    return deriveStatsFromFlowGraph(flowGraphData);
  }, [flowGraphData]);

  const useFlowGraph = !!flowGraphData && !!statsFromGraph && 
    (statsFromGraph.actors.length > 0 || statsFromGraph.groups.length > 0 || statsFromGraph.keywords.length > 0);

  if (useFlowGraph && statsFromGraph) {
    const { actors, groups, keywords } = statsFromGraph;
    const actorIds = actors.map(([a]) => a);
    const groupIds = groups.map(([g]) => g);
    const keywordIds = keywords.map(([k]) => k);

    return (
      <StyledBox
        id={`stats-panel-${type}-${id}`}
        className={classes.root}
        style={{ height: "100%" }}
      >
        <Typography variant="h5">Interactions</Typography>
        <QueriesRenderer
          queries={(Q) => ({
            actors: Q.Actor.list.useQuery(
              undefined,
              { ids: actorIds as any },
              actorIds.length > 0,
            ),
            groups: Q.Group.list.useQuery(
              undefined,
              { ids: groupIds as any },
              groupIds.length > 0,
            ),
            keywords: Q.Keyword.list.useQuery(
              undefined,
              { ids: keywordIds as any },
              keywordIds.length > 0,
            ),
          })}
          render={({
            actors: { data: actorData },
            groups: { data: groupData },
            keywords: { data: keywordData },
          }) => (
            <Box className={classes.content}>
              <ActorsBoxWrapper
                params={{ ids: actorIds }}
              >
                {({ data }) => (
                  <Box className={classes.relationBox}>
                    {actors.map(([id, count]) => {
                      const actor = (data ?? []).find((a) => a.id === id);
                      return actor ? (
                        <ActorChipCount
                          key={id}
                          actor={actor}
                          count={count}
                          onClick={() => onActorClick(actor)}
                        />
                      ) : null;
                    })}
                  </Box>
                )}
              </ActorsBoxWrapper>

              <GroupsBoxWrapper
                params={{ ids: groupIds }}
              >
                {({ data }) => (
                  <Box className={classes.relationBox}>
                    {groups.map(([id, count]) => {
                      const group = (data ?? []).find((g) => g.id === id);
                      return group ? (
                        <GroupChipCount
                          key={id}
                          count={count}
                          group={group}
                          onClick={() => onGroupClick(group)}
                        />
                      ) : null;
                    })}
                  </Box>
                )}
              </GroupsBoxWrapper>

              <KeywordsBoxWrapper
                params={{ filter: { ids: keywordIds } }}
              >
                {({ data }) => (
                  <Box className={classes.relationBox}>
                    {keywords.map(([id, count]) => {
                      const keyword = (data ?? []).find((k) => k.id === id);
                      return keyword ? (
                        <KeywordChipCount
                          key={id}
                          count={count}
                          keyword={keyword}
                          onClick={() => onKeywordClick(keyword)}
                        />
                      ) : null;
                    })}
                  </Box>
                )}
              </KeywordsBoxWrapper>
            </Box>
          )}
        />
      </StyledBox>
    );
  }

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
          stats: Queries.Stats.list.useQuery(undefined, { id, type }),
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
                  ids: actors.map(([id]) => id),
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
                  ids: groups.map(([id]) => id),
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
