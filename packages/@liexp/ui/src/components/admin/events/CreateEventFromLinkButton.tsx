import { flow, fp } from "@liexp/core/lib/fp/index.js";
import { getRelationIdsFromEventRelations } from "@liexp/shared/lib/helpers/event/getEventRelationIds.js";
import { getSuggestions } from "@liexp/shared/lib/helpers/event-suggestion.js";
import { type Link } from "@liexp/shared/lib/io/http/Link.js";
import { type Media } from "@liexp/shared/lib/io/http/Media.js";
import { type EventSuggestion } from "@liexp/shared/lib/io/http/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { type Either } from "fp-ts/lib/Either.js";
import * as O from "fp-ts/lib/Option.js";
import { useRecordContext } from "ra-core";
import * as React from "react";
import { Button } from "react-admin";
import { useNavigate } from "react-router";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import { toBNDocument } from "../../Common/BlockNote/utils/utils.js";
import { ErrorBox } from "../../Common/ErrorBox.js";
import { Box, MenuItem, Select } from "../../mui/index.js";
import EventPreview from "../previews/EventPreview.js";

export const CreateEventFromLinkButton: React.FC = () => {
  const record = useRecordContext<Link>();
  const navigate = useNavigate();
  const apiProvider = useDataProvider();

  const [{ suggestion, type, error }, setState] = React.useState<{
    suggestion: EventSuggestion.CreateEventSuggestion | undefined;
    error: Error | undefined;
    type: io.http.Events.EventType;
  }>({
    suggestion: undefined,
    error: undefined,
    type: io.http.Events.EventType.types[1].value,
  });

  const getSuggestionFromAPI = React.useCallback(
    async (
      link: Link,
    ): Promise<Either<Error, EventSuggestion.CreateEventSuggestion>> => {
      if (suggestion) {
        return Promise.resolve(fp.E.right(suggestion));
      }

      const result = await apiProvider
        .get("open-graph/metadata", { url: link.url, type: "Link" })
        .then(async ({ data: { metadata: m, relations } }: any) => {
          const suggestions = await getSuggestions(toBNDocument)(
            m,
            O.some(link),
            O.fromNullable(link.image as Media),
            getRelationIdsFromEventRelations(relations.entities),
          );

          const suggestEvent = suggestions.find((t) => t.event.type === type);
          if (suggestEvent) {
            return fp.E.right(suggestEvent);
          }
          return fp.E.left(new Error("No suggestion found"));
        });

      return result;
    },
    [record, type],
  );

  if (!record || record?.events?.length > 0) {
    return <Box />;
  }

  return (
    <Box>
      <Select
        size="small"
        value={type}
        onChange={(e) => {
          setState({
            suggestion: undefined,
            error: undefined,
            type: e.target.value as any,
          });
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
            setState({
              type,
              suggestion,
              error: undefined,
            });
          }
          setTimeout(() => {
            void getSuggestionFromAPI(record).then(
              flow(
                fp.E.fold(
                  (e) => {
                    setState({
                      type,
                      suggestion: undefined,
                      error: e,
                    });
                  },
                  (s) =>
                    setState({
                      type,
                      suggestion: s,
                      error: undefined,
                    }),
                ),
              ),
            );
          }, 0);
        }}
      />
      <Button
        label="Create Event"
        variant="contained"
        onClick={() => {
          void getSuggestionFromAPI(record).then(
            flow(
              fp.E.fold(
                (e) => {
                  setState({
                    type,
                    suggestion: undefined,
                    error: e,
                  });
                },
                (suggestion) => {
                  const { newLinks, ...event } = suggestion.event;

                  void apiProvider
                    .create(`/events`, {
                      data: {
                        ...event,
                        links: newLinks,
                      },
                    })
                    .then(({ data }) => {
                      navigate(`/events/${data.id}`);
                    });
                },
              ),
            ),
          );
        }}
      />
      {suggestion ? (
        <Box>
          <EventPreview event={suggestion.event} />
        </Box>
      ) : null}
      {error ? (
        <Box>
          <ErrorBox
            error={error}
            resetErrorBoundary={() => {
              setState({
                type,
                suggestion: undefined,
                error: undefined,
              });
            }}
          />
        </Box>
      ) : null}
    </Box>
  );
};
