import { Queue } from "@liexp/shared/lib/io/http/index.js";
import JSONInput from "@liexp/ui/lib/components/Common/JSON/JSONInput.js";
import { SlugInput } from "@liexp/ui/lib/components/admin/common/inputs/SlugInput.js";
import {
  Button,
  Create,
  Datagrid,
  DateField,
  Edit,
  FunctionField,
  List,
  SelectInput,
  type SelectInputProps,
  SimpleForm,
  TextField,
  useRecordContext,
  type CreateProps,
  type ListProps,
  type TransformData,
  type ButtonProps,
  type EditProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { Stack } from "@liexp/ui/lib/components/mui/index.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import * as React from "react";
import { useLocation } from "react-router-dom";

const ProcessQueueJobButton: React.FC<ButtonProps> = () => {
  const apiProvider = useDataProvider();
  const record = useRecordContext<Queue.Queue>();
  const processQueueJob: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
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

const SelectQueueTypeInput: React.FC<SelectInputProps> = ({
  source = "type",
  ...props
}) => (
  <SelectInput
    label={source}
    source={source}
    {...props}
    choices={Queue.QueueTypes.types.map((resource) => ({
      id: resource.value,
      name: resource.value,
    }))}
  />
);
const SelectQueueResourceInput: React.FC<SelectInputProps> = ({
  source = "resource",
  ...props
}) => {
  return (
    <SelectInput
      label={source}
      source={source}
      {...props}
      choices={Object.keys(Queue.QueueResourceNames.keys).map((resource) => ({
        id: resource,
        name: resource,
      }))}
    />
  );
};

const SelectQueueStatusInput: React.FC<SelectInputProps> = ({
  source = "status",
  ...props
}) => {
  return (
    <SelectInput
      label={source}
      source={source}
      {...props}
      choices={Queue.Status.types.map((resource) => ({
        id: resource.value,
        name: resource.value,
      }))}
    />
  );
};

const filters = [
  <SelectQueueTypeInput key="type" alwaysOn />,
  <SelectQueueResourceInput key="resource" alwaysOn />,
  <SelectQueueStatusInput key="status" alwaysOn />,
];

export const QueueList: React.FC<ListProps> = (props) => {
  return (
    <List {...props} resource="queues" filters={filters}>
      <Datagrid
        rowClick={(id, resource, record) => {
          return `/${resource}/${record.type}/${record.resource}/${id}`;
        }}
        rowSx={(record) => {
          if (record.status === "failed") {
            return { backgroundColor: "#ffcccc" };
          }
          if (record.status === "completed") {
            return { backgroundColor: "#ccffcc" };
          }
          return {};
        }}
      >
        <TextField label="key" source="id" />
        <TextField source="status" />
        <TextField source="type" />
        <TextField source="resource" />
        <FunctionField
          render={(r) => {
            return (
              <Stack style={{ maxWidth: 400 }}>
                <pre style={{ maxWidth: "100%", overflow: "auto" }}>
                  {JSON.stringify(r.data, null, 2)}
                </pre>
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

export const QueueEdit: React.FC<Omit<EditProps, "children">> = (props) => {
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
        <SelectQueueStatusInput />
        <SelectQueueResourceInput />
        <SelectQueueTypeInput />
        <JSONInput source="data" />
        <JSONInput source="error" />
        <ProcessQueueJobButton />
      </SimpleForm>
    </Edit>
  );
};

export const QueueCreate: React.FC<CreateProps> = (props) => (
  <Create {...props} title="Create a custom Queue" transform={transformQueue}>
    <SimpleForm>
      <SlugInput source="id" />
      <SelectQueueTypeInput />
      <SelectQueueStatusInput />
      <SelectQueueResourceInput />
      <JSONInput source="data" />
    </SimpleForm>
  </Create>
);
