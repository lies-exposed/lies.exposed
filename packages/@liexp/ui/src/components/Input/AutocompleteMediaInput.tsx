import { type Media } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider.js";
import { MediaList, MediaListItemRef } from "../lists/MediaList.js";
import { Grid, Typography } from "../mui/index.js";
import { AutocompleteInput } from "./AutocompleteInput.js";

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
  const Queries = useEndpointQueries();
  return (
    <AutocompleteInput<Media.Media>
      placeholder="Media description..."
      getOptionLabel={(a) =>
        typeof a === "string"
          ? a
          : a?.label ?? a?.description ?? "No description"
      }
      searchToFilter={(description) => ({ description })}
      selectedItems={selectedItems}
      query={(p) => Queries.Media.list.useQuery(p, undefined, discrete)}
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
