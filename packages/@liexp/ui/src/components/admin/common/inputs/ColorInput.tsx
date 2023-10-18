import {
  generateRandomColor,
  toColorHash,
} from "@liexp/shared/lib/utils/colors";
import get from "lodash/get";
import * as React from "react";
import { Button, useRecordContext, type TextInputProps } from "react-admin";
import { Box, TextField, FormControl } from "../../../mui";

export const ColorInput: React.FC<TextInputProps> = ({
  source,
  value,
  ...props
}) => {
  const record = useRecordContext();
  const _color = get(record, source) ?? value;

  const [{ color }, setColor] = React.useState({
    color: _color ?? generateRandomColor(),
  });

  return (
    <FormControl>
      <Box
        display="flex"
        style={{
          alignItems: "center",
          justifyContent: "center",
          border: `2px solid ${toColorHash(color)}`,
          padding: "10px 20px",
        }}
      >
        <Button
          size="small"
          label="random"
          variant="contained"
          onClick={() => {
            const color = generateRandomColor();
            setColor({ color });
            props.onChange?.({ target: { value: color } });
          }}
        />
        <TextField
          size="small"
          label={props.label ?? "color"}
          value={color}
          style={{ width: 80 }}
          onChange={(e: any) => {
            setColor({ color: e.target.value });
            props.onChange?.(e);
          }}
        />
      </Box>
    </FormControl>
  );
};
