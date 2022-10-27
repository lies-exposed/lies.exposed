import { Edit, EditProps } from "ra-ui-materialui";
import * as React from "react";
import { Button, Grid } from "../../mui";

export interface EditFormProps extends EditProps {
  preview: React.ReactNode;
}

export const EditForm: React.FC<EditFormProps> = ({
  children,
  title,
  transform,
  actions,
  preview,
}) => {
  const [showPreview, setShowPreview] = React.useState(false);
  return (
    <Edit
      title={title}
      redirect={false}
      actions={actions}
      transform={transform}
    >
      <Grid container>
        <Grid item md={12}>
          <Button
            onClick={() => {
              setShowPreview(!showPreview);
            }}
          >
            {showPreview ? "Hide" : "Show"} Preview
          </Button>
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
