import * as React from "react";
import { Form, TabbedFormTabs, TabbedFormView } from "react-admin";

export const StateTabbedForm: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  return (
    <Form formRootPathname="0">
      <TabbedFormView tabs={<TabbedFormTabs syncWithLocation={false} />}>
        {children}
      </TabbedFormView>
    </Form>
  );
};
