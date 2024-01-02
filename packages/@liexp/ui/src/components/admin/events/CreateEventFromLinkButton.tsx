import { getSuggestions } from "@liexp/shared/lib/helpers/event-suggestion";
import * as io from "@liexp/shared/lib/io";
import * as O from "fp-ts/Option";
import { useRecordContext } from "ra-core";
import * as React from "react";
import { Button, useDataProvider } from "react-admin";
import { useNavigate } from "react-router";
import { Box, MenuItem, Select } from "../../mui";
import EventPreview from "../previews/EventPreview";

export const CreateEventFromLinkButton: React.FC = () => {
  const record = useRecordContext();
  const navigate = useNavigate();
  const apiProvider = useDataProvider();

  const [type, setType] = React.useState<string>(
    io.http.Events.EventType.types[1].value,
  );
  const [suggestion, setSuggestion] = React.useState<any>(undefined);

  if (record?.events?.legnth > 0) {
    return <Box />;
  }

  const getSuggestionFromAPI = React.useCallback(async () => {
    if (suggestion) {
      return suggestion;
    }

    return apiProvider
      .get("open-graph/metadata", { url: record.url, type: "Link" })
      .then(async ({ data: { metadata: m, relations } }: any) => {
        const suggestions = getSuggestions(
          m,
          O.some(record as any),
          O.fromNullable(record.thumbnail),
          {
            actors: relations.actors.map((a: any) => a.id),
            groups: relations.groups.map((a: any) => a.id),
            keywords: relations.keywords.map((k: any) => k.id),
            links: relations.links.map((k: any) => k.id),
            groupsMembers: [],
            media: [],
          },
        );

        return suggestions.find((t) => t.event.type === type);
      });
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
              createdAt: suggestion.event.createdAt.toISOString(),
              updatedAt: suggestion.event.updatedAt.toISOString(),
            }}
          />
        </Box>
      ) : null}
    </Box>
  );
};
