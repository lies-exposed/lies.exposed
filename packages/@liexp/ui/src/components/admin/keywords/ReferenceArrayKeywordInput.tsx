import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import * as React from "react";
import {
  AutocompleteArrayInput,
  Button,
  ReferenceArrayInput,
  useRefresh,
  type ReferenceInputProps,
} from "react-admin";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import { Box, Stack, TextField } from "../../mui/index.js";
import { ColorInput } from "../common/inputs/ColorInput.js";
import { ImportKeywordButton } from "./ImportKeywordButton.js";

const ReferenceArrayKeywordInput: React.FC<
  Omit<ReferenceInputProps, "children"> & {
    source: string;
    showAdd: boolean;
    fullWidth?: boolean;
  }
> = ({ showAdd, fullWidth, ...props }) => {
  const refresh = useRefresh();
  const apiProvider = useDataProvider();

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
    <Stack spacing={2}>
      <Stack direction="row" spacing={2}>
        <ReferenceArrayInput {...props} reference="keywords">
          <AutocompleteArrayInput
            size="small"
            optionText="tag"
            filterToQuery={(q) => ({ q })}
            fullWidth={fullWidth}
          />
        </ReferenceArrayInput>
        <Box>
          <ImportKeywordButton />
        </Box>
      </Stack>
      {showAdd ? (
        <Stack spacing={2} direction="row" width="100%">
          <TextField
            value={tag}
            placeholder="Insert new keyword"
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
        </Stack>
      ) : null}
    </Stack>
  );
};

export default ReferenceArrayKeywordInput;
