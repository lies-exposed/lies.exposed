import { ErrorBox } from "@liexp/ui/lib/components/Common/ErrorBox";
import { FullSizeLoader } from "@liexp/ui/lib/components/Common/FullSizeLoader";
import {
  SaveContextProvider,
  useGetOne,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import { UserEditForm } from "@liexp/ui/lib/components/admin/user/UserEdit";
import { Card, Container } from "@liexp/ui/lib/components/mui/index.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import * as React from "react";

export const UserEditMe: React.FC = (props) => {
  const { isLoading, data, isError, error } = useGetOne("users", { id: "me" });
  const dataProvider = useDataProvider();
  const [saving, setSaving] = React.useState(false);
  const save = (record: any): void => {
    setSaving(true);
    void dataProvider
      .update("users", { id: "me", data: record, previousData: data })
      .finally(() => {
        setSaving(false);
      });
  };
  const mutationMode = "pessimistic";

  if (isLoading) {
    return <FullSizeLoader />;
  }

  if (isError) {
    return <ErrorBox error={error} resetErrorBoundary={() => {}} />;
  }

  return (
    <SaveContextProvider value={{ mutationMode, save, saving }}>
      <Container>
        <Card>
          <UserEditForm record={data} />
        </Card>
      </Container>
    </SaveContextProvider>
  );
};
