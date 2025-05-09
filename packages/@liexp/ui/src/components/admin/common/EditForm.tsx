import { type Media } from "@liexp/shared/lib/io/http/index.js";
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
  ...props
}) => {
  const [showPreview, setShowPreview] = React.useState(false);
  const resource = useResourceContext();

  return (
    <Edit
      {...props}
      title={title}
      redirect={false}
      actions={actions}
      transform={transform}
    >
      <Grid container direction="column" width="100%">
        <Grid size={12}>
          <Grid container width={"100%"}>
            <div>
              <Grid
                container
                size={12}
                direction="row"
                justifyContent="space-between"
              >
                <Grid size={{ md: 6, lg: 6 }}>
                  <Stack direction={"row"}>
                    {resource && (
                      <WebPreviewButton resource={resource} source="id" />
                    )}
                    <RestoreButton />
                  </Stack>
                </Grid>
                <Grid size={{ md: 6, lg: 6 }}>
                  <Stack alignItems={"flex-end"}>
                    <Button
                      label={`${showPreview ? "Hide" : "Show"} Preview`}
                      onClick={() => {
                        setShowPreview(!showPreview);
                      }}
                    />
                  </Stack>
                </Grid>
              </Grid>
            </div>
          </Grid>
        </Grid>
        <Grid size={12}>
          <Grid container width={"100%"}>
            <div style={{ width: "100%" }}>
              <Grid container width={"100%"} direction={"row"}>
                <Grid
                  size={{
                    md: showPreview ? 6 : 12,
                    lg: showPreview ? 8 : 12,
                    xl: showPreview ? 8 : 12,
                  }}
                  style={{
                    width: !showPreview ? "100%" : undefined,
                  }}
                >
                  {children}
                </Grid>
                {showPreview && !!preview ? (
                  <Grid size={{ md: 6, lg: 4 }}>{preview}</Grid>
                ) : null}
              </Grid>
            </div>
          </Grid>
        </Grid>
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
      <Button
        label="Restore"
        variant="contained"
        onClick={() => handleOnClick(record)}
      />
    );
  }
  return null;
};
