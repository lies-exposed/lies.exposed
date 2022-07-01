import { SCIENTIFIC_STUDY } from "@liexp/shared/io/http/Events/ScientificStudy";
import { Box, Button, TextField } from "@liexp/ui/components/mui";
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

  const handleSubmit = React.useCallback((url: string) => {
    void dataProvider
      .get("open-graph/metadata", { url, type })
      .then((result) => {
        setMetadata(result.data);
      });
  }, [value]);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback((e) => {
      onChange(e.currentTarget.value);
    }, []);

  return (
    <Box width={"100%"} style={{ display: "flex" }} flexDirection="row">
      <Box>
        <TextInput
          {...props}
          {...rest}
          {...inputRest}
          type="url"
          onChange={handleChange}
        />
        <Box>
          {metadata?.link ? <Box>Link found: {metadata.link.id}</Box> : null}
          {metadata?.metadata ? (
            <Box display="inline" marginLeft={2} flexBasis={"60%"}>
              {Object.entries<string>(metadata.metadata).map(([k, v]) => {
                const value = v ?? ""
                return (
                  <Box key={k} width={"100%"}>
                    <label>{k}</label>
                    <TextField
                      name={`metadata.${k}`}
                      type="text"
                      value={value}
                      multiline={value.length > 30}
                      contentEditable={false}
                      fullWidth={true}
                    />
                  </Box>
                );
              })}
            </Box>
          ) : null}
        </Box>
      </Box>
      <Box>
        <Button
          disabled={value?.length < 5}
          onClick={() => {
            window.open(value, "_blank");
          }}
        >
          Open URL
        </Button>
        <Button disabled={value?.length < 5} onClick={() => {
          handleSubmit(value);
        }}>
          Get Metadata
        </Button>
      </Box>
    </Box>
  );
};

export default URLMetadataInput;
