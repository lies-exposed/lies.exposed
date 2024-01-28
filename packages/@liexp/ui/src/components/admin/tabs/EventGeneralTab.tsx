import { type ExtractEntitiesWithNLPOutput } from "@liexp/shared/lib/io/http/admin/ExtractNLPEntities.js";
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
import ReactPageInput from "../ReactPageInput.js";
import { EventTypeInput } from "../common/inputs/EventTypeInput.js";
import ReferenceArrayKeywordInput from "../keywords/ReferenceArrayKeywordInput.js";
import { SuggestedKeywordEntityRelationsBox } from "../links/SuggestedEntityRelationsBox.js";

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
  const [update, { isLoading: isUpdateLoading }] = useUpdate();

  React.useEffect(() => {
    if (record?.id && suggestions === null) {
      setSuggestions({ isLoading: true, suggestions: null });
      void dataProvider
        .post("/admins/nlp/extract-entities", {
          resource: "events",
          uuid: record.id,
        })
        .then((res: any) => {
          setSuggestions({ isLoading: false, suggestions: res.data });
        })
        .catch((err: any) => {
          // eslint-disable-next-line no-console
          console.log(err);
          setSuggestions({ isLoading: false, suggestions: null });
        });
    }
  }, [record?.id]);

  const doAddKeyword = React.useCallback(
    (entity: string) => {
      void update("events", {
        id: record.id,
        data: {
          ...record,
          keywords: (record.keywords ?? []).concat([entity]),
        },
      });
    },
    [update, record],
  );

  const doAddActors = React.useCallback(
    (entity: string) => {
      void update("events", {
        id: record.id,
        data: {
          ...record,
          payload: {
            ...record.payload,
            actors: (record.actors ?? []).concat([entity]),
          },
        },
      });
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
        <ReactPageInput label="excerpt" source="excerpt" onlyText />
        <Box style={{ display: "flex", flexDirection: "column" }}>
          <DateField label="Updated At" source="updatedAt" showTime={true} />
          <DateField source="createdAt" showTime={true} />
        </Box>
      </Grid>
    </Grid>
  );
};
