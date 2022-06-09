import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ResourcesNames } from "@liexp/shared/io/http";
import * as React from "react";
import { getAdminLink } from "../../../utils/links.utils";
import { Link } from "../../mui";

interface EditButtonProps {
  resourceName: ResourcesNames;
  resource: { id: string };
}

const EditButton: React.FC<EditButtonProps> = (props) => {
  return (
    <Link
      href={getAdminLink(props.resourceName, props.resource)}
      target="_blank"
      rel="noreferrer"
    >
      <FontAwesomeIcon icon="edit" />
    </Link>
  );
};

export default EditButton;
