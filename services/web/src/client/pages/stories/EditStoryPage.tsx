import "@liexp/ui/assets/react-page.css";
import { apiProvider, authProvider } from "@liexp/ui/lib/client/api.js";
import { FullSizeLoader } from "@liexp/ui/lib/components/Common/FullSizeLoader.js";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput.js";
import ReferenceMediaInput from "@liexp/ui/lib/components/admin/media/input/ReferenceMediaInput.js";
import {
  AdminContext,
  EditBase,
  SimpleForm,
  TextInput,
  useUpdate,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { Box, Container } from "@liexp/ui/lib/components/mui/index.js";
import { i18nProvider } from "@liexp/ui/lib/i18n/i18n.provider.js";
import { styled, themeOptions } from "@liexp/ui/lib/theme/index.js";
import { type RouteComponentProps } from "@reach/router";
import * as React from "react";
import { useNavigate } from "react-router-dom";

const PREFIX = "create-story-page";
const classes = {
  root: `${PREFIX}-root`,
  form: `${PREFIX}-form`,
  input: `${PREFIX}-input`,
};

const StyledContainer = styled(Container)(({ theme }) => ({
  [`.${classes.root}`]: {},
  [`& .${classes.form}`]: {},
  [`& .${classes.input}`]: {
    fieldset: {
      border: "none",
    },
  },
}));

const EditStoryPageContent: React.FC<{ id?: string }> = ({ id }) => {
  const [update, { isLoading: isSubmitting }] = useUpdate();
  const navigate = useNavigate();
  const onSubmit = async (data: any): Promise<void> => {
    await update(
      "stories",
      { id, data },
      {
        onSuccess: (d) => {
          navigate(`/stories/${d.path}`);
        },
      },
    );
  };
  return (
    <EditBase id={id} resource="stories">
      <SimpleForm className={classes.form} onSubmit={onSubmit}>
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            marginBottom: 24,
            width: "100%",
          }}
        >
          <TextInput className={classes.input} source="title" fullWidth />
          <TextInput className={classes.input} source="slug" fullWidth />
        </Box>
        <ReferenceMediaInput
          source="featuredImage.id"
          allowedTypes={["image/jpg"]}
        />
        <ReactPageInput className={classes.input} source="body2" />
      </SimpleForm>
      {isSubmitting ? <FullSizeLoader /> : null}
    </EditBase>
  );
};

const EditStoryPage: React.FC<RouteComponentProps<{ storyId: string }>> = ({
  storyId: id,
}) => {
  return (
    <StyledContainer>
      <AdminContext
        dataProvider={apiProvider}
        authProvider={authProvider}
        i18nProvider={i18nProvider}
        theme={themeOptions}
      >
        <EditStoryPageContent id={id} />
      </AdminContext>
    </StyledContainer>
  );
};

export default EditStoryPage;
