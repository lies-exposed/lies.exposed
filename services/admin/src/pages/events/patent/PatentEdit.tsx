import { EditEventForm } from "@liexp/ui/lib/components/admin/events/EditEventForm.js";
import { PatentEventEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/PatentEventEditTab.js";
import * as React from "react";

const PatentEdit: React.FC = () => {
  return <EditEventForm>{() => <PatentEventEditFormTab />}</EditEventForm>;
};

export default PatentEdit;
