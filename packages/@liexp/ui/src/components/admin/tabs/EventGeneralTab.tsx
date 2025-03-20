import { getTitle } from "@liexp/shared/lib/helpers/event/getTitle.helper.js";
import { type Event } from "@liexp/shared/lib/io/http/Events/index.js";
import { OpenAIEmbeddingQueueType } from "@liexp/shared/lib/io/http/Queue/index.js";
import { type ExtractEntitiesWithNLPOutput } from "@liexp/shared/lib/io/http/admin/ExtractNLPEntities.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import * as React from "react";
import {
  BooleanInput,
  DateField,
  DateInput,
  Loading,
  useRecordContext,
  useUpdate,
} from "react-admin";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import { Box, Grid } from "../../mui/index.js";
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
  const dataProvider = useDataProvider();
  const [{ isLoading, suggestions }, setSuggestions] = React.useState<{
    isLoading: boolean;
    suggestions: ExtractEntitiesWithNLPOutput | null;
  }>({
    isLoading: true,
    suggestions: null,
  });
  const [update, { isPending: isUpdateLoading }] = useUpdate();

  React.useEffect(() => {
    if (record?.id && suggestions === null) {
      setSuggestions({ isLoading: true, suggestions: null });
      void dataProvider
        .post("/admins/nlp/extract-entities", {
          resource: "events",
          uuid: record.id,
        })
        .then((res) => {
          setSuggestions({ isLoading: false, suggestions: res.data });
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
          setSuggestions({ isLoading: false, suggestions: null });
        });
    }
  }, [record?.id]);

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
    <Grid container>
      <Grid
        item
        {...{ md: 4, lg: 4 }}
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <EventTypeInput source="type" />
        <BooleanInput size="small" source="draft" />
      </Grid>
      <Grid item {...{ md: 2, lg: 2 }}>
        <DateInput source="date" />
      </Grid>
      <Grid item {...{ md: 6, lg: 6 }}>
        <ReferenceArrayKeywordInput
          source="keywords"
          defaultValue={[]}
          showAdd
        />
        <SuggestedKeywordEntityRelationsBox
          keywords={suggestions?.entities.keywords ?? []}
          onKeywordClick={doAddKeyword}
        />
      </Grid>
      <Grid item md={12}>
        {children(suggestions, {
          onKeywordClick: doAddKeyword,
          onActorClick: doAddActors,
          onGroupClick: () => {},
        })}
      </Grid>
      <Grid item {...{ md: 12 }}>
        <OpenAIEmbeddingJobButton<Event>
          type={OpenAIEmbeddingQueueType.Type}
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
      </Grid>
    </Grid>
  );
};
