import { generateRandomColor } from "@liexp/shared/lib/utils/colors";
import React from "react";
import {
  AutocompleteArrayInput,
  Button,
  ReferenceArrayInput,
  useRefresh,
  type ReferenceInputProps,
} from "react-admin";
import { apiProvider } from "../../../client/api";
import { Box, TextField } from "../../mui";
import { ColorInput } from "../common/inputs/ColorInput";
import { ImportKeywordButton } from "./ImportKeywordButton";

const ReferenceArrayKeywordInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source: string; showAdd: boolean }
> = ({ showAdd, ...props }) => {
  const refresh = useRefresh();

  const [{ color, tag }, setKeyword] = React.useState({
    tag: "",
    color: generateRandomColor(),
  });
  const doKeywordCreate = React.useCallback((): void => {
    void apiProvider.create("keywords", { data: { tag, color } }).then(() => {
      setKeyword({ tag: "", color: generateRandomColor() });
      refresh();
    });
  }, [tag, color]);
  return (
    <Box>
      <ReferenceArrayInput {...props} reference="keywords">
        <AutocompleteArrayInput
          size="small"
          optionText="tag"
          filterToQuery={(search: string) => ({ search })}
        />
      </ReferenceArrayInput>
      {showAdd ? <ImportKeywordButton /> : null}
      {showAdd ? (
        <Box style={{ display: "flex" }}>
          <TextField
            value={tag}
            onChange={(e) => {
              setKeyword((k) => ({ ...k, tag: e.target.value }));
            }}
          />
          <ColorInput
            source="color"
            value={color}
            onChange={(e) => {
              setKeyword((k) => ({
                ...k,
                color: e.target.value,
              }));
            }}
          />
          <Button
            size="small"
            disabled={tag?.length < 3}
            label={`create #${tag}`}
            variant="contained"
            onClick={() => {
              doKeywordCreate();
            }}
          />
        </Box>
      ) : null}
    </Box>
  );
};

export default ReferenceArrayKeywordInput;
