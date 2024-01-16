import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type ResourcesNames } from "@liexp/shared/lib/io/http/index.js";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import * as React from "react";
import { authProvider } from "../../../client/api.js";
import { getAdminLink, getProfileLink } from "../../../utils/links.utils.js";
import { Link } from "../../mui/index.js";

interface EditButtonProps {
  admin?: boolean;
  resourceName: ResourcesNames;
  userResourceName?: ResourcesNames;
  resource: { id: string };
}

const EditButton: React.FC<EditButtonProps> = ({
  admin,
  resourceName,
  userResourceName = resourceName,
  resource,
}) => {
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(admin ?? null);

  React.useEffect(() => {
    if (admin === undefined) {
      void authProvider.checkAuth({}).then(
        async () => {
          const permissions = await authProvider.getPermissions({});
          setIsAdmin(checkIsAdmin(permissions));
        },
        (e) => {
          setIsAdmin(null);
        },
      );
    }
  }, []);

  if (isAdmin === null) {
    return null;
  }

  const href = isAdmin
    ? getAdminLink(resourceName, resource)
    : getProfileLink(userResourceName, resource);

  return (
    <Link href={href} target="_blank" rel="noreferrer">
      <FontAwesomeIcon icon="edit" />
    </Link>
  );
};

export default EditButton;
