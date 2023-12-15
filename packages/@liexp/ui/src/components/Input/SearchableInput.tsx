import * as React from "react";
import { TextField, Autocomplete, type AutocompleteProps } from "../mui";

export interface SearchableItem {
  id: string;
}

export interface SearchableInputProps<I extends SearchableItem>
  extends Omit<
    AutocompleteProps<I, boolean, boolean, boolean>,
    "renderInput" | "options"
  > {
  placeholder?: string;
  label: string;
  items: I[];
  selectedItems: I[];
  getValue: (v: string | I) => string;
  onTextChange?: (text: string) => void;
  onSelectItem: (item: I, selectedItems: I[]) => void;
  onUnselectItem: (item: I, selectedItems: I[]) => void;
}

const SearchableInput = <I extends SearchableItem>({
  placeholder = "Search...",
  label,
  items,
  selectedItems,
  getValue,
  onTextChange,
  onSelectItem,
  onUnselectItem,
  ...props
}: SearchableInputProps<I>): JSX.Element => {

  return (
    <Autocomplete<I, typeof props.multiple, boolean, boolean>
      {...props}
      size="small"
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
        } else if (typeof v === "object") {
          onSelectItem(v as any, [v] as any[]);
        }
      }}
      getOptionLabel={getValue}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder}
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
