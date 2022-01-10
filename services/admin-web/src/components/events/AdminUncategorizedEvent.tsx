import { Media } from "@econnessione/shared/io/http";
import { Uncategorized } from "@econnessione/shared/io/http/Events";
import { uuid } from "@econnessione/shared/utils/uuid";
import Editor from "@econnessione/ui/components/Common/Editor";
import { EventIcon } from "@econnessione/ui/components/Common/Icons/EventIcon";
import PinDropIcon from "@material-ui/icons/PinDrop";
import * as A from "fp-ts/lib/Array";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import GeometryType from "ol/geom/GeometryType";
import * as React from "react";
import {
  Create,
  CreateProps,
  Datagrid,
  DateField,
  DateInput,
  EditProps,
  Filter,
  FormTab,
  FunctionField,
  List,
  ListProps,
  Record,
  ReferenceArrayField,
  ReferenceArrayInput,
  required,
  SelectArrayInput,
  TabbedForm,
  TextField,
  TextInput,
} from "react-admin";
import { AvatarField } from "../Common/AvatarField";
import { MapInput } from "../Common/MapInput";
import { MediaArrayInput } from "../Common/MediaArrayInput";
import ReferenceArrayActorInput from "../Common/ReferenceArrayActorInput";
import ReferenceArrayGroupInput from "../Common/ReferenceArrayGroupInput";
import ReferenceArrayGroupMemberInput from "../Common/ReferenceArrayGroupMemberInput";
import ReferenceArrayKeywordInput from "../Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "../Common/ReferenceArrayLinkInput";
import RichTextInput from "../Common/RichTextInput";
import { dataProvider } from "@client/HTTPAPI";
import { RawMedia, uploadFile } from "@client/MediaAPI";

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

export const UncategorizedEventList: React.FC<ListProps> = (props) => (
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
        label="type"
        render={(r: any) => {
          return <EventIcon color="primary" type={r.type} />;
        }}
      />
      <FunctionField
        label="excerpt"
        render={(r: any) => <Editor readOnly value={r.excerpt} />}
      />
      <FunctionField
        label="actors"
        source="payload"
        render={(r: Record | undefined) => {
          if (r?.type === "Uncategorized") {
            return r.payload.actors.length;
          }

          return 0;
        }}
      />

      <FunctionField
        source="payload.groups"
        render={(r: Record | undefined) =>
          r ? (r.payload.groups ?? []).length : 0
        }
      />
      {/*
      <FunctionField
        source="payload.groupsMembers"
        render={(r: Record | undefined) => (r ? r.payload.groupsMembers.length : 0)}
      /> */}
      <FunctionField
        label="Location"
        source="payload.location"
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
  const media: any[] = (data.media as any[]).reduce((acc, l) => {
    if (Array.isArray(l.ids)) {
      return acc.concat(l.ids);
    }

    if (l.fromURL) {
      return acc.concat({
        ...l,
        thumbnail: l.location,
      });
    }
    return acc.concat(l);
  }, []);
  const { rawMedia, otherMedia } = media.reduce<{
    rawMedia: RawMedia[];
    otherMedia: any[];
  }>(
    (acc, m) => {
      if (m.location?.rawFile !== undefined) {
        return {
          ...acc,
          rawMedia: acc.rawMedia.concat(m),
        };
      }
      return {
        ...acc,
        otherMedia: acc.otherMedia.concat(m),
      };
    },
    {
      rawMedia: [],
      otherMedia: [],
    }
  );

  // console.log({ rawMedia, otherMedia });

  const mediaTask = pipe(
    A.sequence(TE.ApplicativePar)(
      rawMedia.map((r: any) =>
        uploadFile(dataProvider)(
          "media",
          uuid(),
          r.location.rawFile,
          r.location.rawFile.type
        )
      )
    ),
    TE.map((urls) =>
      pipe(
        urls,
        A.zip(rawMedia),
        A.map(([location, media]) => ({
          ...media,
          ...location,
          thumbnail: Media.ImageType.is(location.type)
            ? location.location
            : undefined,
        })),
        A.concat(otherMedia)
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

export const transformUncategorizedEvent = (id: string, r: any): any => {
  const {
    payload: { location, ...payload },
    ...rest
  } = r;
  return {
    ...rest,
    id,
    payload: {
      ...payload,
      location: typeof location === "string" ? JSON.parse(location) : location,
    },
  };
};

export const UncategorizedEventTitle: React.FC<{
  record: Uncategorized.Uncategorized;
}> = ({ record }: any) => {
  return <span>Event: {record.payload.title}</span>;
};

export const UncategorizedEventEdit: React.FC<EditProps> = (
  props: EditProps
) => {
  return (
    <FormTab label="Payload" {...props}>
      <TextInput source="payload.title" />
      <DateInput source="payload.endDate" />
      <MapInput
        source="payload.location"
        type={GeometryType.POINT}
        defaultValue={undefined}
      />
      <ReferenceArrayActorInput source="payload.actors" />
      <ReferenceArrayField source="payload.actors" reference="actors">
        <Datagrid rowClick="edit">
          <TextField source="id" />
          <TextField source="fullName" />
          <AvatarField source="avatar" />
        </Datagrid>
      </ReferenceArrayField>
      <ReferenceArrayGroupMemberInput source="payload.groupsMembers" />
      <ReferenceArrayField
        source="payload.groupsMembers"
        reference="groups-members"
      >
        <Datagrid rowClick="edit">
          <AvatarField source="actor.avatar" />
          <AvatarField source="group.avatar" />
          <DateField source="startDate" />
          <DateField source="endDate" />
        </Datagrid>
      </ReferenceArrayField>

      <ReferenceArrayGroupInput source="payload.groups" />
      <ReferenceArrayField reference="groups" source="payload.groups">
        <Datagrid rowClick="edit">
          <TextField source="name" />
          <AvatarField source="avatar" fullWidth={false} />
        </Datagrid>
      </ReferenceArrayField>
    </FormTab>
  );
};

export const UncategorizedEventCreate: React.FC<CreateProps> = (props) => (
  <Create
    title="Create a Event"
    {...props}
    transform={(data) => {
      return transformEvent(uuid(), data);
    }}
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
        <MediaArrayInput source="media" defaultValue={[]} />
      </FormTab>
    </TabbedForm>
  </Create>
);
