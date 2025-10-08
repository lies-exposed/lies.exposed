import {
  generateRandomColor,
  toColorHash,
} from "@liexp/shared/lib/utils/colors.js";
import get from "lodash/get.js";
import * as React from "react";
import { useRecordContext, type TextInputProps, useInput } from "react-admin";
import {
  TextField,
  FormControl,
  Stack,
  IconButton,
  Icons,
} from "../../../mui/index.js";

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
      <Stack
        direction="row"
        spacing={2}
        alignItems={"center"}
        justifyContent="center"
        style={{
          border: `2px solid ${toColorHash(field.value)}`,
          padding: "10px 20px",
        }}
      >
        <IconButton
          size="small"
          onClick={() => {
            const color = generateRandomColor();
            field.onChange({ target: { value: color } });
          }}
        >
          <Icons.Refresh style={{ stroke: toColorHash(field.value) }} />
        </IconButton>
        <TextField
          size="small"
          label={props.label ?? "color"}
          value={field.value}
          style={{ width: 80 }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            field.onChange({ target: { value: e.target.value } });
          }}
        />
      </Stack>
    </FormControl>
  );
};
