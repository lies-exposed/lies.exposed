import { type ExtractEntitiesWithNLPOutput } from "@liexp/shared/lib/io/http/admin/ExtractNLPEntities.js";
import * as React from "react";
import { ActorChip } from "../../actors/ActorChip.js";
import { GroupChip } from "../../groups/GroupChip.js";
import { Card, CardContent, Chip, Stack, Typography } from "../../mui/index.js";
import {
  Button,
  Loading,
  useDataProvider,
  useRecordContext,
  useUpdate,
} from "../react-admin.js";

interface SuggestedEntityRelationsBoxProps {
  data: ExtractEntitiesWithNLPOutput["data"];
  excludeKeywords?: string[];
  excludeActors?: string[];
  excludeGroups?: string[];
  onKeywordClick?: (keyword: string) => void;
  onGroupClick?: (group: string) => void;
  onActorClick?: (actor: string) => void;
  onSentenceClick?: (sentence: string) => void;
}

const SuggestedEntityRelationsBox: React.FC<
  SuggestedEntityRelationsBoxProps
> = ({
  data,
  excludeKeywords,
  excludeActors,
  excludeGroups,
  onActorClick,
  onGroupClick,
  onKeywordClick,
  onSentenceClick,
}) => {
  return (
    <Stack direction={"column"} spacing={2}>
      <Typography variant="subtitle1">Keywords</Typography>
      <Stack direction={"row"} spacing={2} flexWrap={"wrap"}>
        {data.entities.keywords
          .filter((k: any) => !excludeKeywords?.includes(k.id))
          .map((entity: any) => {
            return (
              <Chip
                key={entity.id}
                label={entity.tag}
                onClick={() => {
                  onKeywordClick?.(entity.id);
                }}
              />
            );
          })}
      </Stack>
      <Typography variant="subtitle1">Actors</Typography>
      <Stack direction={"row"} spacing={2} flexWrap={"wrap"}>
        {data.entities.actors
          .filter((a: any) => !excludeActors?.includes(a.id))
          .map((entity: any) => {
            return (
              <ActorChip
                key={entity.id}
                actor={entity}
                displayFullName
                onClick={(a) => {
                  onActorClick?.(a.id);
                }}
              />
            );
          })}
      </Stack>
      <Typography variant="subtitle1">Groups</Typography>
      <Stack direction={"row"} spacing={2} flexWrap={"wrap"}>
        {data.entities.groups
          .filter((g: any) => !excludeGroups?.includes(g.id))
          .map((entity: any) => {
            return (
              <GroupChip
                key={entity.id}
                group={entity}
                displayName
                onClick={(g) => {
                  onGroupClick?.(g.id);
                }}
              />
            );
          })}
      </Stack>
      <Typography variant="subtitle1">Key Sentences</Typography>
      <Stack direction={"column"} spacing={2}>
        {data.sentences.map((entity: any, i: number) => {
          return (
            <Card key={i} onClick={() => onSentenceClick?.(entity.text)}>
              <CardContent>
                <Typography>{entity.text}</Typography>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Stack>
  );
};

export const LinkSuggestedEntityRelations: React.FC = () => {
  const record = useRecordContext();
  const dataProvider: any = useDataProvider();
  const [loading, setLoading] = React.useState<boolean>(false);
  const [data, setData] = React.useState<any>(null);
  const [update, { isLoading }] = useUpdate();

  const finalLoading = loading || isLoading;

  const doExtractNLPEntities = React.useCallback((): void => {
    void dataProvider
      .post("/admins/nlp/extract-entities", { url: record.url })
      .then((res: any) => {
        setLoading(false);
        setData(res.data);
      });
  }, [record.url]);

  const doAddKeyword = React.useCallback(
    (entity: string) => {
      void update("links", {
        id: record.id,
        data: {
          ...record,
          keywords: (record.keywords ?? []).concat([entity]),
        },
      });
    },
    [update, record, data],
  );

  const doAppendSentenceToDescription = React.useCallback(
    (sentence: string) => {
      void update("links", {
        id: record.id,
        data: {
          ...record,
          description: `${record.description}\n\n${sentence}`,
        },
      });
    },
    [update, record],
  );

  React.useEffect(() => {
    if (!data && !finalLoading) {
      setLoading(true);
      doExtractNLPEntities();
    }
  }, [data, finalLoading]);

  return (
    <div>
      {finalLoading ? <Loading /> : null}
      {!data ? (
        <Button onClick={doExtractNLPEntities} label="Suggest entities" />
      ) : null}
      {data ? (
        <SuggestedEntityRelationsBox
          data={data}
          onKeywordClick={doAddKeyword}
          excludeKeywords={record.keywords ?? []}
          onSentenceClick={doAppendSentenceToDescription}
        />
      ) : null}
    </div>
  );
};
