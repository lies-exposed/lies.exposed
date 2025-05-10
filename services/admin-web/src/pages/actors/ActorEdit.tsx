import { type Actor } from "@liexp/shared/lib/io/http/Actor.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { OpenAISummarizeQueueType } from "@liexp/shared/lib/io/http/Queue/index.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { EntitreeGraph } from "@liexp/ui/lib/components/Common/Graph/Flow/EntitreeGraph/EntitreeGraph.js";
import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
import { EditForm } from "@liexp/ui/lib/components/admin/common/EditForm.js";
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
import ReferenceMediaInput from "@liexp/ui/lib/components/admin/media/input/ReferenceMediaInput.js";
import ActorPreview from "@liexp/ui/lib/components/admin/previews/ActorPreview.js";
import {
  ArrayInput,
  Datagrid,
  DateField,
  DateInput,
  FunctionField,
  ImageField,
  ImageInput,
  ReferenceArrayField,
  SimpleFormIterator,
  TabbedForm,
  TextField,
  useRecordContext,
  type EditProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { LazyFormTabContent } from "@liexp/ui/lib/components/admin/tabs/LazyFormTabContent.js";
import { Grid } from "@liexp/ui/lib/components/mui/index.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import { type Option } from "effect/Option";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { transformActor } from "./ActorCreate";

const EditTitle: React.FC = () => {
  const record = useRecordContext();
  return <span>Actor {record?.fullName}</span>;
};

const EditActions: React.FC = () => {
  const record = useRecordContext();
  return (
    <>
      {record?.fullName ? <SearchLinksButton query={record.fullName} /> : null}
    </>
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

              <OpenAIEmbeddingJobButton<Actor>
                resource="actors"
                type={OpenAISummarizeQueueType.Type}
                transformValue={({ excerpt, fullName }) =>
                  pipe(
                    excerpt && isValidValue(excerpt)
                      ? getTextContents(excerpt)
                      : "",
                    (text) => (text !== "" ? text : fullName),
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
          <ImageField source="avatar.location" />
          <ReferenceMediaInput source="avatar.id" fullWidth />
          <FunctionField
            render={(r) => {
              if (!r.avatar) {
                return (
                  <ImageInput source="avatar">
                    <ImageField source="thumbnail" />
                  </ImageInput>
                );
              }
              return null;
            }}
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
        <TabbedForm.Tab label="Events">
          <ReferenceManyEventField source="id" target="actors[]" />
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
        </TabbedForm.Tab>
        <TabbedForm.Tab label="networks">
          <LazyFormTabContent tab={5}>
            <EventsNetworkGraphFormTab type="actors" />
          </LazyFormTabContent>
        </TabbedForm.Tab>
        <TabbedForm.Tab label="flows">
          <LazyFormTabContent tab={6}>
            <EventsFlowGraphFormTab type="actors" />
          </LazyFormTabContent>
        </TabbedForm.Tab>
        <TabbedForm.Tab label="Entitree">
          <div style={{ height: 600, width: "100%" }}>
            <EntitreeGraph />
          </div>
        </TabbedForm.Tab>
      </TabbedForm>
    </EditForm>
  );
};

export default ActorEdit;
