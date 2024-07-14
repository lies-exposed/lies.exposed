import { Queue } from "@liexp/shared/lib/io/http/index.js";
import JSONInput from "@liexp/ui/lib/components/Common/JSON/JSONInput.js";
import { SlugInput } from "@liexp/ui/lib/components/admin/common/inputs/SlugInput.js";
import {
  Create,
  Datagrid,
  DateField,
  Edit,
  FunctionField,
  List,
  SimpleForm,
  TextField,
  SelectInput,
  type CreateProps,
  type ListProps,
  type TransformData,
  Button,
  useRecordContext,
  TextInput,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { Stack } from "@liexp/ui/lib/components/mui/index.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import * as React from "react";
import { useLocation } from "react-router-dom";

const ProcessQueueJobButton: React.FC = () => {
  const apiProvider = useDataProvider();
  const record = useRecordContext<Queue.Queue>();
  const processQueueJob = () => {
    if (!record) return;

    void apiProvider.create(
      `queues/${record.type}/${record.resource}/${record.id}/process`,
      {
        data: record.data,
      },
    );
  };

  return (
    <Button
      label="process queue job"
      onClick={processQueueJob}
      variant="contained"
      size="small"
    />
  );
};

export const QueueList: React.FC<ListProps> = (props) => {
  return (
    <List {...props} resource="queues">
      <Datagrid
        rowClick={(id, resource, record) => {
          return `/${resource}/${record.type}/${record.resource}/${id}`;
        }}
      >
        <TextField label="key" source="id" />
        <TextField source="status" />
        <TextField source="type" />
        <TextField source="resource" />
        <FunctionField
          render={(r) => {
            return (
              <Stack>
                <pre>{JSON.stringify(r.data, null, 2)}</pre>
                <ProcessQueueJobButton />
              </Stack>
            );
          }}
        />
        <DateField label="Updated At" source="updatedAt" showTime={true} />
        <DateField label="Created At" source="createdAt" showTime={true} />
      </Datagrid>
    </List>
  );
};

const transformQueue: TransformData = (data) => ({
  ...data,
  value: JSON.stringify(data.value),
});

export const QueueEdit: React.FC<CreateProps> = (props) => {
  const location = useLocation();
  const [_, type, resource, id] = location.pathname
    .split("/")
    .filter((v) => v !== "");

  return (
    <Edit
      resource={`queues/${type}/${resource}`}
      {...props}
      id={id}
      title="Create a custom Queue"
    >
      <SimpleForm>
        <SlugInput source="id" />
        <TextInput source="status" />
        <JSONInput source="data" />
        <ProcessQueueJobButton />
      </SimpleForm>
    </Edit>
  );
};

export const QueueCreate: React.FC<CreateProps> = (props) => (
  <Create {...props} title="Create a custom Queue" transform={transformQueue}>
    <SimpleForm>
      <SlugInput source="id" />
      <SelectInput
        source="type"
        choices={Queue.QueueTypes.types.map((resource) => ({
          id: resource.value,
          name: resource.value,
        }))}
      />
      <SelectInput
        source="resource"
        choices={Object.keys(Queue.QueueResourceNames.keys).map((resource) => ({
          id: resource,
          name: resource,
        }))}
      />
      <JSONInput source="data" />
    </SimpleForm>
  </Create>
);
