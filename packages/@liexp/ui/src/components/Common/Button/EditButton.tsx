import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ResourcesNames } from "@liexp/shared/io/http";
import { Link } from "@material-ui/core";
import * as React from "react";
import { getAdminLink } from "../../../utils/links.utils";

interface EditButtonProps {
  resourceName: ResourcesNames;
  resource: { id: string };
}

const EditButton: React.FC<EditButtonProps> = (props) => {
  return (
    <Link
      href={getAdminLink(props.resourceName, props.resource)}
      target="_blank"
    >
      <FontAwesomeIcon icon="edit" />
    </Link>
  );
};

export default EditButton;
