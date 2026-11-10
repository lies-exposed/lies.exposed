import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import {
  ImageType,
  MP3Type,
  MP4Type,
  OGGType,
  PDFType,
  type MediaType,
} from "@liexp/io/lib/http/Media/MediaType.js";
import { parseURL } from "@liexp/shared/lib/helpers/media.helper.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { type APIRESTClient } from "@ts-endpoint/react-admin";
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
import {
  uploadFile,
  type UploadFileOptions,
} from "../../../client/admin/MediaAPI.js";
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
import { useProgressBar } from "../common/ProgressBar.js";

interface MediaFormData {
  description: string;
  type: string;
  location: {
    src: File;
    title: string;
  };
  id?: string;
  _type?: "fromFile" | "fromURL";
  url?: string;
  events?: string[];
  links?: string[];
  newLinks?: { ids: string[] }[];
  keywords?: string[];
  newKeywords?: string[];
  areas?: string[];
  newAreas?: string[];
  newEvents?: string[];
}

interface UploadedMedia extends RaRecord {
  type: string;
  location: { type: string };
  events?: string[];
  links?: string[];
  keywords?: string[];
  areas?: string[];
}

const transformMedia =
  (apiProvider: APIRESTClient) =>
  async (data: MediaFormData, options: UploadFileOptions): Promise<UploadedMedia> => {
    const loc = data.location as { src?: File; rawFile?: File; title?: string };
    const file = loc.rawFile ?? loc.src;
    const mediaTask =
      data._type === "fromFile" && file
        ? uploadFile(apiProvider)(
            "media",
            data.id?.toString() ?? "",
            file,
            file.type as MediaType,
            options,
          )
        : data._type === "fromURL" && data.url
          ? TE.fromEither(parseURL(data.url))
          : TE.right({ type: data.type as MediaType, location: data.location });

    const events = (data.events ?? []).concat(data.newEvents ?? []);
    const links = (data.links ?? []).concat(
      (data.newLinks ?? []).flatMap((l) => l.ids),
    );
    const keywords = (data.keywords ?? []).concat(data.newKeywords ?? []);
    const areas = (data.areas ?? []).concat(data.newAreas ?? []);

    return pipe(
      mediaTask as TE.TaskEither<unknown, { type: MediaType; location: { src: File; title: string } }>,
      TE.map((media) => ({
        ...data,
        id: data.id ?? "",
        ...media,
        type: media.type as string,
        events,
        links,
        keywords,
        areas,
      }) as unknown as UploadedMedia),
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

const defaultMultipleMediaFormValues: { files: MediaFormData[] } = {
  files: [],
};
export const MediaCreateMany: React.FC<Record<string, never>> = (_props) => {
  const apiProvider = useDataProvider();
  const redirect = useRedirect();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { bar, onUploadProgress } = useProgressBar();

  const { reset, getValues } = useForm({
    defaultValues: defaultMultipleMediaFormValues,
  });

  const { isDragActive, getRootProps } = useDropzone({
    accept: [
      ...ImageType.members.map((t) => t.literals[0]),
      PDFType.literals[0],
      MP4Type.literals[0],
      MP3Type.literals[0],
      OGGType.literals[0],
    ].reduce((acc, k) => ({ ...acc, [k]: [] }), {}),
    multiple: true,
    onDrop: (newFiles, _rejectedFiles, _event) => {
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
    },
  });

  const uploadMedia = async (files: MediaFormData[], uploaded: UploadedMedia[]): Promise<UploadedMedia[]> => {
    const [first, ...rest] = files;
    if (first) {
      const media = await transformMedia(apiProvider)(first, {
        onUploadProgress,
      }).then((m) =>
        apiProvider.create("media", { data: m }).then((r) => r.data as UploadedMedia),
      );

      const record = getValues();
      reset({
        files: record.files.filter((f) => f.description !== media.description),
      });

      return uploadMedia(rest ?? [], [...uploaded, media]);
    }
    return uploaded;
  };

  const onSubmit = async (data: { files: MediaFormData[] }): Promise<void> => {
    setIsSubmitting(true);

    const files: MediaFormData[] = data.files.map(({ location, ...f }) => ({
      ...f,
      id: uuid(),
      _type: "fromFile",
      location: { rawFile: location.src } as any,
    }));
    const media = await uploadMedia(files, []);

    setIsSubmitting(false);

    redirect(
      `/media?filter=${JSON.stringify({ ids: media.map((m) => m.id) })}`,
    );
  };

  return (
    <StyledBox className={classes.root} {...getRootProps({})}>
      <Form record={getValues()} onSubmit={onSubmit as any}>
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
            {bar}
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
