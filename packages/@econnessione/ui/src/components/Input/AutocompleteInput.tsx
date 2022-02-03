import { APIError } from "@econnessione/shared/providers/api.provider";
import { TextField } from "@material-ui/core";
import Autocomplete, { AutocompleteProps } from "@material-ui/lab/Autocomplete";
import { queryStrict, refetch } from "avenger";
import { CachedQuery, ObservableQuery } from "avenger/lib/Query";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as TE from "fp-ts/lib/TaskEither";
import { GetListParams } from "ra-core";
import * as React from "react";
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
  selectedItems: T[];
  onItemsChange: (items: T[]) => void;
}

const discreteQuery = <L, P>(
  q: ObservableQuery<GetListParams, L, P>,
  empty: P
): CachedQuery<GetListParams, L, P> =>
  queryStrict<GetListParams, L, P>((input: GetListParams) => {
    return input.filter.ids === 0 ? TE.right(empty) : q.run(input);
  }, refetch);

export const AutocompleteInput = <T extends { id: string }>({
  query,
  selectedItems,
  getValue,
  placeholder,
  renderTags,
  renderOption,
  searchToFilter,
  onItemsChange,
  ...props
}: AutocompleteInputProps<T>): React.ReactElement => {
  const selectedIds = selectedItems.map((s) => s.id);
  const [value, setValue] = React.useState<string>("");
  // const setValueThrottled = throttle(300, setValue, true);

  // params
  const itemQueryParams = React.useMemo(
    () => ({
      sort: { field: "createdAt", order: "DESC" },
      pagination: { page: 1, perPage: 20 },
      filter: {
        ...(value !== undefined || value !== "" ? searchToFilter(value) : {}),
      },
    }),
    [value]
  );

  // queries
  const itemsQuery = discreteQuery(query, { total: 0, data: [] });

  const handleValueChange = React.useCallback(
    (v: string) => {
      setValue(v);
    },
    [value]
  );

  return (
    <WithQueries
      queries={{
        items: itemsQuery,
      }}
      params={{
        items: itemQueryParams,
      }}
      render={QR.fold(
        LazyFullSizeLoader,
        ErrorBox,
        ({ items: { data: items } }) => {
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
                  handleValueChange("");
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
                    handleValueChange(v);
                  }}
                />
              )}
              disablePortal={true}
              multiple={true}
              getOptionSelected={(op, value) => {
                return op.id === value.id;
              }}
              renderTags={renderTags}
              renderOption={renderOption}
            />
          );
        }
      )}
    />
  );
};
