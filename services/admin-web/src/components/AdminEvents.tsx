import { http } from "@econnessione/shared/io";
import { uuid } from "@econnessione/shared/utils/uuid";
import { EventPageContent } from "@econnessione/ui/components/EventPageContent";
import { ValidationErrorsLayout } from "@econnessione/ui/components/ValidationErrorsLayout";
import { Box, Typography } from "@material-ui/core";
import PinDropIcon from "@material-ui/icons/PinDrop";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import GeometryType from "ol/geom/GeometryType";
import * as React from "react";
import {
  ArrayField,
  ArrayInput,
  AutocompleteArrayInput,
  BooleanInput,
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
  ReferenceArrayInput,
  required,
  SelectArrayInput,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import { AvatarField } from "./Common/AvatarField";
import { MapInput } from "./Common/MapInput";
import { MediaArrayInput } from "./Common/MediaArrayInput";
import { MediaField } from "./Common/MediaField";
import { MediaInput } from "./Common/MediaInput";
import ReactPageInput from "./Common/ReactPageInput";
import ReferenceArrayActorInput from "./Common/ReferenceArrayActorInput";
import ReferenceArrayGroupInput from "./Common/ReferenceArrayGroupInput";
import ReferenceArrayGroupMemberInput from "./Common/ReferenceArrayGroupMemberInput";
import ReferenceArrayKeywordInput from "./Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "./Common/ReferenceArrayLinkInput";
import RichTextInput from "./Common/RichTextInput";
import { WebPreviewButton } from "./Common/WebPreviewButton";
import { dataProvider } from "@client/HTTPAPI";
import { uploadFile } from "@client/MediaAPI";

const RESOURCE = "events";

const EventsFilter: React.FC = (props: any) => {
  return (
    <Filter {...props}>
      <TextInput source="title" alwaysOn size="small" />
      <ReferenceArrayGroupInput source="groups" alwaysOn />
      <ReferenceArrayActorInput source="actors" alwaysOn />
      <ReferenceArrayGroupMemberInput source="groupsMembers" />
      <DateInput source="startDate" />
      <DateInput source="endDate" />
    </Filter>
  );
};

export const EventList: React.FC<ListProps> = (props) => (
  <List
    {...props}
    resource={RESOURCE}
    filterDefaultValues={{
      _sort: "createdAt",
      _order: "DESC",
    }}
    filters={<EventsFilter />}
    perPage={20}
  >
    <Datagrid rowClick="edit">
      <FunctionField
        render={(r: any) => (
          <Box>
            <Typography variant="h6">{r.title}</Typography>
            <Typography variant="subtitle1">{r.excerpt}</Typography>
          </Box>
        )}
      />
      <FunctionField
        source="actors"
        render={(r: Record | undefined) => (r ? r.actors.length : 0)}
      />
      <FunctionField
        source="groups"
        render={(r: Record | undefined) => (r ? r.groups.length : 0)}
      />
      <FunctionField
        source="groupsMembers"
        render={(r: Record | undefined) => (r ? r.groupsMembers.length : 0)}
      />
      <FunctionField
        label="Location"
        source="location.coordinates"
        render={(r: Record | undefined) =>
          r?.location?.coordinates ? <PinDropIcon /> : "-"
        }
      />
      <FunctionField source="links" render={(r: any) => r.links?.length ?? 0} />
      <DateField source="startDate" />
      <DateField source="endDate" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const transformEvent = async (id: string, data: Record): Promise<Record> => {
  const newRawMedia: File[] = data.media.filter(
    (i: any) => i.location?.rawFile !== undefined
  );

  const newLinkedImages = data.media.filter(t.string.is);

  const oldMedia = data.media.filter((i: any) => i.id !== undefined);
  const mediaTask = pipe(
    A.sequence(TE.ApplicativePar)(
      newRawMedia.map((r: any) =>
        uploadFile(dataProvider)("media", uuid(), r.location.rawFile, r.type)
      )
    ),
    TE.map((urls) =>
      pipe(
        urls,
        A.zip(newRawMedia),
        A.map(([location, media]) => ({
          ...media,
          location,
        })),
        A.concat(newLinkedImages),
        A.concat(oldMedia)
      )
    )
  );
  // eslint-disable-next-line @typescript-eslint/return-await
  return pipe(
    mediaTask,
    TE.map((media) => ({
      ...data,
      media,
      endDate: data.endDate?.length > 0 ? data.endDate : undefined,
    }))
  )().then((result) => {
    if (result._tag === "Left") {
      return Promise.reject(result.left);
    }
    return result.right;
  });
};

const EditTitle: React.FC<EditProps> = ({ record }: any) => {
  return <span>Events {record.title}</span>;
};

export const EventEdit: React.FC<EditProps> = (props: EditProps) => (
  <Edit
    title={<EditTitle {...props} />}
    {...props}
    actions={
      <>
        <WebPreviewButton
          resource="/dashboard/events"
          source="id"
          record={{ id: props.id } as any}
        />
      </>
    }
    transform={({ newLinks = [], newMedia = [], ...r }) => {
      const links = (newLinks as any[]).reduce((acc, l) => {
        if (Array.isArray(l.ids)) {
          return acc.concat(l.ids);
        }
        return acc.concat(l);
      }, []);

      const media = (newMedia as any[]).reduce((acc, l) => {
        if (Array.isArray(l.ids)) {
          return acc.concat(l.ids);
        }
        return acc.concat(l);
      }, []);

      return transformEvent(r.id as any, {
        ...r,
        actors: r.actors.concat(r.newActors ?? []),
        media: r.media.concat(media),
        links: r.links.concat(links),
        groupsMembers: r.groupsMembers.concat(r.newGroupsMembers ?? []),
      });
    }}
  >
    <TabbedForm redirect={false}>
      <FormTab label="Generals">
        <DateInput source="startDate" />
        <DateInput source="endDate" />
        <TextInput source="title" />
        <ReferenceArrayKeywordInput source="keywords" />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </FormTab>
      <FormTab label="Body">
        <RichTextInput source="body" />
      </FormTab>
      <FormTab label="Body2">
        <RichTextInput source="excerpt" />
        <ReactPageInput source="body2" />
      </FormTab>
      <FormTab label="Location">
        <MapInput source="location" type={GeometryType.POINT} />
      </FormTab>
      <FormTab label="Actors">
        <ReferenceArrayActorInput source="newActors" />
        <ReferenceArrayField source="actors" reference="actors">
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="fullName" />
            <AvatarField source="avatar" />
          </Datagrid>
        </ReferenceArrayField>
      </FormTab>
      <FormTab label="Group Members">
        <ReferenceArrayGroupMemberInput source="newGroupsMembers" />
        <ReferenceArrayField source="groupsMembers" reference="groups-members">
          <Datagrid rowClick="edit">
            <AvatarField source="actor.avatar" />
            <AvatarField source="group.avatar" />
            <DateField source="startDate" />
            <DateField source="endDate" />
          </Datagrid>
        </ReferenceArrayField>
      </FormTab>
      <FormTab label="Groups">
        <ReferenceArrayGroupInput source="groups" />
        <ReferenceArrayField reference="groups" source="groups">
          <Datagrid rowClick="edit">
            <TextField source="name" />
            <AvatarField source="avatar" fullWidth={false} />
          </Datagrid>
        </ReferenceArrayField>
      </FormTab>
      <FormTab label="Media">
        <MediaArrayInput source="newMedia" fullWidth={true} defaultValue={[]} />

        <ArrayField source="media">
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <MediaField source="location" fullWidth={false} />
            <TextField source="description" />
          </Datagrid>
        </ArrayField>
      </FormTab>
      <FormTab label="Links">
        <ArrayInput source="newLinks" defaultValue={[]}>
          <SimpleFormIterator>
            <BooleanInput source="addNew" />
            <FormDataConsumer>
              {({ formData, scopedFormData, getSource, ...rest }) => {
                const getSrc = getSource ?? ((s: string) => s);

                if (scopedFormData?.addNew) {
                  return (
                    <Box>
                      <TextInput source={getSrc("url")} type="url" {...rest} />
                      <TextInput source={getSrc("description")} {...rest} />
                    </Box>
                  );
                }
                return (
                  <ReferenceArrayInput
                    source={getSrc("ids")}
                    reference="links"
                    filterToQuery={(description: any) => ({ description })}
                    {...rest}
                  >
                    <AutocompleteArrayInput
                      source="id"
                      optionText="description"
                    />
                  </ReferenceArrayInput>
                );
              }}
            </FormDataConsumer>
          </SimpleFormIterator>
        </ArrayInput>
        <ReferenceArrayField source="links" reference="links">
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="url" />
            <TextField source="description" />
          </Datagrid>
        </ReferenceArrayField>
      </FormTab>
      <FormTab label="Preview">
        <FormDataConsumer>
          {({ formData, ...rest }) => {
            return pipe(
              http.Events.Uncategorized.Uncategorized.decode(formData),
              E.fold(ValidationErrorsLayout, (p) => (
                <EventPageContent
                  event={{
                    ...p,
                    actors: [],
                    groups: [],
                    keywords: [],
                    links: [],
                    groupsMembers: [],
                  }}
                  onActorClick={() => undefined}
                  onGroupClick={() => undefined}
                  onKeywordClick={() => undefined}
                  onLinkClick={() => undefined}
                  onGroupMemberClick={() => undefined}
                />
              ))
            );
          }}
        </FormDataConsumer>
      </FormTab>
    </TabbedForm>
  </Edit>
);

export const EventCreate: React.FC<CreateProps> = (props) => (
  <Create
    title="Create a Event"
    {...props}
    transform={(data) => transformEvent(uuid(), data)}
  >
    <TabbedForm>
      <FormTab label="General">
        <TextInput source="title" validation={[required()]} />
        <MapInput source="location" type={GeometryType.POINT} />
        <DateInput
          source="startDate"
          validation={[required()]}
          defaultValue={new Date()}
        />
        <DateInput source="endDate" />
        <ReferenceArrayKeywordInput source="keywords" initialValue={[]} />
      </FormTab>
      <FormTab label="body">
        <RichTextInput source="excerpt" defaultValue="" />
        <ReactPageInput source="body2" />
        <TextInput source="body" defaultValue="" />
      </FormTab>
      <FormTab label="Actors">
        <ReferenceArrayActorInput source="actors" initialValue={[]} />
      </FormTab>
      <FormTab label="Group Members">
        <ReferenceArrayGroupMemberInput
          source="groupsMembers"
          initialValue={[]}
        />
      </FormTab>
      <FormTab label="Groups">
        <ReferenceArrayInput
          source="groups"
          reference="groups"
          initialValue={[]}
        >
          <SelectArrayInput optionText="name" />
        </ReferenceArrayInput>
      </FormTab>
      <FormTab label="Links">
        <ReferenceArrayLinkInput source="links" initialValue={[]} />
      </FormTab>
      <FormTab label="Media">
        <ArrayInput source="media" defaultValue={[]}>
          <SimpleFormIterator>
            <MediaInput sourceType="type" sourceLocation="location" />
          </SimpleFormIterator>
        </ArrayInput>
      </FormTab>
    </TabbedForm>
  </Create>
);
