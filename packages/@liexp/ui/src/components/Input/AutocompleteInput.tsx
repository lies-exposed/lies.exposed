import { type UseQueryResult } from "@tanstack/react-query";
import {
  type EndpointOutputType,
  type EndpointQueryType,
  type IOError,
} from "@ts-endpoint/core";
import { type EndpointDataOutputType } from "@ts-endpoint/react-admin";
import * as React from "react";
import { ErrorBox } from "../Common/ErrorBox.js";
import {
  Autocomplete,
  TextField,
  type AutocompleteProps,
} from "../mui/index.js";

interface SearchableItem {
  id: string;
}

export interface AutocompleteInputProps<L, T>
  extends Omit<
    AutocompleteProps<T, boolean, boolean, boolean>,
    "renderInput" | "options" | "onChange"
  > {
  placeholder?: string;
  query: (
    params: Partial<EndpointQueryType<L>>,
  ) => UseQueryResult<EndpointOutputType<L>, IOError>;
  searchToFilter: (t: string) => Record<string, string>;
  getOptionLabel: (v: T | string) => string;
  selectedItems: T[];
  onItemsChange: (items: T[]) => void;
}

export const AutocompleteInput = <
  L,
  T extends SearchableItem = EndpointDataOutputType<L>[0] & SearchableItem,
>({
  query,
  selectedItems,
  getOptionLabel,
  placeholder,
  renderTags,
  renderOption,
  searchToFilter,
  onItemsChange,
  autoFocus,
  ...props
}: AutocompleteInputProps<L, T>): React.ReactElement => {
  const [inputValue, setInputValue] = React.useState<string>("");
  const selectedIds = React.useMemo(
    () => selectedItems.map((s) => s.id),
    [selectedItems],
  );

  // params
  const itemQueryParams = React.useMemo(() => {
    const filter =
      inputValue !== undefined && inputValue !== ""
        ? searchToFilter(inputValue)
        : selectedIds.length > 0
          ? { ids: selectedIds }
          : {};
    return {
      _sort: "createdAt",
      _order: "DESC",
      ...filter,
    } as unknown as Partial<EndpointQueryType<L>>;
  }, [inputValue]);

  const items = query(itemQueryParams);
  const data: T[] = items.data?.data ?? [];

  const { options, value } = React.useMemo(() => {
    const options = data.filter((i) => !selectedIds.includes(i.id));

    const value = data.filter((i) => selectedIds.includes(i.id));
    return { options, value };
  }, [data, selectedIds]);

  if (items.isError) {
    return (
      <ErrorBox
        error={items.error}
        resetErrorBoundary={() => {
          setInputValue("");
        }}
      />
    );
  }

  return (
    <Autocomplete<T, boolean, boolean, boolean>
      size="small"
      disablePortal
      multiple
      openOnFocus
      inputValue={inputValue}
      onInputChange={(e, v, r) => {
        if (r === "input") {
          setInputValue(v);
        }
      }}
      value={value}
      onChange={(e, v, r, d) => {
        if (Array.isArray(v)) {
          onItemsChange(v as T[]);
          setInputValue("");
        }
      }}
      options={options}
      getOptionLabel={getOptionLabel}
      renderInput={(params) => {
        return (
          <TextField
            {...params}
            placeholder={placeholder}
            autoFocus={autoFocus}
            InputProps={{
              ...params.InputProps,
              type: "search",
            }}
          />
        );
      }}
      renderTags={renderTags}
      renderOption={renderOption}
      {...props}
    />
  );
};
