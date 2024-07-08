import { type Media } from '@liexp/shared/lib/io/http/index.js';
import * as React from "react";
import { Grid, Stack } from "../../mui/index.js";
import {
  Button,
  Edit,
  useDataProvider,
  useRecordContext,
  useRefresh,
  useResourceContext,
  type EditProps,
} from "../react-admin.js";
import { WebPreviewButton } from "./WebPreviewButton.js";

export interface EditFormProps extends EditProps {
  preview: React.ReactNode;
}

export const EditForm: React.FC<React.PropsWithChildren<EditFormProps>> = ({
  children,
  title,
  transform,
  actions,
  preview,
}) => {
  const [showPreview, setShowPreview] = React.useState(false);
  const resource = useResourceContext();
  return (
    <Edit
      title={title}
      redirect={false}
      actions={actions}
      transform={transform}
    >
      <Grid container>
        <Grid item md={12}>
          <Stack spacing={2} direction={"row"}>
            <Button
              label={`${showPreview ? "Hide" : "Show"} Preview`}
              onClick={() => {
                setShowPreview(!showPreview);
              }}
            />
            {resource && <WebPreviewButton resource={resource} source="id" />}
            <RestoreButton />
          </Stack>
        </Grid>
        <Grid item md={showPreview ? 6 : 12} lg={showPreview ? 6 : 12}>
          {children}
        </Grid>

        {showPreview ? (
          <Grid item md={6} lg={6}>
            {preview}
          </Grid>
        ) : null}
      </Grid>
    </Edit>
  );
};

const RestoreButton: React.FC = () => {
  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  const record = useRecordContext<Media.Media>();

  const handleOnClick = (record: Media.Media): void => {
    void dataProvider
      .update("media", {
        id: record.id,
        data: {
          ...record,
          restore: true,
        },
        previousData: record,
      })
      .then(() => {
        refresh();
      });
  };
  if (record?.deletedAt) {
    return (
      <Button label="Restore" variant="contained" onClick={() => handleOnClick(record)} />
    );
  }
  return null;
};
