import * as React from "react";
import { Grid, Stack } from "../../mui/index.js";
import {
  Button,
  Edit,
  type EditProps,
  type RaRecord,
  useDataProvider,
  useRecordContext,
  useRefresh,
  useResourceContext,
  useResourceDefinition,
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
  const resourceInfo = useResourceDefinition();

  return (
    <Edit
      {...props}
      title={title}
      redirect={false}
      actions={actions}
      transform={transform}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          marginTop: "0",
        }}
      >
        <Grid
          container
          width="100%"
          justifyContent="space-between"
          alignItems="start"
          size={12}
          spacing={1}
          sx={{ flex: "0 0 auto", pb: 1 }}
        >
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack direction={"row"} padding={1} gap={1} flexWrap="wrap">
              {resource && <WebPreviewButton resource={resource} source="id" />}
              <RestoreButton resource={resourceInfo.name} />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Stack
              alignItems={{ xs: "flex-start", sm: "flex-end" }}
              padding={1}
            >
              <Button
                label={`${showPreview ? "Hide" : "Show"} Preview`}
                onClick={() => {
                  if (preview) {
                    setShowPreview(!showPreview);
                  }
                }}
              />
            </Stack>
          </Grid>
        </Grid>
        <Grid
          container
          width="100%"
          size={12}
          spacing={1}
          sx={{ flex: "1 1 auto", minHeight: 0 }}
        >
          <Grid
            size={{
              xs: 12,
              md: showPreview ? 6 : 12,
              lg: showPreview ? 6 : 12,
              xl: showPreview ? 6 : 12,
            }}
            sx={{ minHeight: 0 }}
          >
            {children}
          </Grid>
          {showPreview ? (
            <Grid
              size={{
                xs: 12,
                md: 6,
                lg: 6,
                xl: 6,
              }}
              sx={{ minHeight: 0 }}
            >
              <div
                style={{
                  height: "100%",
                }}
              >
                {preview}
              </div>
            </Grid>
          ) : null}
        </Grid>
      </div>
    </Edit>
  );
};

const RestoreButton: React.FC<{ resource: string }> = ({ resource }) => {
  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  const record = useRecordContext();

  const handleOnClick = (record: RaRecord): void => {
    void dataProvider
      .update(resource, {
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
