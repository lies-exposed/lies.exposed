import { EditEventForm } from "@liexp/ui/lib/components/admin/events/EditEventForm.js";
import { BookEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/BookEditFormTab.js";
import * as React from "react";

const BookEdit: React.FC = () => {
  return <EditEventForm>{(props) => <BookEditFormTab />}</EditEventForm>;
};

export default BookEdit;
