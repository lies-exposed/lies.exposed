import { TextField } from "@material-ui/core";
import Autocomplete, { AutocompleteProps } from "@material-ui/lab/Autocomplete";
import { available, queryStrict } from "avenger";
import { CachedQuery } from "avenger/lib/Query";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as TE from "fp-ts/lib/TaskEither";
import { GetListParams } from "ra-core";
import * as React from "react";
// import { throttle } from "throttle-debounce";
import { APIError } from "../../providers/DataProvider";
import { ErrorBox } from "../Common/ErrorBox";
import { LazyFullSizeLoader } from "../Common/FullSizeLoader";

interface SearchableItem {
  id: string;
}

export interface AutocompleteInputProps<T extends SearchableItem>
  extends Omit<
    AutocompleteProps<T, boolean, boolean, boolean>,
    "renderInput" | "options"
  > {
  query: CachedQuery<GetListParams, APIError, { data: T[]; total: number }>;
  searchToFilter: (t: string) => Record<string, string>;
  getValue: (v: T) => string;
  selectedIds: string[];
  onItemsChange: (items: T[]) => void;
}

const emptyDataQuery = <T extends SearchableItem>(): CachedQuery<
  GetListParams,
  APIError,
  { data: T[]; total: number }
> =>
  queryStrict<GetListParams, APIError, { data: T[]; total: number }>(
    () => TE.right({ data: [], total: 0 }),
    available
  );

export const AutocompleteInput = <T extends { id: string }>({
  query,
  selectedIds,
  getValue,
  placeholder,
  renderTags,
  renderOption,
  searchToFilter,
  onItemsChange,
  ...props
}: AutocompleteInputProps<T>): React.ReactElement => {
  const [value, setValue] = React.useState<string>("");
  // const setValueThrottled = throttle(300, setValue, true);

  const itemsQuery = React.useMemo(
    () => (value !== "" ? query : emptyDataQuery<T>()),
    [value]
  );

  const selectedItemsQuery = React.useMemo(() => {
    return query;
  }, [selectedIds.length]);

  return (
    <WithQueries
      queries={{
        items: itemsQuery,
        selectedItems: selectedItemsQuery,
      }}
      params={{
        items: {
          sort: { field: "createdAt", order: "DESC" },
          pagination: { page: 1, perPage: 20 },
          filter: {
            ...(value !== undefined ? searchToFilter(value) : {}),
          },
        },
        selectedItems: {
          sort: { field: "createdAt", order: "DESC" },
          pagination: { page: 1, perPage: selectedIds.length },
          filter: {
            ids: selectedIds,
          },
        },
      }}
      render={QR.fold(
        LazyFullSizeLoader,
        ErrorBox,
        ({
          items: { data: items },
          selectedItems: { data: selectedItems },
        }) => {
          return (
            <Autocomplete<T, boolean, boolean, boolean>
              {...props}
              size="small"
              placeholder={placeholder}
              inputValue={value}
              value={selectedItems.filter((i) => selectedIds.includes(i.id))}
              options={items.filter((i) => !selectedIds.includes(i.id))}
              onChange={(e, v) => {
                if (Array.isArray(v)) {
                  onItemsChange(v as T[]);
                  setValue("");
                  // if (v.length > selectedItems.length) {
                  //   const item = v[v.length - 1];
                  //   onSelectItem(item as T, selectedItems);
                  // } else {
                  //   const item = selectedItems.filter((si) => !v.includes(si));
                  //   onUnselectItem(item[0], selectedItems);
                  // }
                }
              }}
              getOptionLabel={getValue}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={placeholder}
                  variant="outlined"
                  onChange={(e) => {
                    const v = e.target.value;
                    setValue(v);
                  }}
                />
              )}
              disablePortal={true}
              multiple={true}
              getOptionSelected={(op, value) => op.id === value.id}
              renderTags={renderTags}
              renderOption={renderOption}
            />
          );
        }
      )}
    />
  );
};
