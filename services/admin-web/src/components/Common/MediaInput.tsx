import { MediaType } from "@liexp/shared/io/http/Media";
import { Box } from "@liexp/ui/components/mui";
import * as React from "react";
import { FileInput, SelectInput, FormDataConsumer, InputProps } from "react-admin";
import { MediaField } from "./MediaField";

interface MediaInputProps extends Omit<InputProps, "source"> {
  sourceType: string;
  sourceLocation: string;
  supportedTypes?: MediaType[];
}

export const MediaInput: React.FC<MediaInputProps> = ({
  sourceType,
  sourceLocation,
  supportedTypes,
  ...props
}) => {
  const types = supportedTypes ?? MediaType.types.map((a) => a.value);

  return (
    <Box>
      <FileInput
        {...props}
        source={sourceLocation}
        accept={types.map((a) => `.${a.split("/")[1]}`).join(",")}
      >
        <MediaField source={sourceType} />
      </FileInput>
      <FormDataConsumer>
        {({ formData, scopedFormData, getSource, ...rest }) => {
          const mediaType = formData[sourceLocation]?.rawFile?.type;

          if (!mediaType) {
            return null;
          }

          return (
            <Box>
              <SelectInput
                {...rest}
                fullWidth
                source={sourceType}
                choices={MediaType.types.map((v) => ({
                  id: v.value,
                  name: v.value,
                }))}
                defaultValue={mediaType}
              />
            </Box>
          );
        }}
      </FormDataConsumer>
    </Box>
  );
};
