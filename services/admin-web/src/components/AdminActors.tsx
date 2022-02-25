import { http } from "@liexp/shared/io";
import { uuid } from "@liexp/shared/utils/uuid";
import { ActorPageContent } from "@liexp/ui/components/ActorPageContent";
import { ValidationErrorsLayout } from "@liexp/ui/components/ValidationErrorsLayout";
import ReactPageInput from "@liexp/ui/components/admin/ReactPageInput";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import {
  ArrayInput,
  AutocompleteInput,
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  EditProps,
  Filter,
  FormDataConsumer,
  FormTab,
  FunctionField,
  ImageField,
  ImageInput,
  List,
  ListProps,
  Record,
  ReferenceArrayField,
  ReferenceInput,
  ReferenceManyField,
  SimpleForm,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import { ColorInput } from "react-admin-color-input";
import { AvatarField } from "./Common/AvatarField";
import { WebPreviewButton } from "./Common/WebPreviewButton";
import { dataProvider } from "@client/HTTPAPI";
import { uploadImages } from "@client/MediaAPI";

const ActorFilters: React.FC = (props) => {
  return (
    <Filter {...props}>
      <TextInput label="fullName" source="fullName" alwaysOn size="small" />
    </Filter>
  );
};

export const ActorList: React.FC<ListProps> = (props) => (
  <List {...props} resource="actors" filters={<ActorFilters />} perPage={50}>
    <Datagrid
      rowClick="edit"
      rowStyle={(r) => ({
        borderLeft: `5px solid #${r.color}`,
      })}
    >
      <TextField source="fullName" />
      <TextField source="username" />
      <AvatarField source="avatar" />
      <FunctionField label="Groups" render={(r) => r.memberIn.length} />
      <DateField source="updatedAt" showTime={true} />
    </Datagrid>
  </List>
);

const transformActor = async (id: string, data: Record): Promise<Record> => {
  const imagesTask = data.avatar?.rawFile
    ? uploadImages(dataProvider)("actors", id, [
        { file: data.avatar.rawFile, type: data.avatar.rawFile.type },
      ])
    : TE.right([{ location: data.avatar }]);

  // eslint-disable-next-line @typescript-eslint/return-await
  return pipe(
    imagesTask,
    TE.map(([avatar]) => ({
      ...data,
      id,
      avatar: avatar.location,
    }))
  )().then((result) => {
    if (result._tag === "Left") {
      return Promise.reject(result.left);
    }
    return result.right;
  });
};

const EditTitle: React.FC = ({ record }: any) => {
  return <span>Actor {record.fullName}</span>;
};

export const ActorEdit: React.FC<EditProps> = (props) => (
  <Edit
    title={<EditTitle {...props} />}
    {...props}
    actions={
      <>
        <WebPreviewButton resource="actors" record={{ id: props.id } as any} />
      </>
    }
    transform={({ newMemberIn, ...a }) =>
      transformActor(a.id as any, {
        ...a,
        memberIn: a.memberIn.concat(
          newMemberIn.map((m: any) => ({
            ...m,
            endDate: m.endDate !== "" ? m.endDate : undefined,
          }))
        ),
      })
    }
  >
    <TabbedForm>
      <FormTab label="generals">
        <ImageField source="avatar" />
        <ColorInput source="color" />
        <TextInput source="username" />
        <TextInput source="fullName" />
        <ReactPageInput source="excerpt" onlyText={true} />
        <DateField source="createdAt" />
        <DateField source="updatedAt" />
      </FormTab>
      <FormTab label="Avatar">
        <ImageInput source="avatar">
          <ImageField source="src" />
        </ImageInput>
      </FormTab>

      <FormTab label="Content">
        <ReactPageInput source="body" />
      </FormTab>

      <FormTab label="Groups">
        <ArrayInput source="newMemberIn" defaultValue={[]}>
          <SimpleFormIterator>
            <ReferenceInput source="group" reference="groups">
              <AutocompleteInput optionText="name" />
            </ReferenceInput>
            <DateInput source="startDate" />
            <DateInput source="endDate" />
            <ReactPageInput onlyText={true} source="body" />
          </SimpleFormIterator>
        </ArrayInput>

        <ReferenceArrayField source="memberIn" reference="groups-members">
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="group.name" />
            <DateField source="startDate" />
            <DateField source="endDate" defaultValue={undefined} />
          </Datagrid>
        </ReferenceArrayField>
      </FormTab>
      <FormTab label="Events">
        <ReferenceManyField
          label="Events"
          source="id"
          target="actors[]"
          reference="events"
        >
          <Datagrid>
            <TextField source="id" />
            <TextField source="title" />
            <DateField source="createdAt" />
          </Datagrid>
        </ReferenceManyField>
      </FormTab>
      <FormTab label="Preview">
        <FormDataConsumer>
          {({ formData, ...rest }) => {
            return pipe(
              http.Actor.Actor.decode(formData),
              E.fold(ValidationErrorsLayout, (p) => (
                <ActorPageContent
                  actor={p}
                  groups={[]}
                  onGroupClick={() => {}}
                />
              ))
            );
          }}
        </FormDataConsumer>
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const ActorCreate: React.FC<CreateProps> = (props) => (
  <Create
    {...props}
    title="Create an Actor"
    transform={(a) => transformActor(uuid(), a)}
  >
    <SimpleForm>
      <ColorInput source="color" />
      <TextInput source="username" />
      <TextInput source="fullName" />
      <ImageInput source="avatar">
        <ImageField />
      </ImageInput>
      <ReactPageInput source="excerpt" onlyText={true} />
      <ReactPageInput source="body" />
    </SimpleForm>
  </Create>
);
