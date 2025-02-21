import { fp } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { UUID, uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type Media } from "@liexp/shared/lib/io/http/Media/Media.js";
import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { generateRandomColor } from "@liexp/shared/lib/utils/colors.js";
import { contentTypeFromFileExt } from "@liexp/shared/lib/utils/media.utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { uploadImages } from "@liexp/ui/lib/client/admin/MediaAPI.js";
import BlockNoteInput from "@liexp/ui/lib/components/admin/BlockNoteInput.js";
import { ColorInput } from "@liexp/ui/lib/components/admin/common/inputs/ColorInput.js";
import { TextWithSlugInput } from "@liexp/ui/lib/components/admin/common/inputs/TextWithSlugInput.js";
import {
  Create,
  DateInput,
  FormDataConsumer,
  ImageField,
  ImageInput,
  type RaRecord,
  SelectInput,
  SimpleForm,
  TextInput,
  type CreateProps,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { Grid } from "@liexp/ui/lib/components/mui/index.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import { toError } from "fp-ts/lib/Either";
import type * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function";
import * as t from "io-ts";
import * as React from "react";

export const transformActor =
  (dataProvider: APIRESTClient) =>
  async (
    id: string,
    { newMemberIn = [], ...data }: RaRecord<UUID>,
  ): Promise<RaRecord> => {
    if (data._from === "wikipedia") {
      return data;
    }

    return pipe(
      fp.TE.Do,
      fp.TE.bind("avatar", (): TE.TaskEither<Error, Partial<Media>[]> => {
        if (data.avatar?.rawFile) {
          return pipe(
            uploadImages(dataProvider)("actors", id, [
              { file: data.avatar.rawFile, type: data.avatar.rawFile.type },
            ]),
          );
        }

        if (t.string.is(data.avatar)) {
          return fp.TE.right([
            {
              location: data.avatar as URL,
              type: contentTypeFromFileExt(data.avatar),
            },
          ]);
        }

        return fp.TE.right([data.avatar]);
      }),
      fp.TE.bind("avatarMedia", ({ avatar }) => {
        if (UUID.is(avatar[0].id)) {
          return fp.TE.right({ id: avatar[0].id });
        }
        return pipe(
          fp.TE.tryCatch(
            () =>
              dataProvider.create("media", {
                data: {
                  ...avatar[0],
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
      fp.TE.map(({ avatarMedia }) => ({
        ...data,
        body: data.body,
        excerpt: data.excerpt,
        id,
        avatar: avatarMedia.id,
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
                  item
                  md={6}
                  sm={12}
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <ColorInput
                    source="color"
                    defaultValue={generateRandomColor()}
                  />
                  <TextWithSlugInput source="fullName" slugSource="username" />
                  <DateInput source="bornOn" />
                  <DateInput source="diedOn" />
                </Grid>
                <Grid item md={6} sm={12}>
                  <ImageInput source="avatar">
                    <ImageField source="thumbnail" />
                  </ImageInput>
                </Grid>
                <Grid item md={12}>
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
