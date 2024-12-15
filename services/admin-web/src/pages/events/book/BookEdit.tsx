import { EditEventForm } from "@liexp/ui/lib/components/admin/events/EditEventForm.js";
import { BookEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/BookEditFormTab.js";
import { transformEvent } from "@liexp/ui/lib/components/admin/transform.utils.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import * as React from "react";

const BookEdit: React.FC = () => {
  const dataProvider = useDataProvider();
  return (
    <EditEventForm
      transform={(data: any) => transformEvent(dataProvider)(data.id, data)}
    >
      {(props) => <BookEditFormTab />}
    </EditEventForm>
  );
};

export default BookEdit;
