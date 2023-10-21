import { type Media } from "@liexp/shared/lib/io/http";
import * as React from "react";
import { useMediaQuery } from "../../state/queries/media.queries";
import { MediaList, MediaListItemRef } from "../lists/MediaList";
import { Grid, Typography } from "../mui";
import { AutocompleteInput } from "./AutocompleteInput";

export interface AutocompleteMediaInputProps {
  className?: string;
  selectedItems: Media.Media[];
  onChange: (items: Media.Media[]) => void;
  discrete?: boolean;
}

export const AutocompleteMediaInput: React.FC<AutocompleteMediaInputProps> = ({
  selectedItems,
  onChange,
  discrete = true,
  ...props
}) => {
  return (
    <AutocompleteInput<Media.Media>
      placeholder="Media description..."
      getValue={(a) =>
        typeof a === "string"
          ? a
          : a?.label ?? a?.description ?? "No description"
      }
      searchToFilter={(description) => ({ description })}
      selectedItems={selectedItems}
      query={(p) => useMediaQuery(p, discrete)}
      renderTags={(items) => (
        <MediaList
          media={items.map((i) => ({
            ...i,
            selected: true,
          }))}
          style={{ flexWrap: "wrap", flexDirection: "column" }}
          hideDescription={true}
          itemStyle={{ height: 50, maxWidth: 80 }}
          onItemClick={(a: any) => {
            onChange(items.filter((i) => i.id !== a.id));
          }}
        />
      )}
      renderOption={(props, item, state) => (
        <Grid container>
          <Grid item md={3}>
            <MediaListItemRef
              key={item.id}
              item={{
                ...item,
                selected: false,
              }}
              style={{ height: 100 }}
              hideDescription={true}
              onClick={() => {
                onChange(
                  selectedItems.filter((i) => i.id !== item.id).concat(item),
                );
              }}
            />
          </Grid>
          <Grid item md={9}>
            <Typography>{item.description}</Typography>
          </Grid>
        </Grid>
      )}
      onItemsChange={onChange}
      {...props}
    />
  );
};
