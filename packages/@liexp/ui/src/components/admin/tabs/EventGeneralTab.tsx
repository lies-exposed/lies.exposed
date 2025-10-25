import { getTitle } from "@liexp/shared/lib/helpers/event/getTitle.helper.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type Event } from "@liexp/shared/lib/io/http/Events/index.js";
import { OpenAIEmbeddingQueueType } from "@liexp/shared/lib/io/http/Queue/index.js";
import { type ExtractEntitiesWithNLPOutput } from "@liexp/shared/lib/io/http/admin/ExtractNLPEntities.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import * as React from "react";
import {
  BooleanInput,
  Button,
  DateField,
  DateInput,
  Loading,
  useRecordContext,
  useUpdate,
} from "react-admin";
import { useNLPExtraction } from "../../../hooks/useNLPExtraction.js";
import { Box, Grid, Stack } from "../../mui/index.js";
import BlockNoteInput from "../BlockNoteInput.js";
import { EventTypeInput } from "../common/inputs/EventTypeInput.js";
import ReferenceArrayKeywordInput from "../keywords/ReferenceArrayKeywordInput.js";
import { SuggestedKeywordEntityRelationsBox } from "../links/SuggestedEntityRelationsBox.js";
import { OpenAIEmbeddingJobButton } from "../media/OpenAIJobButton.js";

export interface EventGeneralTabChildrenHandlers {
  onKeywordClick: (keyword: string) => void;
  onActorClick: (actor: string) => void;
  onGroupClick: (group: string) => void;
}

export interface EventGeneralTabProps {
  children: (
    props: ExtractEntitiesWithNLPOutput | null,
    handlers: EventGeneralTabChildrenHandlers,
  ) => React.ReactNode;
}

const getOpenAIPromptText = (event: Event) => {
  const title = getTitle(event, {
    actors: [],
    groups: [],
    keywords: [],
    areas: [],
    media: [],
    links: [],
    groupsMembers: [],
  });
  const excerpt = getTextContents(event.excerpt);
  return `${title}\n\n${excerpt}`;
};

export const EventGeneralTab: React.FC<EventGeneralTabProps> = ({
  children,
}) => {
  const record = useRecordContext();
  const [update, { isPending: isUpdateLoading }] = useUpdate();

  const nlpInput = React.useMemo(
    () =>
      record?.id
        ? { resource: "events" as const, uuid: record.id as UUID }
        : null,
    [record?.id],
  );

  const {
    data: suggestions,
    loading: isLoading,
    triggerExtraction,
  } = useNLPExtraction({
    input: nlpInput,
    autoFetch: true,
  });

  const doAddKeyword = React.useCallback(
    (entity: string) => {
      if (record) {
        void update("events", {
          id: record.id,
          data: {
            ...record,
            keywords: (record.keywords ?? []).concat([entity]),
          },
        });
      }
    },
    [update, record],
  );

  const doAddActors = React.useCallback(
    (actodId: string) => {
      if (record) {
        void update("events", {
          id: record.id,
          data: {
            ...record,
            payload: {
              ...record.payload,
              actors: (record.actors ?? []).concat([actodId]),
            },
          },
        });
      }
    },
    [update, record],
  );

  if (isLoading || isUpdateLoading) {
    return <Loading />;
  }

  return (
    <Grid
      container
      justifyContent={"space-between"}
      width="100%"
      size={12}
      spacing={2}
    >
      <Grid size={{ sm: 6, md: 3, lg: 3, xl: 3 }}>
        <Stack
          direction="row"
          alignItems={"center"}
          justifyContent={"start"}
          spacing={2}
        >
          <EventTypeInput source="type" />
          <BooleanInput size="small" source="draft" />
        </Stack>
      </Grid>
      <Grid size={"grow"}>
        <DateInput source="date" />
      </Grid>
      <Grid size={{ md: 6, lg: 6 }}>
        <ReferenceArrayKeywordInput
          source="keywords"
          defaultValue={[]}
          showAdd
        />
        <SuggestedKeywordEntityRelationsBox
          keywords={suggestions?.entities.keywords ?? []}
          onKeywordClick={doAddKeyword}
        />
        {!suggestions && !isLoading && (
          <Button
            onClick={triggerExtraction}
            label="Extract entities with NLP"
            variant="outlined"
            size="small"
          />
        )}
      </Grid>
      <Grid size={12}>
        <Stack direction="column" width="100%" spacing={2}>
          {children(suggestions, {
            onKeywordClick: doAddKeyword,
            onActorClick: doAddActors,
            onGroupClick: () => {},
          })}

          <OpenAIEmbeddingJobButton<Event>
            type={OpenAIEmbeddingQueueType.literals[0]}
            resource="events"
            transformValue={(event) => ({
              text: getOpenAIPromptText(event),
              type: event.type,
            })}
          />
          <BlockNoteInput label="excerpt" source="excerpt" onlyText />
          <Box style={{ display: "flex", flexDirection: "column" }}>
            <DateField label="Updated At" source="updatedAt" showTime={true} />
            <DateField source="createdAt" showTime={true} />
          </Box>
        </Stack>
      </Grid>
      <Grid size={{ md: 12, lg: 12 }}></Grid>
    </Grid>
  );
};
