import { OpenAICreateEventFromTextType } from "@liexp/shared/lib/io/http/Queue/CreateEventFromTextQueueData.js";
import { Queue } from "@liexp/shared/lib/io/http/index.js";
import JSONInput from "@liexp/ui/lib/components/Common/JSON/JSONInput.js";
import { Loader } from "@liexp/ui/lib/components/Common/Loader.js";
import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
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
  useRefresh,
  FormDataConsumer,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { Box, Stack } from "@liexp/ui/lib/components/mui/index.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import { colors } from "@liexp/ui/lib/theme/index.js";
import { getBorderLeftStyle } from "@liexp/ui/lib/utils/style.utils.js";
import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ProcessQueueJobButton: React.FC<ButtonProps> = () => {
  const apiProvider = useDataProvider();
  const record = useRecordContext<Queue.Queue>();
  const processQueueJob: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (!record) return;

    e.preventDefault();

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
      choices={Queue.QueueResourceNames.types.map((resource) => ({
        id: resource.value,
        name: resource.value,
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

const getBorderStyleFromStatus = (status: string) => {
  if (status === "failed") {
    return getBorderLeftStyle(colors.lightRed);
  }
  if (status === "completed") {
    return getBorderLeftStyle(colors.lightGreen);
  }

  if (status === "processing") {
    return getBorderLeftStyle(colors.lightBlue);
  }

  if (status === "pending") {
    return getBorderLeftStyle(colors.lightYellow);
  }

  return {};
};

export const QueueList: React.FC<ListProps> = (props) => {
  return (
    <List {...props} resource="queues" filters={filters}>
      <Datagrid
        rowClick={(id, resource, record) => {
          return `/${resource}/${record.type}/${record.resource}/${id}`;
        }}
        rowSx={(record) => getBorderStyleFromStatus(record.status)}
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
              </Stack>
            );
          }}
        />
        <ProcessQueueJobButton />
        <DateField label="Updated At" source="updatedAt" showTime={true} />
        <DateField label="Created At" source="createdAt" showTime={true} />
      </Datagrid>
    </List>
  );
};

const RetryQueueJobButton: React.FC<{
  type: string;
  resource: string;
  id: string;
}> = ({ type, resource, id }) => {
  const refresh = useRefresh();
  const api = useDataProvider();
  const record = useRecordContext<Queue.Queue>();

  const onClick = () => {
    void api
      .put(`queues/${type}/${resource}/${id}`, {
        ...record,
        status: "pending",
        data: { ...record?.data, result: undefined },
        error: null,
        id,
      })
      .finally(() => {
        refresh();
      });
  };

  if (!record) {
    return <Loader />;
  }

  return <Button label="Retry" variant="contained" onClick={onClick} />;
};

const transformQueue: TransformData = (data) => ({
  ...data,
  value: JSON.stringify(data.value),
});

export const QueueEdit: React.FC<Omit<EditProps, "children">> = (props) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [_, type, resource, id] = location.pathname
    .split("/")
    .filter((v) => v !== "");

  return (
    <Edit
      resource={`queues/${type}/${resource}`}
      {...props}
      id={id}
      title="Create a custom Queue"
      transform={(data) => {
        return {
          ...data,
          prompt:
            Array.isArray(data.prompt) && data.prompt.length === 0
              ? null
              : data.prompt,
          result:
            Array.isArray(data.result) && data.result.length === 0
              ? null
              : data.result,
        };
      }}
    >
      <SimpleForm>
        <Stack
          spacing={1}
          direction="row"
          alignItems={"center"}
          justifyContent={"center"}
        >
          <SelectQueueResourceInput size="small" />
          <SlugInput source="id" size="small" />
          <Box display="flex">
            <Button
              label="Go to resource"
              size="small"
              variant="contained"
              onClick={() => {
                navigate(`/${resource}/${id}`);
              }}
            />
          </Box>
        </Stack>

        <Stack spacing={1} direction="row" alignItems={"center"}>
          <SelectQueueStatusInput size="small" />
          <SelectQueueTypeInput size="small" />
          <RetryQueueJobButton resource={resource} type={type} id={id} />
        </Stack>

        <JSONInput source="data" />
        <BlockNoteInput source="prompt" defaultValue={null} />
        <FormDataConsumer>
          {({ formData }) => {
            if (OpenAICreateEventFromTextType.is(formData.type)) {
              return (
                <JSONInput
                  source="result"
                  parseJSON={typeof formData.result === "string"}
                />
              );
            }

            return <BlockNoteInput source="result" defaultValue={null} />;
          }}
        </FormDataConsumer>

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
