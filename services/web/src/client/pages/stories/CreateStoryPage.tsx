import { GetAuthProvider } from "@liexp/ui/lib/client/api";
import ReactPageInput from "@liexp/ui/lib/components/admin/ReactPageInput.js";
import ReferenceMediaInput from "@liexp/ui/lib/components/admin/media/input/ReferenceMediaInput.js";
import {
  AdminContext,
  CreateBase,
  ResourceContextProvider,
  SimpleForm,
  TextInput,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { StoryRelationsBox } from "@liexp/ui/lib/components/admin/stories/StoryRelations.js";
import { Box, Container } from "@liexp/ui/lib/components/mui/index.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider";
import { i18nProvider } from "@liexp/ui/lib/i18n/i18n.provider.js";
import { styled, themeOptions } from "@liexp/ui/lib/theme/index.js";
import { type RouteComponentProps } from "@reach/router";
import * as React from "react";

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

const CreateStoryPage: React.FC<RouteComponentProps> = () => {
  // const navigateTo = useNavigateToResource();
  const apiProvider = useDataProvider();
  const authProvider = GetAuthProvider(apiProvider);
  return (
    <StyledContainer>
      <AdminContext
        dataProvider={apiProvider}
        authProvider={authProvider}
        i18nProvider={i18nProvider}
        theme={themeOptions}
      >
        <ResourceContextProvider value="stories">
          <CreateBase
            transform={(s) => ({
              ...s,
              // featuredImage: s.featuredImage?.id,
            })}
          >
            <SimpleForm className={classes.form}>
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

              <StoryRelationsBox />
            </SimpleForm>
          </CreateBase>
        </ResourceContextProvider>
      </AdminContext>
    </StyledContainer>
  );
};
export default CreateStoryPage;
