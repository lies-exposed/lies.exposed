import { ResourcesNames } from "@econnessione/shared/io/http";
import { getAdminLink } from "@econnessione/ui/utils/links.utils";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "@material-ui/core";
import * as React from "react";

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
      <FontAwesomeIcon icon={faEdit} />
    </Link>
  );
};

export default EditButton;
