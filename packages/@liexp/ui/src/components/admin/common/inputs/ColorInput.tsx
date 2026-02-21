import {
  generateRandomColor,
  toColorHash,
} from "@liexp/shared/lib/utils/colors.js";
import get from "lodash/get.js";
import * as React from "react";
import { useRecordContext, type TextInputProps, useInput } from "react-admin";
import { useTheme } from "../../../../theme/index.js";
import {
  TextField,
  FormControl,
  Stack,
  IconButton,
  Icons,
  useMuiMediaQuery,
} from "../../../mui/index.js";

export const ColorInput: React.FC<TextInputProps> = ({
  source,
  value,
  ...props
}) => {
  const record = useRecordContext();
  const theme = useTheme();
  const isMobile = useMuiMediaQuery(theme.breakpoints.down("sm"));
  const { field } = useInput({
    source,
    defaultValue: value ?? get(record, source) ?? generateRandomColor(),
  });

  return (
    <FormControl fullWidth>
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={isMobile ? 1 : 2}
        alignItems={isMobile ? "stretch" : "center"}
        justifyContent={isMobile ? "flex-start" : "flex-start"}
        style={{
          border: `2px solid ${toColorHash(field.value)}`,
          padding: isMobile ? "8px 12px" : "10px 20px",
        }}
      >
        <IconButton
          color="inherit"
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
          fullWidth={isMobile}
          style={isMobile ? {} : { width: 80 }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            field.onChange({ target: { value: e.target.value } });
          }}
        />
      </Stack>
    </FormControl>
  );
};
