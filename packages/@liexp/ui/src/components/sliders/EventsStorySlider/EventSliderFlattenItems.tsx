import { http } from "@liexp/shared/lib/io";
import { ImageType, type Media } from "@liexp/shared/lib/io/http/Media";
import * as React from "react";
import Editor from "../../Common/Editor/Editor";
import MediaElement from "../../Media/MediaElement";
import { Box, Typography } from "../../mui";

type EventSliderFlattenItem = (
  | {
      type: "media";
      media: Media;
    }
  | {
      type: "content";
      body: any;
    }
) & { id: string };

export const toSliderItems = (
  e: http.Events.SearchEvent.SearchEvent,
): EventSliderFlattenItem[] => {
  const items: EventSliderFlattenItem[] = [];
  switch (e.type) {
    case http.Events.EventTypes.DOCUMENTARY.value: {
      return [];
    }
    case http.Events.EventTypes.DEATH.value: {
      if (e.payload.victim.avatar) {
        items.push({
          type: "media",
          id: e.payload.victim.id,
          media: {
            id: e.payload.victim.id,
            type: ImageType.types[0].value,
            label: e.payload.victim.fullName,
            thumbnail: e.payload.victim.avatar,
            location: e.payload.victim.avatar,
            createdAt: new Date(),
            updatedAt: new Date(),
            description: undefined,
            creator: undefined,
            featuredIn: undefined,
            deletedAt: undefined,
            extra: undefined,
            events: [],
            links: [],
            keywords: [],
            areas: [],
          },
        });
      }
      return items;
    }
    case http.Events.EventTypes.PATENT.value: {
      return [];
    }
    case http.Events.EventTypes.SCIENTIFIC_STUDY.value: {
      if (e.media.length > 0) {
        items.push(
          ...e.media.map((m) => ({
            id: m.id,
            type: "media" as const,
            media: m,
          })),
        );
      }
      if (e.body) {
        items.push({ id: e.id, type: "content", body: e.body });
      }
      return items;
    }
    case http.Events.EventTypes.QUOTE.value: {
      if (e.payload.quote) {
        items.push({ id: e.id, type: "content", body: e.payload.quote });
      }
      return items;
    }
    case http.Events.EventTypes.TRANSACTION.value: {
      return [];
    }
    default: {
      if (e.media.length > 0) {
        items.push(
          ...e.media.map((m) => ({
            id: m.id,
            type: "media" as const,
            media: m,
          })),
        );
      }

      if (e.body) {
        items.push({ id: e.id, type: "content", body: e.body });
      }
      return items;
    }
  }
};

export const EventSliderFlattenItem: React.FC<{
  item: EventSliderFlattenItem;
}> = ({ item }) => {
  switch (item.type) {
    case "media": {
      return <MediaElement media={item.media} style={{ width: '100%'}} />;
    }
    case "content": {
      return <Editor value={item.body} readOnly />;
    }
    default: {
      return <Typography>No items given</Typography>;
    }
  }
};

export const EventSliderFlattenItems: React.FC<{
  className?: string;
  items: EventSliderFlattenItem[];
  current: number;
  onClick: (e: any) => void;
}> = ({ className, current, items }) => {
  const currentItem = React.useMemo(() => {
    if (items.length >= 0 && items[current]) {
      return items[current];
    }
    return undefined;
  }, [items, current]);

  if (!currentItem) {
    return "No current item";
  }
  return (
    <Box className={className} style={{ display: 'flex', width: '100%'}}>
      <EventSliderFlattenItem key={currentItem.id} item={currentItem} />
    </Box>
  );
};
