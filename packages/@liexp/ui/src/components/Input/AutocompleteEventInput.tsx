import { getTitle } from "@liexp/shared/lib/helpers/event";
import { toSearchEvent } from "@liexp/shared/lib/helpers/event/search-event";
import { type Events } from "@liexp/shared/lib/io/http";
import * as React from "react";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider";
import EventCard from "../Cards/Events/EventCard";
import { EventCardGrid } from "../Cards/Events/EventCardGrid";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteEventInputProps {
  className?: string;
  discrete?: boolean;
  selectedItems: Events.Event[];
  onChange: (items: Events.Event[]) => void;
}

export const AutocompleteEventInput: React.FC<AutocompleteEventInputProps> = ({
  selectedItems,
  onChange,
  discrete = true,
  ...props
}) => {
  const Queries = useEndpointQueries();
  return (
    <AutocompleteInput<Events.Event>
      placeholder="Event description..."
      getValue={(a) =>
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
      searchToFilter={(title) => ({ title })}
      selectedItems={selectedItems}
      query={(p) => Queries.Event.list.useQuery(p, undefined, discrete)}
      renderTags={(items) => (
        <EventCardGrid
          events={items.map((e) => toSearchEvent(e, {}))}
          onItemClick={(a) => {
            onChange(items.filter((i) => i.id !== a.id));
          }}
        />
      )}
      renderOption={(props, item, state) => (
        <EventCard
          key={item.id}
          showRelations={false}
          event={{ ...toSearchEvent(item, {}) }}
          onEventClick={() => {
            onChange(
              selectedItems.filter((i) => i.id !== item.id).concat(item),
            );
          }}
        />
      )}
      onItemsChange={onChange}
      {...props}
    />
  );
};
