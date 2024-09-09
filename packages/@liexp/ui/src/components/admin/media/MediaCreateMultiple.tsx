import { parseURL } from "@liexp/shared/lib/helpers/media.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  ImageType,
  MP3Type,
  MP4Type,
  OGGType,
  PDFType,
} from "@liexp/shared/lib/io/http/Media.js";
import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import {
  ArrayInput,
  Button,
  FileField,
  FileInput,
  Form,
  SimpleFormIterator,
  TextInput,
  required,
  useRedirect,
  type RaRecord,
} from "react-admin";
import { useDropzone } from "react-dropzone";
import { useForm } from "react-hook-form";
import { uploadFile } from "../../../client/admin/MediaAPI.js";
import { useDataProvider } from "../../../hooks/useDataProvider.js";
import { styled } from "../../../theme/index.js";
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Icons,
  alpha,
} from "../../mui/index.js";

const transformMedia =
  (apiProvider: APIRESTClient) =>
  async (data: RaRecord): Promise<RaRecord> => {
    const mediaTask =
      data._type === "fromFile" && data.location.rawFile
        ? uploadFile(apiProvider)(
            "media",
            data.id.toString(),
            data.location.rawFile,
            data.location.rawFile.type,
          )
        : data._type === "fromURL" && data.url
          ? TE.fromEither(parseURL(data.url))
          : TE.right({ type: data.type, location: data.location });

    const events = (data.events ?? []).concat(data.newEvents ?? []);
    const links = (data.links ?? []).concat(
      (data.newLinks ?? []).flatMap((l: any) => l.ids),
    );
    const keywords = (data.keywords ?? []).concat(data.newKeywords ?? []);
    const areas = (data.areas ?? []).concat(data.newAreas ?? []);

    return pipe(
      mediaTask,
      TE.map((media) => ({
        ...data,
        id: data.id.toString(),
        ...media,
        events,
        links,
        keywords,
        areas,
      })),
      throwTE,
    );
  };

const PREFIX = "create-media-form";

const classes = {
  root: `${PREFIX}-root`,
  formIterator: `${PREFIX}-form-iterator`,
  dropArea: `${PREFIX}-drop-area`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {},
  [` .${classes.formIterator} ul li section`]: {
    display: "flex",
    flexDirection: "row",
  },
  [` .${classes.dropArea}`]: {
    width: "100%",
    minHeight: "50%",
    padding: theme.spacing(3),
    textAlign: "center",
    background: alpha(theme.palette.secondary.light, 0.4),
  },
}));

const defaultMultipleMediaFormValues: { files: any[] } = {
  files: [],
};
export const MediaCreateMany: React.FC<any> = (props) => {
  const apiProvider = useDataProvider();
  const redirect = useRedirect();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { reset, getValues } = useForm({
    defaultValues: defaultMultipleMediaFormValues,
  });

  const onDrop = (newFiles: File[], rejectedFiles: any[], event: any): void => {
    const record = getValues();
    const updatedFiles = [
      ...record.files,
      ...newFiles
        .filter((f) => !record.files.some((ff) => ff.description === f.name))
        .map((f) => ({
          description: f.name,
          type: f.type,
          location: { src: f, title: f.name },
        })),
    ];

    reset({ ...record, files: updatedFiles });
  };

  const { isDragActive, getRootProps } = useDropzone({
    accept: [
      ...ImageType.types.map((t) => t.value),
      PDFType.value,
      MP4Type.value,
      MP3Type.value,
      OGGType.value,
    ].reduce((acc, k) => ({ ...acc, [k]: [] }), {}),
    multiple: true,
    onDrop,
  });

  const uploadMedia = async (files: any[], uploaded: any[]): Promise<any[]> => {
    const [first, ...rest] = files;
    if (first) {
      const media = await transformMedia(apiProvider)(first).then((m) =>
        apiProvider.create("media", { data: m }).then((r) => r.data),
      );

      const record = getValues();
      reset({
        files: record.files.filter((f) => f.description !== media.description),
      });

      return uploadMedia(rest ?? [], [...uploaded, media]);
    }
    return uploaded;
  };

  const onSubmit = async (data: any): Promise<void> => {
    setIsSubmitting(true);

    const files = data.files.map(({ location, ...f }: any) => ({
      ...f,
      id: uuid(),
      _type: "fromFile",
      location: { rawFile: location.src },
    }));
    const media = await uploadMedia(files, []);

    setIsSubmitting(false);

    redirect(
      `/media?filter=${JSON.stringify({ ids: media.map((m) => m.id) })}`,
    );
  };

  return (
    <StyledBox className={classes.root} {...getRootProps({})}>
      <Form record={getValues()} onSubmit={onSubmit}>
        <div {...getRootProps({ className: classes.dropArea })}>
          <p>{isDragActive ? "Drop files here" : "Drag and drop files here"}</p>
        </div>
        <Card>
          <CardContent>
            <ArrayInput source="files">
              <SimpleFormIterator className={classes.formIterator}>
                <FileInput source="location">
                  <FileField source="src" title="title" />
                </FileInput>
                <TextInput
                  source="description"
                  multiline
                  fullWidth
                  validate={[required()]}
                />
              </SimpleFormIterator>
            </ArrayInput>
          </CardContent>
          <CardActionArea>
            <CardActions>
              <Box>
                <Button
                  startIcon={<Icons.ContentSave />}
                  disabled={isSubmitting}
                  label="Save"
                  onClick={() => {
                    void onSubmit(getValues());
                  }}
                />
              </Box>
            </CardActions>
          </CardActionArea>
        </Card>
      </Form>
    </StyledBox>
  );
};
