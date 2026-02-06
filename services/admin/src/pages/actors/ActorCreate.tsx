import { fp } from "@liexp/core/lib/fp/index.js";
import { UUID, uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { type Media } from "@liexp/io/lib/http/Media/Media.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { uploadImages } from "@liexp/ui/lib/client/admin/MediaAPI.js";
import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
import { ColorInput } from "@liexp/ui/lib/components/admin/common/inputs/ColorInput.js";
import { TextWithSlugInput } from "@liexp/ui/lib/components/admin/common/inputs/TextWithSlugInput.js";
import { ReferenceMediaInputWithUpload } from "@liexp/ui/lib/components/admin/media/input/ReferenceMediaInputWithUpload.js";
import { ReferenceArrayNationInput } from "@liexp/ui/lib/components/admin/nations/ReferenceArrayNationInput.js";
import {
  Create,
  DateInput,
  FormDataConsumer,
  SelectInput,
  SimpleForm,
  TextInput,
  type CreateProps,
  type RaRecord,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { Grid } from "@liexp/ui/lib/components/mui/index.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import { type APIRESTClient } from "@ts-endpoint/react-admin";
import { Schema } from "effect";
import { toError } from "fp-ts/lib/Either";
import type * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { transformActorRelation } from "../AdminActorRelation";

export const transformActor =
  (dataProvider: APIRESTClient) =>
  async (
    id: string,
    {
      newMemberIn = [],
      newRelationsAsSource = [],
      newAvatarUpload,
      ...data
    }: RaRecord<UUID>,
  ): Promise<RaRecord> => {
    if (data._from === "wikipedia") {
      return data;
    }

    return pipe(
      fp.TE.Do,
      fp.TE.bind("avatar", (): TE.TaskEither<Error, Partial<Media>> => {
        // New avatar upload takes precedence
        if (newAvatarUpload?.rawFile) {
          return pipe(
            uploadImages(dataProvider)("actors", id, [
              {
                file: newAvatarUpload.rawFile,
                type: newAvatarUpload.rawFile.type,
              },
            ]),
            fp.TE.map((avatar) => avatar[0]),
          );
        }

        if (data?.avatar?.rawFile) {
          return pipe(
            uploadImages(dataProvider)("actors", id, [
              { file: data.avatar.rawFile, type: data.avatar.rawFile.type },
            ]),
            fp.TE.map((avatar) => avatar[0]),
          );
        }

        // Check if avatar is a UUID (selected existing media)
        if (Schema.is(UUID)(data.avatar)) {
          return fp.TE.right({ id: data.avatar });
        }

        // Check if avatar is an object with id (e.g., from Edit form)
        if (Schema.is(UUID)(data.avatar?.id)) {
          return fp.TE.right({ id: data.avatar.id });
        }

        return fp.TE.right(data.avatar);
      }),
      fp.TE.bind("avatarMedia", ({ avatar }) => {
        if (!avatar) {
          return fp.TE.right(null);
        }

        if (Schema.is(UUID)(avatar.id)) {
          return fp.TE.right({ id: avatar.id });
        }

        return pipe(
          fp.TE.tryCatch(
            () =>
              dataProvider.create("media", {
                data: {
                  ...avatar,
                  events: [],
                  links: [],
                  keywords: [],
                  areas: [],
                  label: data.fullName,
                  description: data.fullName,
                },
              }),
            toError,
          ),
          fp.TE.map((r) => r.data),
        );
      }),
      fp.TE.chainFirst(() =>
        pipe(
          newRelationsAsSource.map((r: any) =>
            fp.TE.tryCatch(() => {
              console.log("r", r);
              return dataProvider.create("actor-relations", {
                data: transformActorRelation({
                  ...r,
                  actor: { id },
                  relatedActor: { id: r.relatedActor },
                }),
              });
            }, toError),
          ),
          fp.TE.sequenceArray,
        ),
      ),
      fp.TE.map(({ avatarMedia }) => ({
        ...data,
        body: data.body,
        excerpt: data.excerpt,
        id,
        avatar: avatarMedia?.id,
        memberIn: (data.memberIn ?? []).concat(
          newMemberIn.map((m: any) => ({
            ...m,
            endDate: m.endDate !== "" ? m.endDate : undefined,
          })),
        ),
      })),
      throwTE,
    );
  };

const ActorCreate: React.FC<CreateProps> = (props) => {
  const dataProvider = useDataProvider();
  return (
    <Create
      {...props}
      title="Create an Actor"
      transform={(a) => transformActor(dataProvider)(uuid(), a)}
    >
      <SimpleForm>
        <SelectInput
          source="_from"
          choices={["wikipedia", "plain"].map((id) => ({ id, name: id }))}
          defaultValue="plain"
        />
        <FormDataConsumer>
          {({ formData }) => {
            if (formData._from === "wikipedia") {
              return <TextInput source="search" />;
            }

            return (
              <Grid container spacing={2}>
                <Grid
                  size={{ sm: 12, md: 6 }}
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <ColorInput
                    source="color"
                    defaultValue={generateRandomColor()}
                  />
                  <TextWithSlugInput source="fullName" slugSource="username" />
                  <DateInput source="bornOn" />
                  <DateInput source="diedOn" />
                  <ReferenceArrayNationInput
                    source="nationalities"
                    defaultValue={[]}
                  />
                </Grid>
                <Grid size={{ sm: 12, md: 6 }}>
                  <ReferenceMediaInputWithUpload
                    source="avatar"
                    uploadLabel="Upload avatar"
                    showPreview={false}
                    fullWidth
                  />
                </Grid>
                <Grid size={{ md: 12 }}>
                  <BlockNoteInput source="excerpt" onlyText={true} />
                  <BlockNoteInput source="body" />
                </Grid>
              </Grid>
            );
          }}
        </FormDataConsumer>
      </SimpleForm>
    </Create>
  );
};

export default ActorCreate;
