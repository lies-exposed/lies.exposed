import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { checkIsAdmin } from "@liexp/shared/utils/user.utils";
import { type UUID } from "io-ts-types/lib/UUID";
import * as React from "react";
import { authProvider } from "../../../client/api";
import { getAdminLink } from "../../../utils/links.utils";
import { EditEventModal } from "../../Modal/EditEventModal";
import { Link } from "../../mui";

interface EditEventButtonProps {
  admin?: boolean;
  id: UUID;
}

const EditEventButton: React.FC<EditEventButtonProps> = ({ admin, id }) => {
  const [isAdmin, setIsAdmin] = React.useState<boolean | null>(admin ?? null);

  const [open, setOpen] = React.useState(false);
  const doClose = (): void => {
    setOpen(false);
  };

  React.useEffect(() => {
    if (admin === undefined) {
      void authProvider.checkAuth({}).then(
        async () => {
          const permissions = await authProvider.getPermissions({});
          setIsAdmin(checkIsAdmin(permissions ?? []));
        },
        (e) => {
          // eslint-disable-next-line no-console
          console.error(e);
          setIsAdmin(null);
        }
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
        href: getAdminLink("events", { id }),
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
