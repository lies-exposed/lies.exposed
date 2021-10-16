import { http } from "@econnessione/shared/io";
import { Actor } from "@econnessione/shared/io/http/Actor";
import { uuid } from "@econnessione/shared/utils/uuid";
import { EventPageContent } from "@econnessione/ui/components/EventPageContent";
import { ValidationErrorsLayout } from "@econnessione/ui/components/ValidationErrorsLayout";
import { Box } from "@material-ui/core";
import PinDropIcon from "@material-ui/icons/PinDrop";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
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
  ReferenceField,
  required,
  SelectArrayInput,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import { AvatarField } from "./Common/AvatarField";
import { MapInput } from "./Common/MapInput";
import MarkdownInput from "./Common/MarkdownInput";
import { WebPreviewButton } from "./Common/WebPreviewButton";
import { dataProvider } from "@client/HTTPAPI";
import { uploadImages } from "@client/MediaAPI";

const RESOURCE = "events";

const EventsFilter: React.FC = (props: any) => {
  return (
    <Filter {...props}>
      <TextInput source="title" alwaysOn size="small" />
      <ReferenceArrayInput source="groups" reference="groups" alwaysOn>
        <AutocompleteArrayInput optionText="name" />
      </ReferenceArrayInput>
      <ReferenceArrayInput
        source="actors"
        reference="actors"
        alwaysOn
        filterToQuery={(q: string) => ({ fullName: q })}
      >
        <AutocompleteArrayInput
          optionText={(a: Partial<Actor>) =>
            a?.id ? `${a.fullName}` : "No actor"
          }
        />
      </ReferenceArrayInput>
      <ReferenceArrayInput
        source="groupsMembers"
        reference="groups-members"
        filterToQuery={(ids: string[]) => ({
          groupsMembers: ids,
        })}
      >
        <AutocompleteArrayInput
          source="id"
          optionText={(r: any) => {
            return r?.actor && r?.group
              ? `${r.actor.fullName} ${r.group.name}`
              : "No group members";
          }}
        />
      </ReferenceArrayInput>
      <DateInput source="startDate" />
      <DateInput source="endDate" />
    </Filter>
  );
};

export const EventList: React.FC<ListProps> = (props) => (
  <List {...props} resource={RESOURCE} filters={<EventsFilter />} perPage={20}>
    <Datagrid rowClick="edit">
      <TextField source="title" />
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
  const newImages = data.images.filter((i: any) => i.id === undefined);
  const oldImages = data.images.filter((i: any) => i.id !== undefined);

  const imagesTask = pipe(
    uploadImages(dataProvider)(
      "events",
      id,
      newImages.map((i: any) => i.location.rawFile)
    ),
    TE.map((urls) =>
      pipe(
        urls,
        A.zip(newImages as any[]),
        A.map(([location, image]) => ({
          ...image,
          location,
        })),
        A.concat(oldImages)
      )
    )
  );
  // eslint-disable-next-line @typescript-eslint/return-await
  return pipe(
    imagesTask,
    TE.map((images) => ({
      ...data,
      images,
      endDate: data.endDate.length > 0 ? data.endDate : undefined,
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
          resource="events"
          source="id"
          record={{ id: props.id } as any}
        />
      </>
    }
    transform={({ newLinks = [], ...r }) => {
      const links = (newLinks as any[]).reduce((acc, l) => {
        if (Array.isArray(l.ids)) {
          return acc.concat(l.ids);
        }
        return acc.concat(l);
      }, []);

      return transformEvent(r.id as any, {
        ...r,
        actors: r.actors.concat(r.newActors ?? []),
        images: r.images.concat(r.newImages ?? []),
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
        <ReferenceArrayInput source="keywords" reference="keywords">
          <AutocompleteArrayInput optionText="tag" />
        </ReferenceArrayInput>
        <MarkdownInput source="body" />
        <DateField source="updatedAt" showTime={true} />
        <DateField source="createdAt" showTime={true} />
      </FormTab>
      <FormTab label="Location">
        <MapInput source="location" type={GeometryType.POINT} />
      </FormTab>
      <FormTab label="Actors">
        <ReferenceArrayInput
          source="newActors"
          reference="actors"
          filterToQuery={(q: string) => ({ fullName: q })}
        >
          <AutocompleteArrayInput source="id" optionText="fullName" />
        </ReferenceArrayInput>
        <ReferenceArrayField source="actors" reference="actors">
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <TextField source="fullName" />
            <AvatarField source="avatar" />
          </Datagrid>
        </ReferenceArrayField>
      </FormTab>
      <FormTab label="Group Members">
        <ReferenceArrayInput
          source="newGroupsMembers"
          reference="groups-members"
        >
          <AutocompleteArrayInput
            source="id"
            optionText={(m: any) => `${m.group.name} - ${m.actor.fullName}`}
          />
        </ReferenceArrayInput>
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
        <ReferenceArrayInput source="groups" reference="groups">
          <AutocompleteArrayInput source="id" optionText="name" />
        </ReferenceArrayInput>
        <ReferenceArrayField reference="groups" source="groups">
          <Datagrid rowClick="edit">
            <TextField source="name" />
            <AvatarField source="avatar" fullWidth={false} />
          </Datagrid>
        </ReferenceArrayField>
      </FormTab>
      <FormTab label="Images">
        <ArrayInput source="newImages" defaultValue={[]}>
          <SimpleFormIterator>
            <TextInput source="description" />
            <ImageInput source="location">
              <ImageField src="src" />
            </ImageInput>
          </SimpleFormIterator>
        </ArrayInput>

        <ArrayField source="images">
          <Datagrid rowClick="edit">
            <TextField source="id" />
            <ImageField source="location" fullWidth={false} />
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
                  event={p}
                  actors={[]}
                  groups={[]}
                  links={[]}
                  keywords={[]}
                  onActorClick={() => undefined}
                  onGroupClick={() => undefined}
                  onKeywordClick={() => undefined}
                  onLinkClick={() => undefined}
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
        <MarkdownInput source="body" defaultValue="" />
      </FormTab>
      <FormTab label="Actors">
        <ReferenceArrayInput
          source="actors"
          reference="actors"
          defaultValue={[]}
        >
          <SelectArrayInput optionText="fullName" />
        </ReferenceArrayInput>
      </FormTab>
      <FormTab label="Group Members">
        <ReferenceArrayInput
          source="groupsMembers"
          reference="groups-members"
          defaultValue={[]}
        >
          <SelectArrayInput
            optionText={(m: any) => `${m.group.name} - ${m.actor.fullName}`}
          />
        </ReferenceArrayInput>
      </FormTab>
      <FormTab label="Groups">
        <ReferenceArrayInput
          source="groups"
          reference="groups"
          defaultValue={[]}
        >
          <SelectArrayInput optionText="name" />
        </ReferenceArrayInput>
      </FormTab>
      <FormTab label="Links">
        <ArrayInput source="links" defaultValue={[]}>
          <SimpleFormIterator>
            <TextInput type="url" source="url" />
            <TextInput source="description" />
          </SimpleFormIterator>
        </ArrayInput>
      </FormTab>
      <FormTab label="Images">
        <ArrayInput source="images" defaultValue={[]}>
          <SimpleFormIterator>
            <ImageInput source="location">
              <ImageField source="src" />
            </ImageInput>
            <TextInput source="description" />
          </SimpleFormIterator>
        </ArrayInput>
      </FormTab>
    </TabbedForm>
  </Create>
);
