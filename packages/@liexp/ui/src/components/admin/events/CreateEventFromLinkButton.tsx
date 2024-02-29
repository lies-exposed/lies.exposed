import { getRelationIdsFromEventRelations } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { getSuggestions } from "@liexp/shared/lib/helpers/event-suggestion.js";
import { EventSuggestion } from "@liexp/shared/lib/io/http/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import * as O from "fp-ts/lib/Option.js";
import { useRecordContext } from "ra-core";
import * as React from "react";
import { Button } from "react-admin";
import { useNavigate } from "react-router";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import { editor } from "../../Common/Editor/index.js";
import { Box, MenuItem, Select } from "../../mui/index.js";
import EventPreview from "../previews/EventPreview.js";

export const CreateEventFromLinkButton: React.FC = () => {
  const record = useRecordContext();
  const navigate = useNavigate();
  const apiProvider = useDataProvider();

  const [type, setType] = React.useState<string>(
    io.http.Events.EventType.types[1].value,
  );
  const [suggestion, setSuggestion] = React.useState<
    EventSuggestion.CreateEventSuggestion | undefined
  >(undefined);

  if (record?.events?.legnth > 0) {
    return <Box />;
  }

  const getSuggestionFromAPI = React.useCallback(async () => {
    if (suggestion) {
      return Promise.resolve(suggestion);
    }

    const result = await apiProvider
      .get("open-graph/metadata", { url: record.url, type: "Link" })
      .then(({ data: { metadata: m, relations } }: any) => {
        const suggestions = getSuggestions(editor.createExcerptValue)(
          m,
          O.some(record as any),
          O.fromNullable(record.thumbnail),
          getRelationIdsFromEventRelations(relations.entities),
        );

        return suggestions.find((t) => t.event.type === type);
      });

    return result;
  }, [record, type]);

  return (
    <Box>
      <Select
        size="small"
        value={type}
        onChange={(e) => {
          setType(e.target.value);
        }}
      >
        {io.http.Events.EventType.types.map((t) => (
          <MenuItem key={t.value} value={t.value}>
            {t.value}
          </MenuItem>
        ))}
      </Select>
      <Button
        label="Preview Event"
        onClick={() => {
          if (suggestion) {
            setSuggestion(undefined);
          }
          setTimeout(() => {
            void getSuggestionFromAPI().then(setSuggestion);
          }, 0);
        }}
      />
      <Button
        label="Create Event"
        variant="contained"
        onClick={() => {
          void getSuggestionFromAPI().then(async (suggestion: any) => {
            if (suggestion?.event) {
              const { newLinks, ...event } = suggestion.event;

              const { data: e } = await apiProvider.create(`/events`, {
                data: {
                  ...event,
                  links: newLinks,
                },
              });
              navigate(`/events/${e.id}`);
            }
          });
        }}
      />
      {suggestion ? (
        <Box>
          <EventPreview
            event={{
              ...suggestion.event,
              date: suggestion.event.date.toISOString(),
              // TODO: fix this
              // createdAt: suggestion.event.createdAt.toISOString(),
              // updatedAt: suggestion.event.updatedAt.toISOString(),
            }}
          />
        </Box>
      ) : null}
    </Box>
  );
};
