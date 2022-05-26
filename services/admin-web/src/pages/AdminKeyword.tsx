import { toColor } from "@liexp/shared/io/http/Common";
import * as React from "react";
import {
  AutocompleteArrayInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  Edit, List,
  ListProps,
  ReferenceArrayInput,
  SimpleForm,
  TextField,
  TextInput,
  useRecordContext
} from "react-admin";
import { ColorInput } from "../components/Common/ColorInput";

const RESOURCE = "keywords";

const keywordsFilter = [
  <ReferenceArrayInput
    key="keywords"
    source="events"
    reference="events"
    alwaysOn
  >
    <AutocompleteArrayInput optionText="title" />
  </ReferenceArrayInput>,
];

export const KeywordList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    resource={RESOURCE}
    filters={keywordsFilter}
    perPage={20}
  >
    <Datagrid
      rowClick="edit"
      rowStyle={(r) => ({
        borderLeft: `5px solid #${r.color}`,
      })}
    >
      <TextField source="tag" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const EditTitle: React.FC = () => {
  const record = useRecordContext();

  return <span>Keyword {record?.title}</span>;
};

export const KeywordEdit: React.FC = () => {
  return (
    <Edit
      title={<EditTitle />}
      transform={({ newEvents, ...r }) => {
        return {
          ...r,
          color: toColor(r.color),
          events: (r.events ?? []).concat(newEvents ?? []),
        };
      }}
    >
      <SimpleForm>
        <TextInput source="tag" />
        <ColorInput source="color" />
      </SimpleForm>
    </Edit>
  );
};

export const KeywordCreate: React.FC<CreateProps> = (props) => {
  return (
    <Create
      title="Create a Keyword"
      {...props}
      transform={(r) => ({
        ...r,
        color: r.color.replace("#", ""),
      })}
    >
      <SimpleForm>
        <TextInput source="tag" type="string" />
        <ColorInput source="color" />
      </SimpleForm>
    </Create>
  );
};
