import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { checkIsAdmin } from "@liexp/shared/lib/utils/user.utils.js";
import { type UUID } from "io-ts-types/lib/UUID.js";
import { useAuthProvider } from "ra-core";
import * as React from "react";
import { useConfiguration } from "../../../context/ConfigurationContext.js";
import { getAdminLink } from "../../../utils/links.utils.js";
import { EditEventModal } from "../../Modal/EditEventModal.js";
import { Link } from "../../mui/index.js";

interface EditEventButtonProps {
  admin?: boolean;
  id: UUID;
}

const EditEventButton: React.FC<EditEventButtonProps> = ({ admin, id }) => {
  const conf = useConfiguration();
  const authProvider = useAuthProvider();

  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(admin ?? null);

  const [open, setOpen] = React.useState(false);
  const doClose = (): void => {
    setOpen(false);
  };

  React.useEffect(() => {
    if (admin === undefined) {
      void authProvider?.checkAuth({}).then(
        async () => {
          const permissions = await authProvider.getPermissions({});
          setIsAdmin(checkIsAdmin(permissions ?? []));
        },
        () => {
          setIsAdmin(null);
        },
      );
    }
  }, []);

  if (isAdmin === null) {
    return null;
  }

  const linkProps = isAdmin
    ? {
        target: "_blank",
        rel: "noreferrer",
        href: getAdminLink(conf)("events", { id }),
      }
    : {
        target: "_self",
        rel: "noreferrer",
        href: "#",
        onClick: (e: any) => {
          e.preventDefault();
        },
      };

  return (
    <Link {...linkProps}>
      <FontAwesomeIcon
        icon="edit"
        onClick={() => {
          setOpen(true);
        }}
      />
      {!isAdmin ? (
        <EditEventModal id={id} open={open} onClose={doClose} />
      ) : null}
    </Link>
  );
};

export default EditEventButton;
