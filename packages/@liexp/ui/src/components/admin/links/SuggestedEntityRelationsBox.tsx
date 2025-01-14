import { type ExtractEntitiesWithNLPOutput } from "@liexp/shared/lib/io/http/admin/ExtractNLPEntities.js";
import clsx from "clsx";
import * as React from "react";
import { styled } from "../../../theme/index.js";
import { ActorChip } from "../../actors/ActorChip.js";
import { GroupChip } from "../../groups/GroupChip.js";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
  Input,
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

const SUGGESTED_ENTITY_RELATIONS_CLASS = "SuggestedEntityRelations";
const suggestedEntityRelationsClasses = {
  root: `${SUGGESTED_ENTITY_RELATIONS_CLASS}-root`,
  sentenceText: `${SUGGESTED_ENTITY_RELATIONS_CLASS}-sentenceText`,
  sentenceTextExcluded: `${SUGGESTED_ENTITY_RELATIONS_CLASS}-sentenceTextExcluded`,
};
const SuggestedEntityRelationsStack = styled(Stack)(({ theme }) => ({
  [`& .${suggestedEntityRelationsClasses.root}`]: {
    padding: theme.spacing(2),
  },
  [`& .${suggestedEntityRelationsClasses.sentenceText}`]: {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.secondary.light,
    },
  },
  [`& .${suggestedEntityRelationsClasses.sentenceTextExcluded}`]: {
    color: theme.palette.text.disabled,
    opacity: 0.5,
    "&:hover": {
      backgroundColor: "transparent",
    },
  },
}));

export type SuggestedEntityRelationsBoxProps = Omit<
  SuggestedKeywordEntityRelationsBoxProps,
  "keywords" | "excludeKeywords"
> & {
  data: ExtractEntitiesWithNLPOutput;
  exclude?: ExtractEntitiesWithNLPOutput;
  onGroupClick?: (group: string) => void;
  onActorClick?: (actor: string) => void;
  onSentenceClick?: (sentence: string) => void;
};

export const SuggestedEntityRelationsBox: React.FC<
  SuggestedEntityRelationsBoxProps
> = ({
  data,
  exclude,
  onActorClick,
  onGroupClick,
  onKeywordClick,
  onSentenceClick,
}) => {
  const [importancePercentage, setImportancePercentage] = React.useState(25);

  const { sentences, excludedSentences } = React.useMemo(() => {
    const excludedSentences = exclude?.sentences?.map((s) => s.text) ?? [];
    const sentences = (data.sentences ?? []).map((s) => ({
      text: s.text,
      importance: s.importance,
      excluded: excludedSentences.includes(s.text),
    }));

    const maxImportance = Math.max(
      ...sentences.map((s) => (!s.excluded ? s.importance : 0)),
    );
    const minImportance = Math.min(
      ...sentences.map((s) => (!s.excluded ? s.importance : 0)),
    );

    const importanceLimit =
      (importancePercentage / 100) * (maxImportance - minImportance) +
      minImportance;

    return {
      sentences: sentences.filter((s) => s.importance >= importanceLimit),
      excludedSentences,
    };
  }, [data.sentences, exclude?.sentences, importancePercentage]);

  if (!data.entities) {
    return null;
  }

  return (
    <SuggestedEntityRelationsStack
      direction={"column"}
      spacing={2}
      onClick={(e) => {
        e.stopPropagation();
      }}
      className={suggestedEntityRelationsClasses.root}
    >
      <Accordion>
        <AccordionSummary>
          <Stack>
            <SuggestedKeywordEntityRelationsBox
              keywords={data.entities.keywords}
              excludeKeywords={exclude?.entities.keywords}
              onKeywordClick={onKeywordClick}
            />
            <SuggestedGroupEntityRelationsBox
              groups={data.entities.groups}
              excludeGroups={exclude?.entities.groups}
              onClick={onGroupClick}
            />
            <SuggestedActorEntityRelationsBox
              actors={data.entities.actors}
              excludeActors={exclude?.entities.actors}
              onClick={onActorClick}
            />
            <Typography variant="subtitle1">
              Key Sentences ({excludedSentences.length}/{sentences.length})
            </Typography>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Stack direction={"column"} spacing={2}>
            <Input
              value={importancePercentage}
              type="number"
              onChange={(e) => {
                setImportancePercentage(parseInt(e.target.value, 10));
              }}
            />
            <Stack
              direction={"column"}
              spacing={2}
              style={{
                overflow: "auto",
                maxHeight: 500,
              }}
            >
              {sentences.map((entity, i) => {
                return (
                  <Typography
                    key={i}
                    onClick={() => onSentenceClick?.(entity.text)}
                    className={clsx(
                      entity.excluded
                        ? suggestedEntityRelationsClasses.sentenceTextExcluded
                        : suggestedEntityRelationsClasses.sentenceText,
                    )}
                  >
                    {entity.text}
                  </Typography>
                );
              })}
            </Stack>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </SuggestedEntityRelationsStack>
  );
};
