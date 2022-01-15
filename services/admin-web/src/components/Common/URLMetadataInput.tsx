import {
  Box,
  TextField,
  TextareaAutosize,
  Typography,
} from "@material-ui/core";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { TextInput, TextInputProps, useInput } from "react-admin";
import { dataProvider } from "../../client/HTTPAPI";

interface URLMetadataInputProps extends TextInputProps {}

const URLMetadataInput: React.FC<URLMetadataInputProps> = ({
  onMetadataReceived,
  ...props
}) => {
  const {
    input: { onChange, ...inputRest },
    ...rest
  } = useInput(props);

  const [metadata, setMetadata] = React.useState(undefined);

  const handleChange: React.ChangeEventHandler<HTMLInputElement> =
    React.useCallback((e) => {
      console.log("handle change", e);
      onChange(e);
      const value = e.currentTarget.value;
      if (value) {
        void dataProvider
          .get("open-graph/metadata", { url: value })
          .then((result) => {
            console.log(result);
            setMetadata(result.data);
          });
      } else onChange(e.currentTarget.value);
    }, []);

  return (
    <Box width={"100%"} style={{ display: "flex" }} flexDirection="row">
      <TextInput
        {...props}
        {...rest}
        {...(inputRest as any)}
        onChange={handleChange}
      />
      {metadata ? (
        <Box display="inline" marginLeft={2} flexBasis={"60%"}>
          {Object.entries<string>(metadata).map(([key, value]) => {
            return (
              <Box key={key} width={"100%"}>
                <label>{key}</label>
                <TextField
                  name={`metadata.${key}`}
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
  );
};

export default URLMetadataInput;
