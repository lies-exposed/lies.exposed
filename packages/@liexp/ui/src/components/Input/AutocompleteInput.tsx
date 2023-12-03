import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError";
import { type GetListParams } from "ra-core";
import * as React from "react";
import { type UseQueryResult } from "react-query";
import { ErrorBox } from "../Common/ErrorBox";
import { TextField, Autocomplete, type AutocompleteProps } from "../mui";

interface SearchableItem {
  id: string;
}

export interface AutocompleteInputProps<T extends SearchableItem>
  extends Omit<
    AutocompleteProps<T, boolean, boolean, boolean>,
    "renderInput" | "options" | "onChange"
  > {
  query: (
    params: GetListParams,
  ) => UseQueryResult<{ data: T[]; total: number }, APIError>;
  searchToFilter: (t: string) => Record<string, string>;
  getValue: (v: T | string) => string;
  selectedItems: T[];
  onItemsChange: (items: T[]) => void;
}

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
  const itemQueryParams = React.useMemo(() => {
    const filter =
      value !== undefined && value !== ""
        ? searchToFilter(value)
        : selectedIds.length > 0
          ? { ids: selectedIds }
          : {};
    return {
      sort: { field: "createdAt", order: "DESC" as const },
      pagination: { page: 1, perPage: 20 },
      filter,
    };
  }, [value]);

  // queries

  const handleValueChange = React.useCallback(
    (v: string) => {
      setValue(v);
    },
    [value],
  );

  const items = query(itemQueryParams);

  if (items.isError) {
    return <ErrorBox />;
  }

  return (
    <Autocomplete<T, boolean, boolean, boolean>
      {...props}
      size="small"
      placeholder={placeholder}
      inputValue={value}
      value={(items.data?.data ?? []).filter((i) => selectedIds.includes(i.id))}
      options={(items.data?.data ?? []).filter(
        (i) => !selectedIds.includes(i.id),
      )}
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
          variant="standard"
          onChange={(e) => {
            const v = e.target.value;
            handleValueChange(v);
          }}
        />
      )}
      disablePortal={true}
      multiple={true}
      renderTags={renderTags}
      renderOption={renderOption}
    />
  );
};
