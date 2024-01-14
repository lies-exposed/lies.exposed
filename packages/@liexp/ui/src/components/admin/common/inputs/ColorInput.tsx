import {
  generateRandomColor,
  toColorHash,
} from "@liexp/shared/lib/utils/colors.js";
import get from "lodash/get.js";
import * as React from "react";
import {
  Button,
  useRecordContext,
  type TextInputProps,
  useInput,
} from "react-admin";
import { Box, TextField, FormControl } from "../../../mui/index.js";

export const ColorInput: React.FC<TextInputProps> = ({
  source,
  value,
  ...props
}) => {
  const record = useRecordContext();
  const { field } = useInput({
    source,
    defaultValue: value ?? get(record, source) ?? generateRandomColor(),
  });

  return (
    <FormControl>
      <Box
        display="flex"
        style={{
          alignItems: "center",
          justifyContent: "center",
          border: `2px solid ${toColorHash(field.value)}`,
          padding: "10px 20px",
        }}
      >
        <Button
          size="small"
          label="random"
          variant="contained"
          onClick={() => {
            const color = generateRandomColor();
            field.onChange({ target: { value: color } });
          }}
        />
        <TextField
          size="small"
          label={props.label ?? "color"}
          value={field.value}
          style={{ width: 80 }}
          onChange={(e: any) => {
            field.onChange({ target: { value: e.target.value } });
          }}
        />
      </Box>
    </FormControl>
  );
};
