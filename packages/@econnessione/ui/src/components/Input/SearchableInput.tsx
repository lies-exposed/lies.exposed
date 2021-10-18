import { TextField } from "@material-ui/core";
import Autocomplete, { AutocompleteProps } from "@material-ui/lab/Autocomplete";
import * as React from "react";

export interface SearchableItem {
  id: string;
}

// interface ItemProps<I extends SearchableItem> {
//   onClick: (i: I) => void;
// }

// interface InputReplacementProps<I extends SearchableItem> {
//   value: string;
//   setValue: (v: string) => void;
//   getValue: (i: I) => string;
//   selectedItems: I[];
//   items: I[];
//   selectItem: (i: I) => void;
//   removeItem: (i: I) => void;
//   itemRenderer: (
//     i: I,
//     props: ItemProps<I>,
//     index: number
//   ) => React.ReactElement;
//   onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
// }

// eslint-disable-next-line react/display-name
// const InputReplacement = React.forwardRef<
//   any,
//   InputReplacementProps<SearchableItem>
// >(
//   (
//     {
//       value,
//       setValue,
//       selectedItems,
//       items,
//       itemRenderer,
//       getValue,
//       removeItem,
//       selectItem,
//       ...restProps
//     },
//     ref
//   ) => {
//     return (
//       <div
//         style={{
//           flex: "1 1 0%",
//           height: "100%",
//           flexWrap: "wrap",
//           display: "flex",
//           alignItems: "center",
//           overflow: "scroll",
//         }}
//       >
//         {selectedItems.map((item: SearchableItem, index: number) =>
//           itemRenderer(
//             { ...item },
//             {
//               ...restProps,
//               onClick: (item) => {
//                 removeItem(item);
//                 setValue("");
//               },
//             },
//             index
//           )
//         )}
//         <Input ref={ref} value={value} {...restProps} />
//         <List<SearchableItem>
//           style={{ flexGrow: 1, height: "100%" }}
//           data={items.filter((i) =>
//             getValue(i).toLowerCase().includes(value.toLowerCase())
//           )}
//           getKey={getValue}
//           filter={(i) => true}
//           ListItem={({ item, index }) =>
//             itemRenderer(
//               item,
//               {
//                 ...restProps,
//                 onClick: () => {
//                   selectItem(item);
//                 },
//               },
//               index
//             )
//           }
//         />
//       </div>
//     );
//   }
// );

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
