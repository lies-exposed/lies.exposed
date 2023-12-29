import { type Area } from "@liexp/shared/lib/io/http";
import * as React from "react";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider";
import { AreaList, AreaListItem } from "../lists/AreaList";
import { Grid, Typography } from "../mui";
import { AutocompleteInput } from "./AutocompleteInput";

export interface AutocompleteAreaInputProps {
  className?: string;
  selectedItems: Area.Area[];
  onChange: (items: Area.Area[]) => void;
  discrete?: boolean;
}

export const AutocompleteAreaInput: React.FC<AutocompleteAreaInputProps> = ({
  selectedItems,
  onChange,
  discrete = true,
  className,
}) => {
  const Queries = useEndpointQueries();
  return (
    <AutocompleteInput<Area.Area>
      className={className}
      placeholder="Search area..."
      getOptionLabel={(a) => (typeof a === "string" ? a : a.label)}
      searchToFilter={(description) => ({ description })}
      selectedItems={selectedItems}
      query={(p) =>
        Queries.Area.list.useQuery(p, undefined, discrete, "search")
      }
      renderTags={(items) => (
        <AreaList
          areas={items.map((i) => ({
            ...i,
            selected: true,
          }))}
          style={{ flexWrap: "wrap", flexDirection: "column" }}
          onAreaClick={(a) => {
            onChange(items.filter((i) => i.id !== a.id));
          }}
        />
      )}
      renderOption={(props, item, state) => {
        return (
          <Grid
            container
            spacing={2}
            key={item.id}
            onClick={() => {
              onChange(
                selectedItems.filter((i) => i.id !== item.id).concat(item),
              );
            }}
          >
            <Grid item md={12}>
              <AreaListItem
                item={{
                  ...item,
                  selected: false,
                }}
                style={{ height: 100 }}
              />
            </Grid>
            <Grid item md={9}>
              <Typography variant="subtitle1">{item.label}</Typography>
            </Grid>
          </Grid>
        );
      }}
      onItemsChange={onChange}
    />
  );
};
