import React from "react";
import {
  AutocompleteArrayInput,
  Datagrid,
  ReferenceArrayField,
  ReferenceArrayInput,
  TextField,
  type ReferenceArrayInputProps,
  type ReferenceArrayFieldProps,
  type ReferenceFieldProps,
  type RaRecord,
} from "react-admin";
import { Box } from "../../mui";

const ReferenceArrayAreaInput: React.FC<
  Omit<ReferenceArrayInputProps, "children"> & { source: string }
> = (props) => {
  return (
    <ReferenceArrayInput {...props} label="Areas" reference="areas">
      <AutocompleteArrayInput
        source="id"
        optionText="label"
        translateChoice={false}
        fullWidth
        filterToQuery={(q: any) => ({ q })}
        size="small"
      />
    </ReferenceArrayInput>
  );
};

export const ReferenceArrayAreaField: React.FC<
  Omit<ReferenceArrayFieldProps, "reference">
> = (props) => {
  return (
    <ReferenceArrayField {...props} reference="areas">
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <TextField source="label" />
      </Datagrid>
    </ReferenceArrayField>
  );
};

const ReferenceAreaTab: React.FC<
  Omit<ReferenceFieldProps<RaRecord<string>>, "reference">
> = ({ source }) => {
  return (
    <Box style={{ width: '100%' }}>
      <ReferenceArrayAreaInput source={source} fullWidth />
      <ReferenceArrayAreaField source={source} />
    </Box>
  );
};

export default ReferenceAreaTab;
