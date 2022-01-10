import { http } from "@econnessione/shared/io";
import { Media } from "@econnessione/shared/io/http";
import { Event } from "@econnessione/shared/io/http/Events";
import { uuid } from "@econnessione/shared/utils/uuid";
import Editor from "@econnessione/ui/components/Common/Editor";
import { EventIcon } from "@econnessione/ui/components/Common/Icons/EventIcon";
import { EventPageContent } from "@econnessione/ui/components/EventPageContent";
import { ValidationErrorsLayout } from "@econnessione/ui/components/ValidationErrorsLayout";
import { Box, Typography } from "@material-ui/core";
import PinDropIcon from "@material-ui/icons/PinDrop";
import * as A from "fp-ts/lib/Array";
import * as E from "fp-ts/lib/Either";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import {
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
  TextInput
} from "react-admin";
import { AvatarField } from "./Common/AvatarField";
import { MediaArrayInput } from "./Common/MediaArrayInput";
import { MediaField } from "./Common/MediaField";
import ReactPageInput from "@econnessione/ui/components/admin/ReactPageInput";
import ReferenceArrayActorInput from "./Common/ReferenceArrayActorInput";
import ReferenceArrayGroupInput from "./Common/ReferenceArrayGroupInput";
import ReferenceArrayGroupMemberInput from "./Common/ReferenceArrayGroupMemberInput";
import ReferenceArrayKeywordInput from "./Common/ReferenceArrayKeywordInput";
import ReferenceArrayLinkInput from "./Common/ReferenceArrayLinkInput";
import { WebPreviewButton } from "./Common/WebPreviewButton";
import {
  DeathEventEditFormTab,
  DeathEventTitle,
  transformDeathEvent
} from "./events/AdminDeathEvent";
import {
  EditScientificStudyEvent,
  ScientificStudyEventTitle
} from "./events/AdminScientificStudyEvent";
import {
  transformUncategorizedEvent,
  UncategorizedEventEdit,
  UncategorizedEventTitle
} from "./events/AdminUncategorizedEvent";
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
        label="type"
        render={(r: any) => {
          return (
            <Box>
              <EventIcon color="primary" type={r.type} />
              <Typography display="inline" variant="subtitle1">
                {r.type}
              </Typography>
              {r.type === "Uncategorized" ? (
                <Typography>{r.payload.title}</Typography>
              ) : null}
            </Box>
          );
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

          if (r?.type === "ScientificStudy") {
            return r.payload.authors.length;
          }

          return 1;
        }}
      />

      <FunctionField
        label="groups"
        source="payload"
        render={(r: Record | undefined) => {
          if (r?.type === "Uncategorized") {
            return r.payload.groups.length;
          }

          if (r?.type === "ScientificStudy") {
            return 1;
          }

          return 0;
        }}
      />
      <FunctionField
        label="groupsMembers"
        source="payload"
        render={(r: Record | undefined) => {
          if (r?.type === "Uncategorized") {
            return r.payload.groupsMembers.length;
          }

          if (r?.type === "ScientificStudy") {
            return 0;
          }

          return 1;
        }}
      />
      <FunctionField
        label="Location"
        source="payload.location.coordinates"
        render={(r: Record | undefined) =>
          r?.location?.coordinates ? <PinDropIcon /> : "-"
        }
      />
      <FunctionField source="links" render={(r: any) => r.links?.length ?? 0} />
      <FunctionField source="media" render={(r: any) => r.media?.length ?? 0} />
      <DateField source="date" />
      <DateField source="updatedAt" />
      <DateField source="createdAt" />
    </Datagrid>
  </List>
);

const transformEvent = async (
  id: string,
  { newMedia = [], newLinks = [], ...data }: Record
): Promise<Record> => {
  // eslint-disable-next-line
  console.log("transforming event", id, { newMedia, newLinks, ...data });

  const links = pipe(
    (newLinks as any[]).reduce((acc, ll) => {
      if (ll.ids) {
        return acc.concat(...ll.ids);
      }
      return acc.concat(ll);
    }, []),
    (nll) => data.links.concat(nll)
  );

  const { rawMedia, otherMedia } = (newMedia as any[]).reduce<{
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
        A.concat(otherMedia),
        A.concat(data.media)
      )
    )
  );
  // eslint-disable-next-line @typescript-eslint/return-await
  return pipe(
    mediaTask,
    TE.map((media) => ({
      ...data,
      media,
      links,
    }))
  )().then((result) => {
    if (result._tag === "Left") {
      return Promise.reject(result.left);
    }
    return result.right;
  });
};

const EditTitle: React.FC<any> = ({ record }: { record: Event }) => {
  switch (record.type) {
    case "Uncategorized":
      return <UncategorizedEventTitle record={record} />;
    case "ScientificStudy":
      return <ScientificStudyEventTitle record={record} />;
    case "Death":
      return <DeathEventTitle record={record} />;
  }
};

export const EventEdit: React.FC<EditProps> = (props: EditProps) => {
  return (
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
      transform={(r) => {
        const transform =
          r.type === "Death"
            ? transformDeathEvent
            : r.type === "Uncategorized"
            ? transformUncategorizedEvent
            : (id: string, ev: any) => ev;

        // eslint-disable-next-line
        console.log("transform event for type", { type: r.type, event: r });
        return pipe(transform(r.id as any, r), (rr) =>
          transformEvent(rr.id, rr)
        );
      }}
    >
      <TabbedForm redirect={false}>
        <FormTab label="Generals">
          <TextField source="type" />
          <DateInput source="date" />
          <ReactPageInput label="excerpt" source="excerpt" onlyText />
          <ReferenceArrayKeywordInput source="keywords" />
          <DateField source="updatedAt" showTime={true} />
          <DateField source="createdAt" showTime={true} />
        </FormTab>
        <FormTab label="body">
          <ReactPageInput label="body" source="body" />
        </FormTab>

        <FormDataConsumer>
          {({ formData, getSource, scopedFormData, ...rest }) => {
            if (formData.type === "Death") {
              return <DeathEventEditFormTab {...rest} />;
            }
            if (formData.type === "ScientificStudy") {
              return <EditScientificStudyEvent {...rest} />;
            }
            return <UncategorizedEventEdit {...rest} />;
          }}
        </FormDataConsumer>
        <FormTab label="Media">
          <MediaArrayInput
            label="newMedia"
            source="newMedia"
            fullWidth={true}
            defaultValue={[]}
          />

          <ReferenceArrayField source="media" reference="media">
            <Datagrid rowClick="edit">
              <TextField source="id" />
              <MediaField source="location" fullWidth={false} />
              <TextField source="description" />
            </Datagrid>
          </ReferenceArrayField>
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
                        <TextInput
                          source={getSrc("url")}
                          type="url"
                          {...rest}
                        />
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
          <ReferenceArrayField source="links" reference="links" fullWidth>
            <Datagrid rowClick="edit">
              <TextField source="id" />
              <AvatarField source="image" />
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
                      keywords: [],
                      links: [],
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
};

export const EventCreate: React.FC<CreateProps> = (props) => (
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
        {/* <MapInput source="location" type={GeometryType.POINT} /> */}
        <DateInput
          source="startDate"
          validation={[required()]}
          defaultValue={new Date()}
        />
        <DateInput source="endDate" />
        <ReferenceArrayKeywordInput source="keywords" initialValue={[]} />
      </FormTab>
      <FormTab label="body">
        <ReactPageInput source="excerpt" />
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
        <MediaArrayInput source="media" defaultValue={[]} />
      </FormTab>
    </TabbedForm>
  </Create>
);
