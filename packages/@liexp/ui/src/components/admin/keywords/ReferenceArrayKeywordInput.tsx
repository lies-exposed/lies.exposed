import { generateRandomColor } from "@liexp/shared/utils/colors";
import React from "react";
import {
  AutocompleteArrayInput,
  Button,
  ReferenceArrayInput,
  type ReferenceInputProps,
  useRefresh,
  // AutocompleteInput,
} from "react-admin";
import { apiProvider } from "../../../client/api";
import { Box, TextField } from "../../mui";
import { ImportKeywordButton } from './ImportKeywordButton';

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
      {showAdd ? (
        <ImportKeywordButton />
      ): null}
      {showAdd ? (
        <Box style={{ display: "flex" }}>
          <TextField
            value={tag}
            onChange={(e) => {
              setKeyword((k) => ({ ...k, tag: e.target.value }));
            }}
          />
          <Box
            display="flex"
            style={{
              alignItems: "center",
              justifyContent: "center",
              background: `#${color}`,
              margin: "0 20px",
            }}
          >
            <Button
              size="small"
              label="random"
              variant="contained"
              onClick={() => {
                setKeyword((k) => ({ ...k, color: generateRandomColor() }));
              }}
            />
            <TextField
              size="small"
              value={color}
              style={{ width: 80 }}
              onChange={(e) => {
                setKeyword((k) => ({ ...k, color: e.target.value as any }));
              }}
            />
          </Box>
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
