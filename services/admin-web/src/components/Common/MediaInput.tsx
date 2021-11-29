import { MediaType } from "@econnessione/shared/io/http/Media";
import { Box } from "@material-ui/core";
import { FormDataConsumer, InputProps } from "ra-core";
import { FileInput, SelectInput } from "ra-ui-materialui";
import * as React from "react";
import { MediaField } from "./MediaField";

interface MediaInputProps extends Omit<InputProps, "source"> {
  sourceType: string;
  sourceLocation: string;
}

export const MediaInput: React.FC<MediaInputProps> = ({
  sourceType,
  sourceLocation,
  ...props
}) => {
  return (
    <Box>
      <SelectInput
        {...props}
        source={sourceType}
        choices={MediaType.types.map((v) => ({ id: v.value, name: v.value }))}
        defaultValue={MediaType.types[0].value}
      />
      <FormDataConsumer>
        {({ formData, scopedFormData, getSource, ...rest }) => {
          const mediaType = formData[sourceType] ?? MediaType.types[0].value;
          const accept = [mediaType.split("/")[1]];

          return (
            <Box>
              <FileInput
                {...rest}
                source={sourceLocation}
                accept={accept.map((a) => `.${a}`).join(",")}
              >
                <MediaField type={formData[sourceType]} source="src" />
              </FileInput>
            </Box>
          );
        }}
      </FormDataConsumer>
    </Box>
  );
};
