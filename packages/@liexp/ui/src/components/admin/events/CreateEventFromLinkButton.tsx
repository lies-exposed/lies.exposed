import { flow, fp } from "@liexp/core/lib/fp/index.js";
import { type Link } from "@liexp/shared/lib/io/http/Link.js";
import { type EventSuggestion } from "@liexp/shared/lib/io/http/index.js";
import * as io from "@liexp/shared/lib/io/index.js";
import { type Either } from "fp-ts/lib/Either.js";
import { useRecordContext } from "ra-core";
import * as React from "react";
import { Button } from "react-admin";
import { useNavigate } from "react-router";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
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

      const result = await apiProvider.post("events", { url: link.url, type });
      return result.data;
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
        // disabled={!payload}
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
