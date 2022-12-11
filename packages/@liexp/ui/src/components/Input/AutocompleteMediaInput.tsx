import { Media } from "@liexp/shared/io/http";
import * as React from "react";
import { useMediaQuery } from "../../state/queries/DiscreteQueries";
import { MediaList, MediaListItem } from "../lists/MediaList";
import { Grid, Typography } from "../mui";
import { AutocompleteInput } from "./AutocompleteInput";

export interface AutocompleteMediaInputProps {
  className?: string;
  selectedItems: Media.Media[];
  onChange: (items: Media.Media[]) => void;
}

export const AutocompleteMediaInput: React.FC<AutocompleteMediaInputProps> = ({
  selectedItems,
  onChange,
  ...props
}) => {
  return (
    <AutocompleteInput<Media.Media>
      placeholder="Media description..."
      getValue={(a) => (typeof a === "string" ? a : a.description)}
      searchToFilter={(description) => ({ description })}
      selectedItems={selectedItems}
      query={(p) => useMediaQuery(p, true)}
      renderTags={(items) => (
        <MediaList
          media={items.map((i) => ({
            ...i,
            selected: true,
          }))}
          style={{ flexWrap: "wrap", flexDirection: "row" }}
          hideDescription={false}
          itemStyle={{ height: 50, maxWidth: 100 }}
          onItemClick={(a) => { onChange(items.filter((i) => i.id !== a.id)); }}
        />
      )}
      renderOption={(props, item, state) => (
        <Grid container>
          <Grid item md={3}>
            <MediaListItem
              key={item.id}
              item={{
                ...item,
                selected: false,
              }}
              style={{ height: 100 }}
              hideDescription={true}
              onClick={() => {
                onChange(
                  selectedItems.filter((i) => i.id !== item.id).concat(item)
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
