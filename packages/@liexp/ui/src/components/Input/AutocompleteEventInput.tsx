import { getTitle } from "@liexp/shared/lib/helpers/event";
import { type Events } from "@liexp/shared/lib/io/http";
import * as React from "react";
import {
  useEventsQuery
} from "../../state/queries/DiscreteQueries";
import EventCard from "../Cards/Events/EventCard";
import { EventCardGrid } from "../Cards/Events/EventCardGrid";
import { AutocompleteInput } from "./AutocompleteInput";

interface AutocompleteEventInputProps {
  className?: string;
  selectedItems: Events.Event[];
  onChange: (items: Events.Event[]) => void;
}

export const AutocompleteEventInput: React.FC<AutocompleteEventInputProps> = ({
  selectedItems,
  onChange,
  ...props
}) => {
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
            })
      }
      searchToFilter={(title) => ({ title })}
      selectedItems={selectedItems}
      query={(p) => useEventsQuery(p, true)}
      renderTags={(items) => (
        <EventCardGrid
          events={items as any[]}
          onItemClick={(a) => { onChange(items.filter((i) => i.id !== a.id)); }}
        />
      )}
      renderOption={(props, item, state) => (
        <EventCard
          key={item.id}
          showRelations={false}
          event={{
            ...(item as any),
          }}
          onEventClick={() => {
            onChange(
              selectedItems.filter((i) => i.id !== item.id).concat(item)
            );
          }}
        />
      )}
      onItemsChange={onChange}
      {...props}
    />
  );
};
