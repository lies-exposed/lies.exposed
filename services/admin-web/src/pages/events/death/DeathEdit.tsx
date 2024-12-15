import { EditEventForm } from "@liexp/ui/lib/components/admin/events/EditEventForm.js";
import { DeathEventEditFormTab } from "@liexp/ui/lib/components/admin/events/tabs/DeathEventEditFormTab.js";
import * as React from "react";

const DeathEdit: React.FC = () => {
  return <EditEventForm>{() => <DeathEventEditFormTab />}</EditEventForm>;
};

export default DeathEdit;
