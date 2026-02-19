import { type Actor } from "@liexp/io/lib/http/Actor.js";
import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import { OpenAISummarizeQueueType } from "@liexp/io/lib/http/Queue/index.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { ActorFamilyTree } from "@liexp/ui/lib/components/actors/ActorFamilyTree.js";
import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
import { MergeActorButton } from "@liexp/ui/lib/components/admin/actors/MergeActorButton.js";
import ReferenceActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceActorInput.js";
import { AvatarField } from "@liexp/ui/lib/components/admin/common/AvatarField.js";
import { EditForm } from "@liexp/ui/lib/components/admin/common/EditForm.js";
import { LinkExistingEventsButton } from "@liexp/ui/lib/components/admin/common/LinkExistingEventsButton.js";
import { ColorInput } from "@liexp/ui/lib/components/admin/common/inputs/ColorInput.js";
import { TextWithSlugInput } from "@liexp/ui/lib/components/admin/common/inputs/TextWithSlugInput.js";
import { CreateEventButton } from "@liexp/ui/lib/components/admin/events/CreateEventButton.js";
import ReferenceManyEventField from "@liexp/ui/lib/components/admin/events/ReferenceManyEventField.js";
import { EventsFlowGraphFormTab } from "@liexp/ui/lib/components/admin/events/tabs/EventsFlowGraphFormTab.js";
import { EventsNetworkGraphFormTab } from "@liexp/ui/lib/components/admin/events/tabs/EventsNetworkGraphFormTab.js";
import ReferenceGroupInput from "@liexp/ui/lib/components/admin/groups/ReferenceGroupInput.js";
import { SearchLinksButton } from "@liexp/ui/lib/components/admin/links/SearchLinksButton.js";
import { MediaField } from "@liexp/ui/lib/components/admin/media/MediaField.js";
import { OpenAIEmbeddingJobButton } from "@liexp/ui/lib/components/admin/media/OpenAIJobButton.js";
import { ReferenceMediaInputWithUpload } from "@liexp/ui/lib/components/admin/media/input/ReferenceMediaInputWithUpload.js";
import { ReferenceArrayNationInput } from "@liexp/ui/lib/components/admin/nations/ReferenceArrayNationInput.js";
import ActorPreview from "@liexp/ui/lib/components/admin/previews/ActorPreview.js";
import {
  ArrayInput,
  Datagrid,
  DateField,
  DateInput,
  FunctionField,
  ReferenceArrayField,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  useRecordContext,
  type EditProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { LazyFormTabContent } from "@liexp/ui/lib/components/admin/tabs/LazyFormTabContent.js";
import { Grid, Stack } from "@liexp/ui/lib/components/mui/index.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import { type Option } from "effect/Option";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { useNavigate } from "react-router";
import { SelectActorRelationTypeInput } from "../AdminActorRelation.js";
import { transformActor } from "./ActorCreate.js";

const EditTitle: React.FC = () => {
  const record = useRecordContext();
  return <span>Actor {record?.fullName}</span>;
};

const EditActions: React.FC = () => {
  const record = useRecordContext();
  return (
    <>
      {record?.fullName ? <SearchLinksButton query={record.fullName} /> : null}
      {record ? <MergeActorButton /> : null}
    </>
  );
};

const FamilyTreeTab: React.FC = () => {
  const record = useRecordContext<Actor>();
  const navigate = useNavigate();

  if (!record?.id) {
    return null;
  }

  return (
    <ActorFamilyTree
      actorId={record.id}
      onActorClick={(id) => void navigate(`/actors/${id}`)}
    />
  );
};

const ActorEdit: React.FC<EditProps> = (props) => {
  const dataProvider = useDataProvider();

  return (
    <EditForm
      title={<EditTitle />}
      {...props}
      actions={<EditActions />}
      preview={<ActorPreview />}
      transform={(a) => transformActor(dataProvider)(a.id, a)}
    >
      <TabbedForm>
        <TabbedForm.Tab label="generals">
          <Grid container size={12}>
            <Grid size={8}>
              <TextWithSlugInput source="fullName" slugSource="username" />
              <Grid container>
                <Grid size={6}>
                  <DateInput source="bornOn" />
                </Grid>
                <Grid size={6} textAlign="end">
                  <DateInput source="diedOn" />
                </Grid>
              </Grid>
              <ReferenceArrayNationInput source="nationalities" />
              <OpenAIEmbeddingJobButton<Actor>
                resource="actors"
                type={OpenAISummarizeQueueType.Type}
                label="Generate Biography Summary"
                description="AI retrieves related events and generates a comprehensive actor biography using verified Wikipedia sources"
                transformValue={({ excerpt, fullName }) =>
                  pipe(
                    excerpt && isValidValue(excerpt)
                      ? getTextContents(excerpt)
                      : fullName,
                    (text) => ({ text }),
                  )
                }
              />
            </Grid>
            <Grid size={4} textAlign={"end"}>
              <MediaField
                source="avatar.thumbnail"
                type="image/jpeg"
                controls={false}
              />
              <ColorInput source="color" />
            </Grid>
          </Grid>

          <BlockNoteInput source="excerpt" onlyText={true} />
          <DateField source="createdAt" />
          <DateField source="updatedAt" />
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Avatar">
          <ReferenceMediaInputWithUpload
            source="avatar.id"
            uploadLabel="Upload new avatar"
            fullWidth
          />
        </TabbedForm.Tab>

        <TabbedForm.Tab label="Content">
          <BlockNoteInput source="body" />
        </TabbedForm.Tab>

        <TabbedForm.Tab label="Groups">
          <ArrayInput source="newMemberIn" defaultValue={[]} fullWidth>
            <SimpleFormIterator fullWidth>
              <ReferenceGroupInput source="group" />
              <DateInput source="startDate" />
              <DateInput source="endDate" />
              <BlockNoteInput onlyText={true} source="body" />
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
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Relations">
          <Grid container spacing={2} style={{ width: "100%" }}>
            <Grid size={6}>
              <ArrayInput
                source="newRelationsAsSource"
                defaultValue={[]}
                fullWidth
              >
                <SimpleFormIterator fullWidth>
                  <SelectActorRelationTypeInput source="type" required />
                  <ReferenceActorInput
                    source="relatedActor"
                    label="Related Actor"
                  />
                  <DateInput source="startDate" />
                  <DateInput source="endDate" />
                  <BlockNoteInput onlyText={true} source="excerpt" />
                </SimpleFormIterator>
              </ArrayInput>

              <ReferenceArrayField
                source="relationsAsSource"
                reference="actor-relations"
                label="Relations (as source)"
              >
                <Datagrid rowClick="edit">
                  <TextField source="id" />
                  <TextField source="type" />
                  <FunctionField
                    render={() => {
                      return (
                        <Stack
                          display={"flex"}
                          flexDirection={"row"}
                          alignItems={"center"}
                          spacing={2}
                        >
                          <AvatarField source="relatedActor.avatar.location" />
                          <TextField source="relatedActor.fullName" />
                        </Stack>
                      );
                    }}
                  />
                  <DateField source="startDate" />
                  <DateField source="endDate" defaultValue={undefined} />
                </Datagrid>
              </ReferenceArrayField>

              <ReferenceArrayField
                source="relationsAsTarget"
                reference="actor-relations"
                label="Relations (as target)"
              >
                <Datagrid rowClick="edit">
                  <TextField source="id" />
                  <TextField source="type" />
                  <TextField source="actor.fullName" />
                  <DateField source="startDate" />
                  <DateField source="endDate" defaultValue={undefined} />
                </Datagrid>
              </ReferenceArrayField>
            </Grid>
            <Grid size={6} sx={{ minHeight: 600, position: "relative" }}>
              <FamilyTreeTab />
            </Grid>
          </Grid>
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Events">
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <LinkExistingEventsButton entityType="actors" />
            <CreateEventButton
              transform={async (t, r) => {
                if (t === EVENT_TYPES.DEATH) {
                  return {
                    draft: true,
                    type: t,
                    excerpt: null,
                    body: null,
                    date: new Date(),
                    payload: {
                      victim: r.id,
                      location: O.none as Option<UUID>,
                    },
                    media: [],
                    keywords: [],
                    links: [],
                  };
                }
                return Promise.reject(new Error(`Can't create event ${t}`));
              }}
            />
          </Stack>
          <ReferenceManyEventField source="id" target="actors[]" />
        </TabbedForm.Tab>
        <TabbedForm.Tab label="networks">
          <LazyFormTabContent tab={6}>
            <EventsNetworkGraphFormTab type="actors" />
          </LazyFormTabContent>
        </TabbedForm.Tab>
        <TabbedForm.Tab label="flows">
          <LazyFormTabContent tab={7}>
            <EventsFlowGraphFormTab type="actors" />
          </LazyFormTabContent>
        </TabbedForm.Tab>
      </TabbedForm>
    </EditForm>
  );
};

export default ActorEdit;
