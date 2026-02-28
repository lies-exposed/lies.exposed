import {
  generateRandomColor,
  toColorHash,
} from "@liexp/shared/lib/utils/colors.js";
import get from "lodash/get.js";
import * as React from "react";
import { useRecordContext, type TextInputProps, useInput } from "react-admin";
import { useFormContext } from "react-hook-form";
import { useTheme } from "../../../../theme/index.js";
import {
  TextField,
  FormControl,
  Stack,
  IconButton,
  Icons,
  useMuiMediaQuery,
} from "../../../mui/index.js";

/**
 * ColorInput works in two modes:
 *
 * 1. Inside a react-admin <Form> — delegates to `useInput` so the value is
 *    registered with react-hook-form and participates in form submission.
 *
 * 2. Outside a form (e.g. inside a plain MUI Dialog like BuildImageButton) —
 *    falls back to a plain controlled `useState`, driven by the `value` /
 *    `onChange` props that the caller already provides.
 */
const ColorInputWithForm: React.FC<TextInputProps & { isMobile: boolean }> = ({
  source,
  value,
  isMobile,
  ...props
}) => {
  const record = useRecordContext();
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
        justifyContent="flex-start"
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

const ColorInputStandalone: React.FC<
  TextInputProps & { isMobile: boolean }
> = ({ value: valueProp, onChange, label, isMobile }) => {
  const [value, setValue] = React.useState<string>(
    (valueProp as string | undefined) ?? generateRandomColor(),
  );

  React.useEffect(() => {
    if (valueProp !== undefined) {
      setValue(valueProp as string);
    }
  }, [valueProp]);

  const handleChange = (newValue: string): void => {
    setValue(newValue);
    onChange?.({ target: { value: newValue } } as any);
  };

  return (
    <FormControl fullWidth>
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={isMobile ? 1 : 2}
        alignItems={isMobile ? "stretch" : "center"}
        justifyContent="flex-start"
        style={{
          border: `2px solid ${toColorHash(value)}`,
          padding: isMobile ? "8px 12px" : "10px 20px",
        }}
      >
        <IconButton
          color="inherit"
          size="small"
          onClick={() => {
            handleChange(generateRandomColor());
          }}
        >
          <Icons.Refresh style={{ stroke: toColorHash(value) }} />
        </IconButton>
        <TextField
          size="small"
          label={label ?? "color"}
          value={value}
          fullWidth={isMobile}
          style={isMobile ? {} : { width: 80 }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleChange(e.target.value);
          }}
        />
      </Stack>
    </FormControl>
  );
};

export const ColorInput: React.FC<TextInputProps> = ({
  source,
  value,
  ...props
}) => {
  const formContext = useFormContext();
  const theme = useTheme();
  const isMobile = useMuiMediaQuery(theme.breakpoints.down("sm"));

  if (formContext === null) {
    return (
      <ColorInputStandalone
        source={source}
        value={value}
        isMobile={isMobile}
        {...props}
      />
    );
  }

  return (
    <ColorInputWithForm
      source={source}
      value={value}
      isMobile={isMobile}
      {...props}
    />
  );
};
