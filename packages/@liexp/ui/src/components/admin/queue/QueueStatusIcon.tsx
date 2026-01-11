import { type Status } from "@liexp/shared/lib/io/http/Queue/index.js";
import React from "react";
import { FAIcon, type FAIconProps } from "../../Common/Icons/index.js";

export const QueueStatusIcon: React.FC<{ status: Status }> = ({ status }) => {
  const icon = React.useMemo((): FAIconProps["icon"] => {
    switch (status) {
      case "done": {
        return "check";
      }
      case "pending": {
        return "clock";
      }
      case "processing": {
        return "spinner";
      }
      case "completed": {
        return "check-double";
      }
      case "failed": {
        return "exclamation";
      }
    }
  }, [status]);

  return <FAIcon icon={icon} />;
};
