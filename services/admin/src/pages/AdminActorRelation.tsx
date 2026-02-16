import { ActorRelationType } from "@liexp/io/lib/http/ActorRelation.js";
import type * as http from "@liexp/io/lib/http/index.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
import ReferenceActorInput from "@liexp/ui/lib/components/admin/actors/ReferenceActorInput.js";
import { AvatarField } from "@liexp/ui/lib/components/admin/common/AvatarField.js";
import { WebPreviewButton } from "@liexp/ui/lib/components/admin/common/WebPreviewButton.js";
import {
  Create,
  Datagrid,
  DateField,
  DateInput,
  Edit,
  FormTab,
  List,
  SelectInput,
  SimpleForm,
  TabbedForm,
  TextField,
  useRecordContext,
  type SelectInputProps,
  type CreateProps,
  type ListProps,
  type RaRecord,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { FormControl, Grid } from "@liexp/ui/lib/components/mui/index.js";
import * as React from "react";

export const transformActorRelation = ({
  startDate,
  endDate,
  excerpt,
  ...r
}: RaRecord): RaRecord | Promise<RaRecord> => {
  return {
    ...r,
    actor: r.actor.id,
    relatedActor: r.relatedActor.id,
    startDate: startDate === "" ? undefined : startDate,
    endDate: endDate === "" ? undefined : endDate,
    excerpt: isValidValue(excerpt) ? excerpt : undefined,
  };
};

const ACTOR_RELATION_TYPE_LABELS: Record<string, string> = {
  PARENT_CHILD: "Parent - Child (family hierarchy)",
  SPOUSE: "Spouse (married partner)",
  PARTNER: "Partner (unmarried or business)",
};

export const SelectActorRelationTypeInput: React.FC<SelectInputProps> = (
  props,
) => {
  return (
    <SelectInput
      {...props}
      choices={ActorRelationType.members.map((m) => {
        const value = m.literals[0] as string;
        return {
          id: value,
          name: ACTOR_RELATION_TYPE_LABELS[value] || value,
        };
      })}
    />
  );
};

const filters = [
  <ReferenceActorInput key="actor" source="actor" alwaysOn />,
  <ReferenceActorInput key="relatedActor" source="relatedActor" alwaysOn />,
  <SelectActorRelationTypeInput key="type" />,
];

const ActorRelationTypeCell: React.FC<{ record?: RaRecord }> = ({ record }) => {
  if (!record) return null;
  const label =
    ACTOR_RELATION_TYPE_LABELS[record.type] ?? record.type ?? "Unknown";
  return <span title={label}>{label}</span>;
};

export const ActorRelationList: React.FC<ListProps> = (props) => (
  <List {...props} resource="actor-relations" filters={filters}>
    <Datagrid rowClick="edit">
      <AvatarField
        label="resources.actors.fields.avatar"
        source="actor.avatar"
      />
      <TextField source="actor.fullName" label="Actor" />
      <ActorRelationTypeCell />
      <AvatarField
        label="resources.actors.fields.avatar"
        source="relatedActor.avatar"
      />
      <TextField source="relatedActor.fullName" label="Related Actor" />
      <DateField source="startDate" />
      <DateField source="endDate" emptyText="Ongoing" />
      <DateField source="updatedAt" showTime={true} />
      <DateField source="createdAt" showTime={true} />
    </Datagrid>
  </List>
);

const EditTitle: React.FC<{ record?: http.ActorRelation.ActorRelation }> = ({
  record,
}) => {
  return (
    <span>
      {record?.actor.fullName} → {record?.relatedActor.fullName}
    </span>
  );
};

export const ActorRelationEdit: React.FC = () => {
  const record = useRecordContext<http.ActorRelation.ActorRelation>();
  return (
    <Edit
      title={<EditTitle record={record} />}
      transform={transformActorRelation}
    >
      <TabbedForm>
        <FormTab label="generals">
          <FormControl style={{ width: "100%" }}>
            <Grid container alignItems="center">
              <Grid size={{ md: 4 }}>
                <ReferenceActorInput source="actor.id" label="Actor" />
              </Grid>
              <Grid size={{ md: 4 }}>
                <WebPreviewButton resource="actors" source="actor.id" />
              </Grid>
            </Grid>
          </FormControl>

          <SelectActorRelationTypeInput source="type" required />

          <FormControl style={{ width: "100%" }}>
            <Grid container alignItems="center">
              <Grid size={{ md: 4 }}>
                <ReferenceActorInput
                  source="relatedActor.id"
                  label="Related Actor"
                />
              </Grid>
              <Grid size={{ md: 4 }}>
                <WebPreviewButton resource="actors" source="relatedActor.id" />
              </Grid>
            </Grid>
          </FormControl>

          <DateInput source="startDate" required={false} />
          <DateInput source="endDate" required={false} />
          <BlockNoteInput label="excerpt" source="excerpt" onlyText={true} />
        </FormTab>
        <FormTab label="Body">
          <BlockNoteInput label="body" source="body" />
        </FormTab>
      </TabbedForm>
    </Edit>
  );
};

export const ActorRelationCreate: React.FC<CreateProps> = (props) => (
  <Create
    {...props}
    title="Create an Actor Relation"
    transform={transformActorRelation}
  >
    <SimpleForm>
      <ReferenceActorInput source="actor.id" label="Actor" />
      <SelectActorRelationTypeInput source="type" />
      <ReferenceActorInput source="relatedActor.id" label="Related Actor" />
      <DateInput source="startDate" />
      <DateInput source="endDate" />
      <BlockNoteInput source="excerpt" onlyText={true} />
      <BlockNoteInput source="body" />
    </SimpleForm>
  </Create>
);
