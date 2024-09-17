import { getTitle } from "@liexp/shared/lib/helpers/event/index.js";
import { toSearchEvent } from "@liexp/shared/lib/helpers/event/search-event.js";
import { MEDIA } from "@liexp/shared/lib/io/http/Media/index.js";
import { type Events } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { useConfiguration } from "../../context/ConfigurationContext.js";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider.js";
import { EventCardGrid } from "../Cards/Events/EventCardGrid.js";
import EventSlimCard from "../Cards/Events/EventSlimCard.js";
import { AutocompleteInput } from "./AutocompleteInput.js";

interface AutocompleteEventInputProps {
  className?: string;
  discrete?: boolean;
  selectedItems: Events.Event[];
  onChange: (items: Events.Event[]) => void;
  style?: React.CSSProperties;
}

export const AutocompleteEventInput: React.FC<AutocompleteEventInputProps> = ({
  selectedItems,
  onChange,
  discrete = true,
  ...props
}) => {
  const { Queries } = useEndpointQueries();
  const conf = useConfiguration();
  return (
    <AutocompleteInput<Events.Event>
      placeholder="Event description..."
      getOptionLabel={(a) =>
        typeof a === "string"
          ? a
          : getTitle(a, {
              actors: [],
              groups: [],
              keywords: [],
              groupsMembers: [],
              media: [],
              links: [],
              areas: [],
            })
      }
      searchToFilter={(q) => ({ q })}
      selectedItems={selectedItems}
      query={(p) =>
        Queries.Event.list.useQuery(
          {
            ...p,
            filter: {
              ...p.filter,
              // TODO: implement this on backend
              relations: [MEDIA.value],
            },
          },
          undefined,
          discrete,
        )
      }
      renderTags={(items) => (
        <EventCardGrid
          events={items.map((e) => toSearchEvent(e, {}))}
          onItemClick={(a) => {
            onChange(items.filter((i) => i.id !== a.id));
          }}
        />
      )}
      renderOption={(props, item, state) => {
        return (
          <EventSlimCard
            key={item.id}
            layout="horizontal"
            event={item}
            onEventClick={() => {
              onChange(
                selectedItems.filter((i) => i.id !== item.id).concat(item),
              );
            }}
            defaultImage={conf.platforms.web.defaultImage}
            style={{
              maxHeight: 200,
            }}
          />
        );
      }}
      onItemsChange={onChange}
      {...props}
    />
  );
};
