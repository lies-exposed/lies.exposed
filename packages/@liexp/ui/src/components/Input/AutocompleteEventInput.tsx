import { type Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { EventHelper } from "@liexp/shared/lib/helpers/event/event.helper.js";
import { EventsMapper } from "@liexp/shared/lib/helpers/event/events-mapper.helper.js";
import { type EventType } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { MEDIA } from "@liexp/shared/lib/io/http/Media/index.js";
import { type Events, type Media } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { useConfiguration } from "../../context/ConfigurationContext.js";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider.js";
import { EventCardGrid } from "../Cards/Events/EventCardGrid.js";
import EventSlimCard from "../Cards/Events/EventSlimCard.js";
import { AutocompleteInput } from "./AutocompleteInput.js";

/**
 * Get the first image URL for an event from the media array
 */
const getEventImage = (
  event: Events.Event,
  mediaList: readonly Media.Media[] | undefined,
): string | undefined => {
  if (!mediaList || mediaList.length === 0 || event.media.length === 0) {
    return undefined;
  }
  const firstMediaId = event.media[0];
  const media = mediaList.find((m) => m.id === firstMediaId);
  if (!media) {
    return undefined;
  }
  return media.thumbnail ?? media.location;
};

interface AutocompleteEventInputProps {
  className?: string;
  discrete?: boolean;
  filter?: Partial<{ eventType: EventType[] }>;
  selectedItems: Events.Event[];
  onChange: (items: Events.Event[]) => void;
  style?: React.CSSProperties;
}

export const AutocompleteEventInput: React.FC<AutocompleteEventInputProps> = ({
  selectedItems,
  onChange,
  discrete = true,
  filter,
  ...props
}) => {
  const Queries = useEndpointQueries();
  const conf = useConfiguration();

  return (
    <AutocompleteInput<typeof Endpoints.Event.List, Events.Event>
      placeholder="Event description..."
      getOptionLabel={(a) =>
        typeof a === "string"
          ? a
          : EventHelper.getTitle(a, {
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
          undefined,
          {
            ...p,
            ...filter,
            relations: [MEDIA.literals[0]],
          },
          discrete,
        )
      }
      mapResponseData={(data) =>
        (data?.data as Events.Event[] | undefined) ?? []
      }
      renderTags={(items) => (
        <EventCardGrid
          events={items.map((e) => EventsMapper.toSearchEvent(e, {}))}
          onEventClick={(a) => {
            onChange(items.filter((i) => i.id !== a.id));
          }}
        />
      )}
      renderOption={(_props, item, _state, response) => {
        const image = getEventImage(item, response?.media ?? []);
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
            image={image}
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
