import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { type Area } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { useConfiguration } from "../../context/ConfigurationContext.js";
import { useEndpointQueries } from "../../hooks/useEndpointQueriesProvider.js";
import { AreaList, AreaListItem } from "../lists/AreaList.js";
import { Grid, Typography } from "../mui/index.js";
import { AutocompleteInput } from "./AutocompleteInput.js";

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
  ...props
}) => {
  const Queries = useEndpointQueries();
  const conf = useConfiguration();
  return (
    <AutocompleteInput<typeof Endpoints.Area.List>
      className={className}
      placeholder="Search area..."
      getOptionLabel={(a) => (typeof a === "string" ? a : a.label)}
      searchToFilter={(q) => ({ q })}
      selectedItems={selectedItems}
      query={(p) =>
        Queries.Area.list.useQuery(undefined, p, discrete, "search")
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
      renderOption={(props, item, _state) => {
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
            <Grid size={{ md: 12 }}>
              <AreaListItem
                item={{
                  ...item,
                  selected: false,
                }}
                style={{ height: 100 }}
                defaultImage={conf.platforms.web.defaultImage}
              />
            </Grid>
            <Grid size={{ md: 9 }}>
              <Typography variant="subtitle1">{item.label}</Typography>
            </Grid>
          </Grid>
        );
      }}
      onItemsChange={onChange}
      {...props}
    />
  );
};
