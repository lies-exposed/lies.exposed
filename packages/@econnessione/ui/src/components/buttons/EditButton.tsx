import { ResourcesNames } from "@econnessione/shared/io/http";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "@material-ui/core";
import * as React from "react";
import { getAdminLink } from "../../utils/links.utils";

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
