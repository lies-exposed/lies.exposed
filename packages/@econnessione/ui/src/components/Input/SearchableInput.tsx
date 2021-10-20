import { TextField } from "@material-ui/core";
import Autocomplete, { AutocompleteProps } from "@material-ui/lab/Autocomplete";
import * as React from "react";

export interface SearchableItem {
  id: string;
}

interface SearchableInputProps<I extends SearchableItem>
  extends Omit<
    AutocompleteProps<I, boolean, boolean, boolean>,
    "renderInput" | "options"
  > {
  placeholder?: string;
  label: string;
  items: I[];
  selectedItems: I[];
  getValue: (v: I) => string;
  onTextChange?: (text: string) => void;
  onSelectItem: (item: I, selectedItems: I[]) => void;
  onUnselectItem: (item: I, selectedItems: I[]) => void;
}

const SearchableInput = <I extends SearchableItem>({
  placeholder,
  label,
  items,
  selectedItems,
  getValue,
  onTextChange,
  onSelectItem,
  onUnselectItem,
  ...props
}: SearchableInputProps<I>): JSX.Element => {
  const placehoder = placeholder ?? "Search...";

  return (
    <Autocomplete<I, typeof props.multiple, boolean, boolean>
      {...props}
      size="small"
      placeholder={placehoder}
      value={selectedItems ?? undefined}
      options={items}
      onChange={(e, v) => {
        if (Array.isArray(v)) {
          if (v.length > selectedItems.length) {
            const item = v[v.length - 1];
            onSelectItem(item as I, selectedItems);
          } else {
            const item = selectedItems.filter((si) => !v.includes(si));
            onUnselectItem(item[0], selectedItems);
          }
        }
      }}
      getOptionLabel={getValue}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          margin="normal"
          variant="outlined"
          onChange={(e) => onTextChange?.(e.target.value)}
        />
      )}
    />
  );
};

export default SearchableInput;
