import { SCIENTIFIC_STUDY } from "@liexp/shared/io/http/Events/ScientificStudy";
import { Box, Button, TextField } from "@mui/material";
import * as React from "react";
import { TextInput, TextInputProps, useInput } from "react-admin";
import { dataProvider } from "../../client/HTTPAPI";

interface URLMetadataInputProps extends TextInputProps {
  type: SCIENTIFIC_STUDY | "Link";
}

const URLMetadataInput: React.FC<URLMetadataInputProps> = ({
  type,
  ...props
}) => {
  const {
    field: { onChange, value, ...inputRest },
    formState,
    fieldState,
    ...rest
  } = useInput(props);

  const [metadata, setMetadata] = React.useState(undefined);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback((e) => {
      onChange(e);
      const value = e.currentTarget.value;
      if (value) {
        void dataProvider
          .get("open-graph/metadata", { url: value, type })
          .then((result) => {
            setMetadata(result.data);
          });
      } else onChange(e.currentTarget.value);
    }, []);

  return (
    <Box width={"100%"} style={{ display: "flex" }} flexDirection="row">
      <TextInput
        {...props}
        {...rest}
        {...inputRest}
        onChange={handleChange}
      />

      <Button disabled={value?.length < 5} onClick={() => {}}>
        Create
      </Button>
      {metadata?.link ? <Box>Link found: {metadata.link.id}</Box> : null}
      {metadata?.metadata ? (
        <Box display="inline" marginLeft={2} flexBasis={"60%"}>
          {Object.entries<string>(metadata.metadata).map(([k, v]) => {
            return (
              <Box key={k} width={"100%"}>
                <label>{k}</label>
                <TextField
                  name={`metadata.${k}`}
                  type="text"
                  value={v}
                  multiline={v.length > 30}
                  contentEditable={false}
                  fullWidth={true}
                />
              </Box>
            );
          })}
        </Box>
      ) : null}
    </Box>
  );
};

export default URLMetadataInput;
