import { type ExtractEntitiesWithNLPOutput } from "@liexp/shared/lib/io/http/admin/ExtractNLPEntities.js";
import * as React from "react";
import { ActorChip } from "../../actors/ActorChip.js";
import { GroupChip } from "../../groups/GroupChip.js";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "../../mui/index.js";

interface SuggestedKeywordEntityRelationsBoxProps {
  keywords: ExtractEntitiesWithNLPOutput["entities"]["keywords"];
  excludeKeywords?: string[];
  onKeywordClick?: (keyword: string) => void;
}

export const SuggestedKeywordEntityRelationsBox: React.FC<
  SuggestedKeywordEntityRelationsBoxProps
> = ({ keywords, excludeKeywords, onKeywordClick }) => {
  return (
    <Stack>
      <Typography variant="subtitle1">Keywords</Typography>
      <Stack direction={"row"} spacing={2} flexWrap={"wrap"}>
        {keywords
          .filter((k: any) => !excludeKeywords?.includes(k.id))
          .map((entity: any) => {
            return (
              <Chip
                key={entity.id}
                label={entity.tag}
                onClick={(e) => {
                  e.stopPropagation();
                  onKeywordClick?.(entity.id);
                }}
              />
            );
          })}
      </Stack>
    </Stack>
  );
};

interface SuggestedGroupEntityRelationsBoxProps {
  groups: ExtractEntitiesWithNLPOutput["entities"]["groups"];
  excludeGroups?: string[];
  onClick?: (group: string) => void;
}
export const SuggestedGroupEntityRelationsBox: React.FC<
  SuggestedGroupEntityRelationsBoxProps
> = ({ groups, excludeGroups, onClick }) => {
  return (
    <Stack>
      <Typography variant="subtitle1">Groups</Typography>
      <Stack direction={"row"} spacing={2} flexWrap={"wrap"}>
        {groups
          .filter((g: any) => !excludeGroups?.includes(g.id))
          .map((entity: any) => {
            return (
              <GroupChip
                key={entity.id}
                group={entity}
                displayName
                onClick={(g) => {
                  onClick?.(g.id);
                }}
              />
            );
          })}
      </Stack>
    </Stack>
  );
};

interface SuggestedActorEntityRelationsBoxProps {
  actors: ExtractEntitiesWithNLPOutput["entities"]["actors"];
  excludeActors?: string[];
  onClick?: (actor: string) => void;
}
export const SuggestedActorEntityRelationsBox: React.FC<
  SuggestedActorEntityRelationsBoxProps
> = ({ actors, excludeActors, onClick }) => {
  return (
    <Stack>
      <Typography variant="subtitle1">Actors</Typography>
      <Stack direction={"row"} spacing={2} flexWrap={"wrap"}>
        {actors
          .filter((a: any) => !excludeActors?.includes(a.id))
          .map((entity: any) => {
            return (
              <ActorChip
                key={entity.id}
                actor={entity}
                displayFullName
                onClick={(a) => {
                  onClick?.(a.id);
                }}
              />
            );
          })}
      </Stack>
    </Stack>
  );
};

export type SuggestedEntityRelationsBoxProps = Omit<
  SuggestedKeywordEntityRelationsBoxProps,
  "keywords"
> & {
  data: ExtractEntitiesWithNLPOutput;
  excludeActors?: string[];
  excludeGroups?: string[];
  onGroupClick?: (group: string) => void;
  onActorClick?: (actor: string) => void;
  onSentenceClick?: (sentence: string) => void;
};

export const SuggestedEntityRelationsBox: React.FC<
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
    <Stack
      direction={"column"}
      spacing={2}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <Accordion>
        <AccordionSummary>
          <Stack>
            <SuggestedKeywordEntityRelationsBox
              keywords={data.entities.keywords}
              excludeKeywords={excludeKeywords}
              onKeywordClick={onKeywordClick}
            />
            <SuggestedGroupEntityRelationsBox
              groups={data.entities.groups}
              excludeGroups={excludeGroups}
              onClick={onGroupClick}
            />
            <SuggestedActorEntityRelationsBox
              actors={data.entities.actors}
              excludeActors={excludeActors}
              onClick={onActorClick}
            />
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction={"column"} spacing={2}>
            <Typography variant="subtitle1">Key Sentences</Typography>
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
        </AccordionDetails>
      </Accordion>
    </Stack>
  );
};
