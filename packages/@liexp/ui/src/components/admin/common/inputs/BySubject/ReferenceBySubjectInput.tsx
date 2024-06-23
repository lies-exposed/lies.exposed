import {
  ByActorId,
  ByGroupId,
} from "@liexp/shared/lib/io/http/Common/index.js";
import get from "lodash/get";
import * as React from "react";
import {
  FormDataConsumer,
  SelectInput,
  type ReferenceInputProps,
} from "react-admin";
import { Stack, TextField } from "../../../../mui/index.js";
import ReferenceActorInput from "../../../actors/ReferenceActorInput.js";
import ReferenceGroupInput from "../../../groups/ReferenceGroupInput.js";

const ReferenceBySubjectInput: React.FC<
  Omit<ReferenceInputProps, "children"> & { source?: string }
> = ({ source, ...props }) => {
  const typeSource = source ? `${source}.type` : `type`;
  const idSource = source ? `${source}.id` : `id`;

  return (
    <Stack direction={"row"} spacing={2}>
      <SelectInput
        {...props}
        source={typeSource}
        choices={[ByActorId, ByGroupId]
          .map((t) => t.type.props.type.value)
          .map((v) => ({
            id: v,
            name: v,
          }))}
      />

      <FormDataConsumer {...props}>
        {({ formData, scopedFormData, ...rest }) => {
          const type = get(formData, typeSource);
          if (type === "Actor") {
            return (
              <ReferenceActorInput {...props} {...rest} source={idSource} />
            );
          } else if (type === "Group") {
            return (
              <ReferenceGroupInput {...props} {...rest} source={idSource} />
            );
          }
          return <TextField defaultValue={"Select subject type"} disabled />;
        }}
      </FormDataConsumer>
    </Stack>
  );
};

export default ReferenceBySubjectInput;
